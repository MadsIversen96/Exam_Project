module.exports = (sequelize, Sequelize) => {
    const Status = sequelize.define('Status', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {timestamps: false});
  
    Status.associate = function(models) {
        Status.hasMany(models.Order, { foreignKey: 'statusId', as: 'Order' });
    };
  
    return Status;
  };