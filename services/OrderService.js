const { Op } = require('sequelize');

class OrderService {
    constructor(db){
        this.client = db.sequelize;
        this.Order = db.Order;
        this.Status = db.Status;
        this.OrderProduct = db.OrderProduct;
        this.User = db.User;
    }

    async createStatus(name){
        return this.Status.create({
            name: name
        })
    }

    async getStatusByName(name){
        return this.Status.findOne({
            where: {name: name}
        })
    }

    async getAllstatus(){
        return this.Status.findAll()
    }

    async getOrderStatusById(statusId) {
        return this.Status.findOne({
          where: { id: statusId },
        });
      }

    async getOrdersByUserId(userId) {
        return this.Order.findAll({
          where: { userId: userId },
        });
      }

    async getOrderByOrderNumber(orderNumber){
        return this.Order.findOne({
            where: {orderNumber: orderNumber}
        })
    }

    async getOrderProductsByOrderId(orderId) {
        return this.OrderProduct.findAll({
          where: { orderId: orderId },
        });
      }

      async getOrdersWithUsers() {
        return this.Order.findAll({
            include: [
                {
                    model: this.User,
                    attributes: ['id', 'username', 'email'],
                    as: 'user'
                },
            ],
        });
    }

    async createOrder(userId, totalPrice, orderNumber, statusId, membership) {
            return this.Order.create({
                userId: userId,
                totalPrice: totalPrice,
                orderNumber: orderNumber,
                statusId: statusId,
                membership: membership
            });
    }

    async createOrderProduct(orderId, price, quantity, productId){
        return this.OrderProduct.create({
            orderId: orderId,
            price: price,
            quantity: quantity,
            productId: productId
        })
    }
}

module.exports = OrderService;