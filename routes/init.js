var express = require('express');
var router = express.Router();
var db = require('../models');
const { QueryTypes } = require('sequelize');
const ProductService = require("../services/ProductService");
const productService = new ProductService(db)
const UserService = require('../services/UserService');
const userService = new UserService(db);
const OrderService = require('../services/OrderService');
const orderService = new OrderService(db);
var crypto = require('crypto');

// --- HANDLERS ---

router.post('/', async (req, res) => {
   // #swagger.tags = ['Database Initiation']
    // #swagger.summary = "Fills the database with all required data"
    // #swagger.produces = ['json']
    // #swagger.responses[200] = { description: "OK: Database populated successfully"}
    // #swagger.responses[400] = { description: "Bad Request: Database already has data"}
    // #swagger.responses[500] = { description: "Internal Server Error: Error when trying to populate database" }
  try {
      const hasData = await checkIfDBHasData();
      if (!hasData) {
          return res.status(400).json({ status: 400, message: 'Database already has data. Initialization not allowed.' });
      }

      console.log('No records in the database, populating the database');
      await insertUniqueData('category', 'categories', 'name');
      await insertUniqueData('brand', 'brands', 'name');
      await insertProductData();
      await insertRoles();
      await insertMembership();
      await insertStatus();
      await insertAdmin();

      res.status(200).json({ status: 200, message: 'Database populated successfully' });
  } catch (error) {
      console.error('Error while populating the database:', error);
      res.status(500).json({ error: 'Error when trying to populate database' });
  }
});

// --- DATA --- //
// fetched api data
let data;

// Roles data - Do not change the object arrangement!
const rolesData = [
    { name: 'admin' },
    { name: 'user' }
  ]

// Membership data - Do not change the object arrangement!
const membershipData = [
      { name: 'bronze', discount: 0 },
      { name: 'silver', discount: 15 },
      { name: 'gold', discount: 30 },
    ];

// Status data
const statusData = [
  { name : 'In progress' },
  { name: 'Ordered' },
  { name: 'Completed'}
]

// User data
const userData = [
  { firstname: 'Admin', lastname: 'Support', username: 'Admin', email: 'admin@noroff.no', password: 'P@ssword2023', address: 'Online', telephone: '911' }
]

// --- FUNCTIONS ---
const fetchApi = async () => {
try {
    const response = await fetch('http://backend.restapi.co.za/items/products');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const ApiData = await response.json();
    data = ApiData.data;
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
fetchApi();


const insertUniqueData = async (propName, tableName, columnName) => {
  const uniqueData = new Set();
  for (const product of data) {
    const propValue = product[propName];
    if (!uniqueData.has(propValue)) {
      uniqueData.add(propValue);
      await db.sequelize.query(`INSERT INTO ${tableName} (${columnName}) VALUES ('${propValue}')`);
    }
  }
  };

  async function insertProductData() {
    
    for (const product of data) {
      const { description, imgurl, name, price, quantity, brand, category } = product;
  
      const brands = await productService.getAllBrands();
      const brandResult = brands.find((b) => b.name === brand);
      const brandId = brandResult.id
  
      const categories = await productService.getAllCategories();
      const categoryResult = categories.find((c) => c.name === category);
      const categoryId = categoryResult.id
  
      await productService.createProduct(imgurl, name, description, price, quantity, brandId, categoryId, false);
    }
  }

  const insertRoles = async () => {
    for (const {name} of rolesData) {
      await userService.createRole(name)
    }
  }

  const insertMembership = async () => {
    for (const { name, discount } of membershipData) {
      await userService.createMembership(name, discount);
    }
  }

  const insertStatus = async () => {
    for (const {name} of statusData) {
      await orderService.createStatus(name);
    }
  }

  const insertAdmin = () => {
    for (const {firstname, lastname, username, email, password, address, telephone} of userData) {
      var salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return next(err); }
        userService.createUser(firstname, lastname, username, email,  hashedPassword, salt, address, telephone, 1, 1)
       
      });
    }
  }
  
  const checkIfDBHasData = async () => {
    const tables = ['brands', 'cartproducts', 'carts', 'categories', 'products', 'memberships', 'orderproducts', 'orders', 'roles', 'statuses', 'users'];
    
    for (const table of tables) {
        const result = await db.sequelize.query(`SELECT COUNT(*) as total FROM ${table}`, {
            raw: true,
            type: QueryTypes.SELECT
        });

        if (result[0].total > 0) {
            return false;
        }
    }

    return true;
};


module.exports = router;