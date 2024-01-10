module.exports = (sequelize, Sequelize) => {
    const Membership = sequelize.define('Membership', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      discount: {
        type: Sequelize.INTEGER
      }
    }, {timestamps: false});
  
    Membership.associate = function(models) {
        Membership.hasMany(models.User, { foreignKey: 'membershipId', as: 'User' });
    };
  
    return Membership;
  };