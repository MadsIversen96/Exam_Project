var express = require('express');
var router = express.Router();
var db = require('../models');
const OrderService = require('../services/OrderService');
const orderService = new OrderService(db);
const {isAuth, isAdmin} = require('../middleware/middleware');

router.get('/', isAuth, isAdmin, async function(req, res, next) {
     /* 
   #swagger.tags = ['Checkout and Orders']
    #swagger.summary = "View all orders of all users"
    #swagger.responses[200] = { description: "OK: Successful operation" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view orders" }
    */
    try {
        
        const ordersWithProducts = await db.Order.findAll({
            include: [
                {
                    model: db.OrderProduct,
                    as: 'orderProduct',
                    include: [
                        { model: db.Product, as: 'product' },
                    ],
                },
                {
                    model: db.User,
                    as: 'user',
                },
                {
                    model: db.Status,
                    as: 'status',
                }
            ],
        });

        
        const formattedOrders = ordersWithProducts.map(order => ({
            orderId: order.id,
            totalPrice: order.totalPrice,
            orderNumber: order.orderNumber,
            membership: order.membership,
            created: order.createdAt,
            updated: order.updatedAt,
            status: order.status.name,
            user: {
                userId: order.user.id,
                username: order.user.username,
                email: order.user.email,
            },
            products: order.orderProduct.map(orderProduct => ({
                productId: orderProduct.product.id,
                productName: orderProduct.product.name,
                price: orderProduct.price,
                quantity: orderProduct.quantity,
            })),
        }));

        res.status(200).json({ status: 200, result: formattedOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'An error occurred while trying to view orders' });
    }
});

router.get('/statuses', async (req, res) => {
      /* 
   #swagger.tags = ['Checkout and Orders']
    #swagger.summary = "View status alternatives"
    #swagger.responses[200] = { description: "OK: Successful operation" }
     #swagger.responses[404] = { description: "Not Found: No statuses found" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view statuses" }
    */
    try{
    const statuses = await orderService.getAllstatus();
    if(!statuses){
        res.status(404).json({ status: 404, message: 'No statuses found' });
    }
    res.status(200).json({ status: 200, result: statuses });
    }catch(error){
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// Gets statusName and updates the statusId to the Id that belongs to that statusName
router.put('/:orderId', isAuth, isAdmin, async (req, res) => {
     /*
   #swagger.tags = ['Checkout and Orders']
    #swagger.summary = "Change order statuses by orderId"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/UpdateOrderStatus" }
    }
    #swagger.responses[201] = { description: "Created: Status updated successfully"}
    #swagger.responses[403] = { description: "Unauthorized: Only admin have access" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[404] = { description: "Not Found: Order or Status not found" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to update order status" }
    */
    try {
      const { statusName } = req.body;
  
      if (!statusName) {
        return res.status(400).json({ status: 400, message: 'New status name is required' });
      }
  
      const status = await db.Status.findOne({
        where: { name: statusName }
      });
  
      if (!status) {
        return res.status(404).json({ status: 404, message: 'Status not found' });
      }
  
      const order = await db.Order.findByPk(req.params.orderId);
      if (!order) {
        return res.status(404).json({ status: 404, message: 'Order not found' });
      }
  
      await order.update({ statusId: status.id });
  
      return res.status(201).json({ status: 201, message: 'Status updated for the order' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
  });

module.exports = router;