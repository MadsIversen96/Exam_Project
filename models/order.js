module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      membership: {
        type: Sequelize.STRING,
        allowNull: false
      }

    }, {timestamps: true});
  
    Order.associate = function(models) {
     Order.hasMany(models.OrderProduct, { foreignKey: 'orderId', as: 'orderProduct' });
     Order.belongsTo(models.User, {foreignKey: 'userId', as: 'user'});
     Order.belongsTo(models.Status, {foreignKey: 'statusId', as: 'status'});
    };
  
    return Order;
  };