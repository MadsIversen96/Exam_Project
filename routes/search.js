var express = require('express');
var router = express.Router();
var db = require('../models');
const { QueryTypes } = require('sequelize');

  router.post('/', async (req, res) => {
     // #swagger.tags = ['Products']
    // #swagger.summary = "Search through all the products in the database"
    // #swagger.produces = ['json']
    // #swagger.responses[200] = { description: "OK"}
    // #swagger.responses[500] = { description: "Internal Server Error: Error when searching products" }
    try {
      const searchTerm = req.query.searchTerm || req.body.searchTerm;
      const category = req.query.category || req.body.category;
      const brand = req.query.brand || req.body.brand;
  
      let searchConditions = [];
  
      if (searchTerm) {
        searchConditions.push('p.name LIKE :searchTerm');
      }
  
      if (category) {
        searchConditions.push('c.name = :category');
      }
  
      if (brand) {
        searchConditions.push('b.name = :brand');
      }
  
      const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
  
      const searchQuery = `
        SELECT 
          p.id, 
          p.imgurl, 
          p.name, 
          p.description, 
          p.price, 
          p.quantity, 
          p.createdAt, 
          b.name AS brandName, 
          c.name AS categoryName
        FROM products p
        JOIN brands b ON p.brandId = b.id
        JOIN categories c ON p.categoryId = c.id
        ${whereClause}
        ORDER BY p.id ASC;
      `;
  
      const replacements = {
        searchTerm: `%${searchTerm}%`,
        category: category,
        brand: brand,
      };
  
      const productsInfo = await db.sequelize.query(searchQuery, {
        replacements: replacements,
        raw: true,
        type: QueryTypes.SELECT,
      });
  
      return res.status(200).json({ status: 200, result: productsInfo });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, message: 'Error when searching products' });
    }
  });
  
  module.exports = router;