var express = require('express');
var router = express.Router();
var db = require('../models');
const { QueryTypes } = require('sequelize');
const {isAuth, isAdmin} = require('../middleware/middleware');



// --- HANDLERS ---
router.get('/', async function(req, res, next) {
  // #swagger.tags = ['Products']
    // #swagger.summary = "View all the products in the database"
    // #swagger.produces = ['json']
    // #swagger.responses[200] = { description: "OK"}
    // #swagger.responses[404] = { description: "Not found: No products found" }
    // #swagger.responses[500] = { description: "Internal Server Error: Error when getting products" }
  try {
    const productsInfo = await db.sequelize.query(`
      SELECT
        p.id,
        p.imgurl,
        p.name,
        p.description,
        p.price,
        p.quantity,
        b.name AS brandName,
        c.name AS categoryName,
        p.createdAt,
        p.isDeleted
      FROM
        products p
      JOIN
        brands b ON p.brandId = b.id
      JOIN
        categories c ON p.categoryId = c.id
      ORDER BY
        p.id ASC;
    `, {
      raw: true,
      type: QueryTypes.SELECT
    });
    if(!productsInfo){
      return res.status(404).json({ status: 404, message: 'No products found' });
    }
    
    return res.status(200).json({ status: 200, result: productsInfo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error when getting products' });
  }
});

// brandId and categoryId can be passed as either name or id
router.post('/', isAuth, isAdmin, async (req, res) => {
/*  
    #swagger.tags = ['Products']
    #swagger.summary = "Adds a new product."
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
	  #swagger.parameters['body'] =  {
    "name": "body",
    "in": "body",
      "schema": {
        $ref: "#/definitions/PostProduct"
      }
    }
  
    #swagger.responses[201] = { description: "Created: Product created successfully"}
    #swagger.responses[400] = { description: "Bad request: Invalid or missing properties" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to add product" }
  */
  try {
    const { imgurl, name, description, price, quantity, brandId, categoryId } = req.body;

    const validProperties = ['imgurl', 'name', 'description', 'price', 'quantity', 'brandId', 'categoryId'];
    const invalidProperties = Object.keys(req.body).filter(prop => !validProperties.includes(prop));
    const missingProperties = validProperties.filter(prop => !(prop in req.body));
    
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}` });
    }
    
    if (missingProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Missing properties: ${missingProperties.join(', ')}` });
    }

    const typeErrors = [];
    if ('imgurl' in req.body && typeof imgurl !== 'string') {
      typeErrors.push("'imgurl' should be a string.");
    }
    if ('name' in req.body && typeof name !== 'string') {
      typeErrors.push("'name' should be a string.");
    }
    if ('description' in req.body && typeof description !== 'string') {
      typeErrors.push("'description' should be a string.");
    }
    if ('price' in req.body && typeof price !== 'number') {
      typeErrors.push("'price' should be a number.");
    }
    if ('quantity' in req.body && typeof quantity !== 'number') {
      typeErrors.push("'quantity' should be a number.");
    }

    let brandIdValue = brandId;
    if (typeof brandId === 'string') {
      const brand = await db.Brand.findOne({ where: { name: brandId } });
      if (brand) {
        brandIdValue = brand.id;
      } else {
        typeErrors.push(`Brand with name '${brandId}' not found.`);
      }
    } 

    let categoryIdValue = categoryId;
    if (typeof categoryId === 'string') {
      const category = await db.Category.findOne({ where: { name: categoryId } });
      if (category) {
        categoryIdValue = category.id;
      } else {
        typeErrors.push(`Category with name '${categoryId}' not found.`);
      }
    } 

    if (typeErrors.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid data types: ${typeErrors.join(' ')}` });
    }

    const result = await db.Product.create({
      imgurl,
      name,
      description,
      price,
      quantity,
      brandId: brandIdValue,
      categoryId: categoryIdValue,
      isDeleted: false
    });
    res.status(200).json({ status: 201, message: "Product created successfully", result: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to add product' });
  }
});


// brandId and categoryId can be passed as either name or id
router.put('/:id', isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Products']
    #swagger.summary = "Update a product by ID"
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
	  #swagger.parameters['body'] =  {
    "name": "body",
    "in": "body",
      "schema": {
        $ref: "#/definitions/UpdateProduct"
      }
    }
  
    #swagger.responses[201] = { description: "Created: Product updated successfully"}
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to update product" }
  */
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const existingProduct = await db.Product.findByPk(id);
    if (!existingProduct) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    const validProperties = ['imgurl', 'name', 'description', 'price', 'quantity', 'brandId', 'categoryId', 'isDeleted'];
    const invalidProperties = Object.keys(updatedData).filter(prop => !validProperties.includes(prop));
    
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}` });
    }

    const typeErrors = [];
    if ('imgurl' in updatedData && typeof updatedData.imgurl !== 'string') {
      typeErrors.push("'imgurl' should be a string.");
    }
    if ('name' in updatedData && typeof updatedData.name !== 'string') {
      typeErrors.push("'name' should be a string.");
    }
    if ('description' in updatedData && typeof updatedData.description !== 'string') {
      typeErrors.push("'description' should be a string.");
    }
    if ('price' in updatedData && typeof updatedData.price !== 'number') {
      typeErrors.push("'price' should be a number.");
    }
    if ('quantity' in updatedData && typeof updatedData.quantity !== 'number') {
      typeErrors.push("'quantity' should be a number.");
    }
    if ('brandId' in updatedData) {
      // Converts brandId to its correct ID if it's a string/brand-name
      if (typeof updatedData.brandId === 'string') {
        const brand = await db.Brand.findOne({ where: { name: updatedData.brandId } });
        if (brand) {
          updatedData.brandId = brand.id;
        } else {
          typeErrors.push(`Brand with name '${updatedData.brandId}' not found.`);
        }
      } else if (typeof updatedData.brandId !== 'number') {
        typeErrors.push("'brandId' should be a number.");
      } else {
        const brandExists = await db.Brand.findByPk(updatedData.brandId);
        if (!brandExists) {
          typeErrors.push(`Brand with ID '${updatedData.brandId}' not found.`);
        }
      }
    }
    
    if ('categoryId' in updatedData) {
      // Converts categoryId to its correct ID if it's a string/category-name
      if (typeof updatedData.categoryId === 'string') {
        const category = await db.Category.findOne({ where: { name: updatedData.categoryId } });
        if (category) {
          updatedData.categoryId = category.id;
        } else {
          typeErrors.push(`Category with name '${updatedData.categoryId}' not found.`);
        }
      } else if (typeof updatedData.categoryId !== 'number') {
        typeErrors.push("'categoryId' should be a number.");
      } else {
        const categoryExists = await db.Category.findByPk(updatedData.categoryId);
        if (!categoryExists) {
          typeErrors.push(`Category with ID '${updatedData.categoryId}' not found.`);
        }
      }
    }

    if ('isDeleted' in updatedData && typeof updatedData.isDeleted !== 'boolean') {
      typeErrors.push("'isDeleted' should be a boolean.");
    }

    if (typeErrors.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid data types: ${typeErrors.join(' ')}` });
    }

    await existingProduct.update(updatedData);

    res.status(200).json({ status: 201, message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Products']
    #swagger.summary = "Delete a product by ID"
    #swagger.description = "NOTE: This is a soft delete. <br><br/> <br> You need to execute /auth/login as admin first <br/>"
    #swagger.produces = ['json']
    #swagger.responses[200] = { description: "OK: Product deleted successfully"}
    #swagger.responses[400] = { description: "Bad Request: Product is already deleted" }
    #swagger.responses[404] = { description: "Product not found" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to update product" }
  */
  try{
    const id = req.params.id;

    const existingProduct = await db.Product.findByPk(id);
    if (!existingProduct) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    if (existingProduct.isDeleted === true) {
      return res.status(400).json({ status: 400, message: "Product is already deleted" });
    }

    await existingProduct.update({ isDeleted: true });
    res.status(200).json({status: 200, message: 'Product deleted successfully'})
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to update product' });
  }
});

module.exports = router;