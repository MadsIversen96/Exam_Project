module.exports = (sequelize, Sequelize) => {
    const CartProduct = sequelize.define('CartProduct', {
      price: {
        type: Sequelize.DECIMAL(10, 2),
            allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }

    }, {timestamps: true});
  
    CartProduct.associate = function(models) {
      CartProduct.belongsTo(models.Cart, { foreignKey: 'cartId', as: 'cart', onDelete: 'CASCADE' });
      CartProduct.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'})
    };
  
    return CartProduct;
  };