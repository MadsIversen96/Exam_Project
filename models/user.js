
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
        firstname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        encryptedPassword: {
            type: Sequelize.BLOB,
            allowNull: false
        },
        salt: {
            type: Sequelize.BLOB,
            allowNull: false
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false
        },
        telephone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        totalProductsPurchased: Sequelize.INTEGER
    }, {timestamps: false})
    User.associate = function(models) {
        User.belongsTo(models.Role, {foreignKey: 'roleId', as: 'role'});
        User.belongsTo(models.Membership, {foreignKey: 'membershipId', as: 'membership'})
        User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });
        User.hasMany(models.Order, { foreignKey: 'userId', as: 'order' });
    };
    return User;
}