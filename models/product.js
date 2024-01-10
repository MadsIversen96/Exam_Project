module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define('Product', {
        imgurl: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
        },
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
  
    Product.associate = function(models) {
        Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
        Product.belongsTo(models.Brand, { foreignKey: 'brandId', as: 'brand' });
        Product.hasMany(models.OrderProduct, {foreignKey: 'productId', as: 'orderProduct'});
        Product.hasMany(models.CartProduct, {foreignKey: 'productId', as: 'cartProduct'});
    };
  
    return Product;
  };