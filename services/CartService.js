class CartService {
    constructor(db){
        this.client = db.sequelize;
        this.Cart = db.Cart
        this.CartProduct = db.CartProduct
        this.Membership = db.Membership
    }

    async getUsersCart(userId){
        return this.Cart.findOne({
            where: { userId: userId}
        })
    }

    async getAllCartProducts(cartId){
        return this.CartProduct.findAll({
            where: {
                cartId: cartId,
                isDeleted: false
            }
        })
    }

    async getCartProduct(cartId, productId){
        return this.CartProduct.findOne({
            where: {
                cartId: cartId,
                productId: productId,
                isDeleted: false
            }
        })
    }


    async updateCartProductQuantity(cartId, productId, newQuantity){
        return this.CartProduct.update(
            { quantity: newQuantity },
            { where: { cartId: cartId, productId: productId, isDeleted: false } }
          );
    }

    async createCart(userId){
        return this.Cart.create({
            userId: userId
        })
    }

    async addToCart(price, quantity, cartId, productId){
        return this.CartProduct.create({
            price: price,
            quantity: quantity,
            isDeleted: false,
            cartId: cartId,
            productId: productId
        })
    }

    async deleteCartProduct(productId){
        return this.CartProduct.update(
            { isDeleted: true },
            { where: { productId: productId } }
            );
    }
}

module.exports = CartService;