class ProductService {
    constructor(db){
        this.client = db.sequelize;
        this.Product = db.Product
        this.Category = db.Category
        this.Brand = db.Brand;
        this.CartProduct = db.CartProduct
    }

    async getAllCategories(){
        return this.Category.findAll()
    }
    async getCategoryById(id){
        return this.Category.findOne({
            where: { id: id }
        })
    }

    async getProductsByCategoryId(id){
        return this.Product.findAll({
            where: {categoryId: id}
        })
    }

    async createCategories(name){
        return this.Category.create({
            name: name
        })
    }

    async updateCategory(id, name){
        return this.Category.update({
            name: name
        },
        { where: { id: id }})
    }

    async deleteCategory(id){
       return this.Category.destroy({
        where: { id: id }
       })
    }

    async getAllBrands(){
        return this.Brand.findAll()
    }

    async getProductsByBrandId(id){
        return this.Product.findAll({
            where: {brandId: id}
        })
    }

    async getProductsByIds(productIds) {
        return this.Product.findAll({
            where: {
                id: productIds,
            },
            include: [
                { model: this.Category, as: 'category', attributes: ['name'] },
                { model: this.Brand, as: 'brand', attributes: ['name'] }
            ],
            attributes: {
                exclude: ['categoryId', 'brandId', 'quantity', 'price']
            },
            through: {
                attributes: ['quantity', 'price']
            }
        });
    }

    async createBrand(name){
        return this.Brand.create({
            name: name
        })
    }

    async updateBrand(id, name){
        return this.Brand.update({
            name: name
        },
        { where: { id: id }})
    }

    async deleteBrand(id){
       return this.Brand.destroy({
        where: { id: id }
       })
    }

    async getAllProducts(){
        return this.Product.findAll()
    }

    async getProductById(productId){
        return this.Product.findOne({
            where: {id: productId}
        })
    }

    async createProduct(imgurl, name, description, price, quantity, brandId, categoryId){
        return this.Product.create({
            imgurl: imgurl,
            name: name,
            description: description,
            price: price,
            quantity: quantity,
            brandId: brandId,
            categoryId: categoryId,
            isDeleted: false
        })
    }

    async updateProduct(id, updatedData){
        return this.Product.update(updatedData, {
            where: { id: id }
        })
    }

    async updateProductQuantities(orderedProducts) {
        for (const orderedProduct of orderedProducts) {
            const { productId, quantity } = orderedProduct;

            const product = await this.getProductById(productId);

            const newQuantity = product.quantity - quantity;

            await this.updateProduct(productId, { quantity: newQuantity });
        }
    }

    async deleteProduct(id){
        return this.Product.update(
            { isDeleted: true },
            { where: { id: id } }
            );
    }
}

module.exports = ProductService;