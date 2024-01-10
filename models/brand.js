module.exports = (sequelize, Sequelize) => {
    const Brand = sequelize.define('Brand', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {timestamps: false});
  
    Brand.associate = function(models) {
      Brand.hasMany(models.Product, { foreignKey: 'brandId', as: 'product' });
    };
  
    return Brand;
  };