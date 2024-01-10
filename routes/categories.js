var express = require('express');
var router = express.Router();
var db = require('../models');
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const {isAuth, isAdmin} = require('../middleware/middleware');


/* GET users listing. */
router.get('/', async function(req, res, next) {
   /* 
   #swagger.tags = ['Categories']
    #swagger.summary = "View all categories"
    #swagger.responses[200] = { description: "OK: Successful operation" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view category" }
    */
  try {
    const categories = await productService.getAllCategories()
    res.status(200).json({status: 200, result: categories});
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to view category' });
  }
  
});

router.post('/', isAuth, isAdmin, async (req, res) => {
   /*
   #swagger.tags = ['Categories']
    #swagger.summary = "Add a new category"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/PostCategory" }
    }
    #swagger.responses[201] = { description: "Created: Category added successfully", schema: { $ref: "#/definitions/CategoryResponse" } }
    #swagger.responses[403] = { description: "Unauthorized: Only admin have access" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to add category" }
    */
  try {
    const { name } = req.body;
    const invalidProperties = Object.keys(req.body).filter(prop => !['name'].includes(prop));
    
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}. It can only be one property and that property is name` });
    }

    if (!name) {
      return res.status(400).json({ status: 400, message: 'Property is missing' });
    }
    
    if (typeof name !== 'string') {
      return res.status(400).json({ status: 400, message: 'Category should be a string' });
    }

    const result = await db.Category.create({ name });
    res.status(200).json({ status: 201, message: 'Category added successfully', result: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to add category' });
  }
});

router.put('/:id', isAuth, isAdmin, async(req, res) => {
   /*
   #swagger.tags = ['Categories']
    #swagger.summary = "Update a category by ID"
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/UpdateCategory" }
    }
    #swagger.responses[201] = { description: "Created: Category updated successfully" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[403] = { description: "Unauthorized: Only admin have access" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[404] = { description: "Not Found: Category not found" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to update category" }
    */
try {
  const id = req.params.id;
  const { name } = req.body;
  const invalidProperties = Object.keys(req.body).filter(prop => !['name'].includes(prop));
    
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}. Correct property: name` });
    }

    if (!name) {
      return res.status(400).json({ status: 400, message: 'Property is missing' });
    }
    
    if (typeof name !== 'string') {
      return res.status(400).json({ status: 400, message: 'Category should be a string' });
    }

    const category = await db.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

      await category.update({ name });
  res.status(200).json({ status: 201, message: 'Category updated successfully' });
} catch (error) {
  console.error(error);
  res.status(500).json({ status: 500, message: 'An error occurred while trying to update category' });
}
});

router.delete('/:id', isAuth, isAdmin, async(req, res) => {
    /*
    #swagger.tags = ['Categories']
    #swagger.summary = "Delete a category by ID"
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.responses[200] = { description: "OK: Category deleted successfully" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[404] = { description: "Not Found: Category not found" }
    #swagger.responses[403] = { description: "Unauthorized: Only admin have access" }
    #swagger.responses[409] = { description: "Conflict: Cannot delete a category that is in use" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to delete category" }
    */
  try {
    const id = req.params.id;

    const existingCategory = await db.Category.findByPk(id);
        if (!existingCategory) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

    const associatedProducts = await db.Product.findAll({ where: { categoryId: id } });
        if (associatedProducts.length > 0) {
            return res.status(409).json({ status: 409, message: 'Cant delete a category that is associated with a product' });
        }

      await existingCategory.destroy();
    res.status(200).json({ status: 200, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to delete category' });
  }

});

module.exports = router;