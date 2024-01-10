module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define('Category', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {timestamps: false});
  
    Category.associate = function(models) {
      Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'product' });
    };
  
    return Category;
  };