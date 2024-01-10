var express = require('express');
var router = express.Router();
var db = require('../models');

// --- HANDLERS ---
router.get('/', function(req, res, next) {
   /*  #swagger.tags = ['Login page']
    #swagger.summary = "Front end for login page"
    #swagger.produces = ['json']
  */
  res.render('login');
});

module.exports = router;
