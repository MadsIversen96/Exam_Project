module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('Role', {
      name: Sequelize.STRING
    }, {timestamps: false});
  
    Role.associate = function(models) {
      Role.hasMany(models.User, { foreignKey: 'roleId', as: 'user' });
    };
  
    return Role;
  };