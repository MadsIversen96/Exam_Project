module.exports = (sequelize, Sequelize) => {
    const OrderProduct = sequelize.define('OrderProduct', {
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

    }, {timestamps: true});
  
    OrderProduct.associate = function(models) {
      OrderProduct.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order', onDelete: 'CASCADE' });
      OrderProduct.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'})
    };
  
    return OrderProduct;
  };