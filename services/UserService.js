const { Op } = require("sequelize");

class UserService {
    constructor(db){
        this.client = db.sequelize;
        this.User = db.User
        this.Membership = db.Membership;
        this.Role = db.Role;
    }

    async getOne(email) {
        return this.User.findOne({
            where: {email: email}
        })
    }

    async getUserById(userId){
        return this.User.findOne({
            where: {id: userId}
        })
    }

    async getByEmailOrUsername(emailOrUsername){
        return this.User.findOne({
            where: {
                [Op.or]: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            }
        });
    }

    async getTotalProductsPurchased(userId) {
        const user = await this.User.findOne({
            attributes: ['totalProductsPurchased'],
            where: { id: userId }
        });

        return user ? user.totalProductsPurchased : 0;
    }

    async getMembershipById(membershipId){
        return this.Membership.findOne({
            where: {id: membershipId}
        })
    }

    async createRole(name){
        return this.Role.create({
            name: name
        })
    }

    async createUser(firstname, lastname, username, email, encryptedPassword, salt, address, telephone, roleId, membershipId){
        return this.User.create({
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: email,
            encryptedPassword: encryptedPassword,
            salt: salt,
            address: address,
            telephone: telephone,
            roleId: roleId,
            membershipId
        })
    }

    async createMembership(name, discount){
        return this.Membership.create({
            name: name,
            discount: discount
        })
    }

    async updateMembershipId(userId, newMembershipId) {
        return this.User.update(
            { membershipId: newMembershipId },
            { where: { id: userId } }
        );
    }

    async updateTotalProductsPurchased(userId, totalQuantity) {
        return this.User.update(
            { totalProductsPurchased: totalQuantity },
            { where: { id: userId } }
        );
    }

    async delete(email){
        return this.User.destroy({
            where: {email: email}
        })
    }
}

module.exports = UserService;