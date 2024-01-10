module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define('Cart', {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {timestamps: true});
  
    Cart.associate = function(models) {
        Cart.hasMany(models.CartProduct, { foreignKey: 'cartId', as: 'cartProduct' });
        Cart.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
    };
  
    return Cart;
  };