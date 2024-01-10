var express = require('express');
var router = express.Router();
var db = require('../models');

/* GET users listing. */
router.get('/', async function(req, res, next) {
   /*  #swagger.tags = ['Users and Roles']
    #swagger.summary = "Get all Role alternatives"
    #swagger.produces = ['json']
    #swagger.responses[200] = { description: "OK"}
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to get roles" }
  */
  try {
    const roles = await db.Role.findAll();

    res.status(200).json({status: 200, result: roles});
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to get roles' });
  }
});

module.exports = router;