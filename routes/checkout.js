var express = require('express');
var router = express.Router();
var db = require('../models');
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const CartService = require("../services/CartService")
const cartService = new CartService(db);
const UserService = require("../services/UserService");
const userService = new UserService(db);
const OrderService = require('../services/OrderService');
const orderService = new OrderService(db);
const {isAuth, isAdmin} = require('../middleware/middleware');



router.get('/', isAuth, async function(req, res, next) {
    /*  
  #swagger.tags = ['Checkout and Orders']
  #swagger.summary = "View your users own order"
  #swagger.description = "You need to execute /auth/login as a regular USER first. You can use the user created when executing /auth/register.<br><br/> <br> Add product to users cart to get successfull result <br/>"
  #swagger.produces = ['json']
  #swagger.responses[200] = { description: "OK"}
  #swagger.responses[404] = { description: "Not found: No order found"}
  #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view order" }
  */
  try {
    const userId = req.user.id;

    const orders = await orderService.getOrdersByUserId(userId);

    if (orders.length === 0) {
      return res.status(404).json({ status: 404, message: 'No orders found' });
    }

    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const orderProducts = await orderService.getOrderProductsByOrderId(order.id);
        const productIds = orderProducts.map((orderProduct) => orderProduct.productId);

        const products = await productService.getProductsByIds(productIds);

        const formattedProducts = products.map((product) => ({
          id: product.id,
          imgurl: product.imgurl,
          name: product.name,
          price: orderProducts.find((op) => op.productId === product.id).price,
          quantity: orderProducts.find((op) => op.productId === product.id).quantity,
          brandName: product.brand.name,
          categoryName: product.category.name
        }));

        const orderStatus = await orderService.getOrderStatusById(order.statusId);

        return {
          orderId: order.id,
          status: orderStatus.name,
          products: formattedProducts,
          totalPrice: order.totalPrice,
        };
      })
    );

    res.status(200).json({ status: 200, result: orderDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

router.post('/now', isAuth, async (req, res, next) => {
  /*
  #swagger.tags = ['Checkout and Orders']
  #swagger.summary = "Checks out users cart"
  #swagger.description = "You need to execute /auth/login as a regular USER first. You can use the user created when executing /auth/register. <br><br/> <br> Add product to users cart to get successfull result <br/>"
  #swagger.produces = ['json']
    #swagger.responses[201] = { description: "Created: Order created successfully" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties or values" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[404] = { description: "Not found: No products found in cart or membership not found" }
    #swagger.responses[500] = { description: "Internal Server Error: Error occurred while trying to check out cart" }
    */
  try {
    const userId = req.user.id;
    const cart = await cartService.getUsersCart(userId);
    const cartId = cart.id
    const cartProducts = await cartService.getAllCartProducts(cartId)
    const allPrices = cartProducts.map(product => parseFloat(product.price) * parseFloat(product.quantity));

    if (cartProducts.length == 0) {
      return res.status(404).json({ status: 404, message: "No products found in cart" })
    }

    const totalPrice = allPrices.reduce((accumulator, currentValue) => accumulator + currentValue);

    if (isNaN(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ status: 400, message: "Invalid total price for the order." });
    }

    const statusname = "In progress"

    const status = await orderService.getStatusByName(statusname)
    const statusId = status.id;

    const user = await userService.getUserById(userId);
    const membership = await userService.getMembershipById(user.membershipId);

    if (!membership) {
      return res.status(404).json({ status: 404, message: "User's membership not found. Please contact customer service" });
    }

    let orderNumber;
    let isUnique = false;

    while (!isUnique) {
      orderNumber = generateOrderNumber(8);

      const existingOrder = await orderService.getOrderByOrderNumber(orderNumber)
      isUnique = !existingOrder;
    }

    const order = await orderService.createOrder(userId, totalPrice, orderNumber, statusId, membership.name);
    const orderId = order.id

    for (const cartProduct of cartProducts) {
      const { price, quantity, productId } = cartProduct;

      await orderService.createOrderProduct(orderId, price, quantity, productId);
    }

    await productService.updateProductQuantities(cartProducts); // Subtract quantity from products table

    const quantity = cartProducts.map(product => parseFloat(product.quantity))
    const totalQuantity = quantity.reduce((accumulator, currentValue) => accumulator + currentValue);
    const currentTotalProductsPurchased = await userService.getTotalProductsPurchased(userId);

    await userService.updateTotalProductsPurchased(userId, currentTotalProductsPurchased + totalQuantity);

    const updatedTotalProductsPurchased = await userService.getTotalProductsPurchased(userId);

    let newMembershipId;
    if (updatedTotalProductsPurchased >= 30) {
      newMembershipId = 3; // Gold Membership
    } else if (updatedTotalProductsPurchased >= 15) {
      newMembershipId = 2; // Silver Membership
    } else {
      newMembershipId = 1; // Bronze Membership
    }

    await userService.updateMembershipId(userId, newMembershipId);

    for (const cartProduct of cartProducts) {
      await cartService.deleteCartProduct(cartProduct.productId);
    }

    res.status(200).json({ status: 201, message: "Order created successfully. Order Number: " + orderNumber });
  } catch (error) {
    console.error("Error during order processing:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});


function generateOrderNumber(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

module.exports = router;



