var express = require('express');
var router = express.Router();
var db = require('../models');
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const {isAuth, isAdmin} = require('../middleware/middleware');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  /*  #swagger.tags = ['Brands']
    #swagger.summary = "View all brands"
    #swagger.produces = ['json']
    #swagger.responses[200] = { description: "OK"}
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view brands" }
  */
  try {
    const brands = await productService.getAllBrands()
    res.status(200).json({status: 200, result: brands});
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to view brands' });
  }
});

router.post('/',isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Brands']
    #swagger.summary = "Adds a new brand."
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
	  #swagger.parameters['body'] =  {
    "name": "body",
    "in": "body",
      "schema": {
        $ref: "#/definitions/PostBrand"
      }
    }
  
    #swagger.responses[201] = { description: "Created: Brand created successfully"}
    #swagger.responses[400] = { description: "Bad Request:Invalid or missing properties" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to add brand" }
  */
  try {
    const { name } = req.body;
    const invalidProperties = Object.keys(req.body).filter(prop => !['name'].includes(prop));
    
    if (invalidProperties.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}. Correct property: name` });
    }

    if (!name) {
      return res.status(400).json({ status: 400, message: 'Property is missing' });
    }
    
    if (typeof name !== 'string') {
      return res.status(400).json({ status: 400, message: 'Brand should be a string' });
    }

    await db.Brand.create({ name });
    res.status(200).json({ status: 201, message: 'Brand added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to add brand' });
  }
});

router.put('/:id', isAuth, isAdmin, async(req, res) => {
  /*  #swagger.tags = ['Brands']
    #swagger.summary = "Updates a brand by ID"
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
	  #swagger.parameters['body'] =  {
    "name": "body",
    "in": "body",
      "schema": {
        $ref: "#/definitions/UpdateBrand"
      }
    }
  
    #swagger.responses[201] = { description: "Created: Brand updated successfully" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to update brand" }
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
      return res.status(400).json({ status: 400, message: 'Brand should be a string' });
    }

    const brand = await db.Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ status: 404, message: 'Brand not found' });
        }

  await brand.update({ name });
  res.status(200).json({ status: 201, message: 'Brand updated successfully' });
} catch (error) {
  console.error(error);
  res.status(500).json({ status: 500, message: 'An error occurred while trying to update brand' });
}
});

router.delete('/:id', isAuth, isAdmin, async(req, res) => {
  /*  #swagger.tags = ['Brands']
    #swagger.summary = "Deletes a brand by ID"
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
	  
    #swagger.responses[200] = { description: "OK: Brand deleted successfully"}
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[409] = { description: "Conflict: You are trying to delete a brand thats in use" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to delete brand" }
  */
  try {
    const id = req.params.id;

    const existingBrand = await db.Brand.findByPk(id);
    if (!existingBrand) {
        return res.status(404).json({ status: 404, message: 'Brand not found' });
    }

    const associatedBrands = await db.Product.findAll({ where: { brandId: id } });
    if(associatedBrands.length > 0){
      return res.status(409).json({status: 409, message: 'Cant delete a brand that is associated with a product'})
    }

    await existingBrand.destroy();
    res.status(200).json({ status: 200, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to delete brand' });
  }

});

module.exports = router;