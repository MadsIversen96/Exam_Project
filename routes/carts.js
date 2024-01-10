var express = require('express');
var router = express.Router();
var db = require('../models');
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const CartService = require("../services/CartService")
const cartService = new CartService(db);
const UserService = require("../services/UserService");
const userService = new UserService(db);
const {isAuth, isAdmin} = require('../middleware/middleware');


/* GET users listing. */
// Views the users cart products
router.get('/', isAuth, async function(req, res, next) {
  /*  
  #swagger.tags = ['Users Cart']
  #swagger.summary = "View the users cart"
  #swagger.description = "You need to execute /auth/login as a regular USER first. You can use the user created when executing /auth/register."
  #swagger.produces = ['json']
  #swagger.responses[200] = { description: "OK"}
  #swagger.responses[404] = { description: "Not found: No products found in Cart"}
  #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view cart" }
  */
  try{
    const userId = req.user.id;
    const cart = await cartService.getUsersCart(userId);
    if(cart.length == 0) {
      return res.status(404).json({ status: 404, message: 'No carts found'});
    }
    const cartId = cart.id
    const cartProducts = await cartService.getAllCartProducts(cartId)
    if (cartProducts.length == 0){
      return res.status(404).json({ status: 404, message: 'No products found in your cart'});
    }

    const productIds = cartProducts.map(product => product.productId);
    const products = await productService.getProductsByIds(productIds);

    const combinedProducts = products.map(product => ({
      id: product.id,
      imgurl: product.imgurl,
      name: product.name,
      description: product.description,
      price: cartProducts.find(cp => cp.productId === product.id).price,
      quantity: cartProducts.find(cp => cp.productId === product.id).quantity,
      brandName: product.brand ? product.brand.name : '', 
      categoryName: product.category ? product.category.name : '',
    }))

    res.status(200).json({ status: 200, result: combinedProducts});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'An error occurred while trying to view cart' });
  }
});

router.post('/:productId', isAuth, async (req, res) => {
  /*
   #swagger.tags = ['Users Cart']
    #swagger.summary = "Add an item to users cart"
    #swagger.description = "You need to execute /auth/login as a regular USER first. You can use the user created when executing /auth/register."
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/PostCartitem" }
    }
    #swagger.responses[201] = { description: "Created: Product added to cart" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties or values" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[404] = { description: "Not found: Product you try to add was not found" }
    #swagger.responses[500] = { description: "Internal Server Error: Error occurred while trying to add item to cart" }
    */
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ status: 404, message: 'Product not found' });
    }

    if (product.isDeleted == true) {
      return res.status(400).json({ status: 400, message: 'You cant add a deleted item' });
    }

    const invalidProperties = Object.keys(req.body).filter(prop => !['quantity'].includes(prop));
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}` });
    }

    if (!quantity) {
      return res.status(400).json({ status: 400, message: 'Quantity is missing' });
    }
    
    if (typeof quantity !== 'number') {
      return res.status(400).json({ status: 400, message: 'Quantity should be a number' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ status: 400, message: 'Quantity should be a positive integer' });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ status: 400, message: 'Not enough in stock' });
    }

    const userId = req.user.id;
    const cart = await cartService.getUsersCart(userId);

    if (!cart || !cart.id) {
      return res.status(404).json({ status: 404, message: 'Cart not found' });
    }

    const existingCartProduct = await cartService.getCartProduct(cart.id, productId);

    if (existingCartProduct) {

      const newQuantity = existingCartProduct.quantity + quantity;

      if(newQuantity > product.quantity){
        return res.status(401).json({ status: 400, message: 'Not enough in stock' });
      }

      await cartService.updateCartProductQuantity(cart.id, productId, newQuantity);
    } else {

      const user = await userService.getUserById(userId)
      const membership = await userService.getMembershipById(user.membershipId)
      console.log(user.id)
      console.log("Membership discount:" + membership.discount)
      const discountedPrice = product.price - (product.price * (membership.discount / 100));
      
      await cartService.addToCart(discountedPrice, quantity, cart.id, productId);
    }

    return res.status(201).json({ status: 201, message: 'Created: Product added to the cart successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error: Error occurred while trying to add item to cart' });
  }
});

router.put('/:productId', isAuth, async (req, res) => {
   /*
   #swagger.tags = ['Users Cart']
    #swagger.summary = "Update quantity of item in users cart"
    #swagger.description = "You need to execute /auth/login as a regular USER first. You can use the user created when executing /auth/register."
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/UpdateCartitem" }
    }
    #swagger.responses[201] = { description: "Created: Product quantity updated successfully" }
    #swagger.responses[401] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[404] = { description: "Not Found: Product or cart not found" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[500] = { description: "Internal Server Error: Error occurred while trying to update quantity of item" }
    */
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    const invalidProperties = Object.keys(req.body).filter(prop => !['quantity'].includes(prop));
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}` });
    }

    if (!quantity) {
      return res.status(400).json({ status: 400, message: 'Quantity is missing' });
    }
    
    if (typeof quantity !== 'number') {
      return res.status(400).json({ status: 400, message: 'Quantity should be a number' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ status: 400, message: 'Quantity should be a positive integer' });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ status: 404, message: 'Product not found' });
    }

    const userId = req.user.id;
    const cart = await cartService.getUsersCart(userId);

    if (!cart || !cart.id) {
      return res.status(404).json({ status: 404, message: 'Cart not found' });
    }

    const existingCartProduct = await cartService.getCartProduct(cart.id, productId);

    if (!existingCartProduct) {
      return res.status(404).json({ status: 404, message: 'Product not found in the cart' });
    }

    const newQuantity = quantity;

    if (newQuantity > product.quantity) {
      return res.status(401).json({ status: 401, message: 'Not enough in stock' });
    }

    await cartService.updateCartProductQuantity(cart.id, productId, newQuantity);

    return res.status(200).json({ status: 201, message: 'Product quantity updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

router.delete('/:productId', isAuth, async (req, res) => {
   /*
   #swagger.tags = ['Users Cart']
    #swagger.summary = "Delete item in users cart"
    #swagger.description = "You need to execute /auth/login as a regular USER first. You can use the user created when executing /auth/register."
    #swagger.responses[200] = { description: "OK: Product deleted successfully" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[404] = { description: "Not Found: Product you try to delete was not found" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[500] = { description: "Internal Server Error: Error occurred while trying to update quantity of item" }
    */
  try{
    const productId = req.params.productId;
    const userId = req.user.id;

    const cart = await cartService.getUsersCart(userId);

    const existingProduct = await cartService.getCartProduct(cart.id, productId)
    if (!existingProduct) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    if (existingProduct.isDeleted === true) {
      return res.status(400).json({ status: 400, message: "Product is already deleted" });
    }

    await cartService.deleteCartProduct(productId)
    res.status(200).json({status: 200, message: 'Product deleted successfully'})
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'Internal Server Error: Error while trying to delete product in cart' });
  }
});

module.exports = router;