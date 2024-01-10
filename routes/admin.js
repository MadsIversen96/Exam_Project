var express = require('express');
var router = express.Router();
const {isAuth, isAdmin} = require('../middleware/middleware');
/* GET users listing. */
router.get('/products', isAuth, isAdmin, async function(req, res, next) {
   /*  #swagger.tags = ['Admin Panel']
    #swagger.summary = "Fetches data for products page"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: Error fetching data for products page" }
  */
  try {
    const productsResponse = await fetch('http://localhost:3000/products');
    const productData = await productsResponse.json();

    const categoriesResponse = await fetch('http://localhost:3000/categories');
    const categoriesData = await categoriesResponse.json();

    const brandsResponse = await fetch('http://localhost:3000/brands');
    const brandsData = await brandsResponse.json();

    res.render('adminProducts', {
      products: productData.result,
      categories: categoriesData.result,
      brands: brandsData.result
    });
  } catch (error) {
    console.error(error);
    
    res.render('error', { message: 'Error fetching data for products page' });
  }
});

router.get('/categories', isAuth, isAdmin, async(req, res) => {
   /*  #swagger.tags = ['Admin Panel']
    #swagger.summary = "Fetches data for categories page"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: Error fetching data for categories page" }
  */
  try {
    const categoryResponse = await fetch('http://localhost:3000/categories');
    const categoryData = await categoryResponse.json();

    res.render('adminCategories', { categories: categoryData.result });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error fetching data for categories page' });
  }
});

router.get('/brands', isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Admin Panel']
    #swagger.summary = "Fetches data for brands page"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: Error fetching data for brands page" }
  */
  try {
    const brandsResponse = await fetch('http://localhost:3000/brands');
    const brandsData = await brandsResponse.json();

    res.render('adminBrands', { brands: brandsData.result });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error fetching data for brands page' });
  } 	
  });

router.get('/roles', isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Admin Panel']
    #swagger.summary = "Fetches data for roles page"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: Error fetching data for roles page" }
  */
  try {
    const rolesResponse = await fetch('http://localhost:3000/roles');
    const rolesData = await rolesResponse.json();

    res.render('adminRoles', { roles: rolesData.result });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error fetching data for roles page' });
  }	
});

router.get('/users', isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Admin Panel']
    #swagger.summary = "Fetches data for users page"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: Error fetching data for users page" }
  */
  try {
    const usersResponse = await fetch('http://localhost:3000/users', {
      method: 'GET',
      headers: {
        'cookie': `token=${req.cookies.token}`,
        'Content-Type': 'application/json',
    }
  });
    const usersData = await usersResponse.json();

    const rolesResponse = await fetch('http://localhost:3000/roles');
    const rolesData = await rolesResponse.json();

    res.render('adminUsers', { 
      users: usersData.result,
      roles: rolesData.result
     });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error fetching data for users page' });
  }	
  });

router.get('/orders',  isAuth, isAdmin, async (req, res) => {
  /*  #swagger.tags = ['Admin Panel']
    #swagger.summary = "Fetches data for orders page"
   #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: Error fetching data for orders page" }
  */
  try {
    const ordersResponse = await fetch('http://localhost:3000/orders', {
      method: 'GET',
      headers: {
        'cookie': `token=${req.cookies.token}`,
        'Content-Type': 'application/json',
    }
  });
    const ordersData = await ordersResponse.json();

    const statusResponse = await fetch('http://localhost:3000/orders/statuses');
    const statusData = await statusResponse.json();

    res.render('adminOrders', {
      orders: ordersData.result, 
      statuses: statusData.result
    });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error fetching data for orders page' });
  } 	
  });

module.exports = router;