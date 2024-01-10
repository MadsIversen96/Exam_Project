var express = require('express');
var router = express.Router();
var db = require("../models");
var crypto = require('crypto');
var UserService = require("../services/UserService")
var userService = new UserService(db);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var jwt = require('jsonwebtoken');
var CartService = require('../services/CartService');
var cartService = new CartService(db)

router.post('/register', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = "Register new user"
    #swagger.produces = ['json']
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        schema: {
            $ref: "#/definitions/UserRegister"
        }
    }
    #swagger.responses[201] = { description: "Created: You created an account" }
    #swagger.responses[400] = { description: "Bad Request: Invalid or missing credentials" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while registering the user" }
    */
  try {

    const { firstname, lastname, username, email, password, address, telephone } = req.body;

    const roles = await db.Role.findAll();
    if(roles.length == 0){
        return res.status(400).json({ status: 400, message: "Cant create a user if there is no roles in database" });
    }

    const memberships = db.Membership.findAll()
    if(memberships.length == 0){
        return res.status(400).json({ status: 400, message: "Cant create a user if there is no memberships in database" });
    }

    const validProperties = ['firstname', 'lastname', 'email', 'username', 'address', 'telephone', 'password'];
    const invalidProperties = Object.keys(req.body).filter(prop => !validProperties.includes(prop));

    if (invalidProperties.length > 0) {
        return res.status(400).json({ status: 400, message: `Invalid properties: ${invalidProperties.join(', ')}` });
    }

    const typeErrors = [];
    if ('firstname' in req.body && typeof firstname !== 'string') {
        typeErrors.push("'firstname' should be a string.");
    }
    if ('lastname' in req.body && typeof lastname !== 'string') {
        typeErrors.push("'lastname' should be a string.");
    }
    if ('email' in req.body && typeof email !== 'string') {
        typeErrors.push("'email' should be a string.");
    }
    if ('username' in req.body && typeof username !== 'string') {
        typeErrors.push("'username' should be a string.");
    }
    if ('telephone' in req.body) {
        const telephoneRegex = /^[0-9]{3,10}$/;
        if (!telephoneRegex.test(telephone)) {
            typeErrors.push("'telephone' should be a valid 3-10 digits number.");
        }
    }

    if (typeErrors.length > 0) {
        return res.status(400).json({ status: 400, message: `Invalid data types: ${typeErrors.join(' ')}` });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ('email' in req.body && !emailRegex.test(email)) {
        return res.status(400).json({ status: 400, message: "'email' should be a valid email address." });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ status: 400, message: 'Password must have at least 8 characters and contain both letters and numbers.' });
    }

    const existingUserWithEmail = await userService.getByEmailOrUsername(email);
    if (existingUserWithEmail) {
        return res.status(400).json({ status: 400, message: 'User with the same email already exists.' });
    }

    const existingUserWithUsername = await userService.getByEmailOrUsername(username);
    if (existingUserWithUsername) {
        return res.status(400).json({ status: 400, message: 'User with the same username already exists.' });
    }

    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
        if (err) {
            console.error('Error while hashing password:', err);
            return res.status(500).json({ status: 500, message: 'An error occurred while hashing the password' });
        }

        const user = await userService.createUser(firstname, lastname, username, email, hashedPassword, salt, address, telephone, 2, 1); // 2=user role, 1=bronze membership

        if (!user) {
            console.error('Error while creating user');
            return res.status(500).json({ status: 500, message: 'An error occurred while creating the user' });
        }

        // Creates a cart for the user
        const cart = await cartService.createCart(user.id);

        if (!cart) {
            console.error('Error while creating cart');
            return res.status(500).json({ status: 500, message: 'An error occurred while creating the user cart' });
        }

        res.status(200).json({ status: 201, message: 'You created an account.' });
    });
} catch (error) {
    console.error('Error while registering user:', error);
    res.status(500).json({ status: 500, message: 'An error occurred while registering the user' });
}
});

router.post("/login", jsonParser, async (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = "User login"
    #swagger.description = "NOTE: After logging in as admin you get a cookie token and will be able to use the other endpoints"
    #swagger.produces = ['json']
    #swagger.parameters['body'] = {
        in: "body",
        name: "body",
        schema: {
            $ref: "#/definitions/UserLogin"
        }
    }
    #swagger.responses[200] = { description: "OK: You are logged in" }
    #swagger.responses[401] = { description: "Bad Request: Incorrect email or password" }
    #swagger.responses[500] = { description: "Internal Server Error: Something went wrong with creating JWT token" }
*/
    const { emailOrUsername, password } = req.body;
    userService.getByEmailOrUsername(emailOrUsername).then((data) => {
        if(data === null) {
            return res.status(401).json({status: 401, message: "Incorrect email or password"});
        }
        crypto.pbkdf2(password, data.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
          if (err) { return cb(err); }
          if (!crypto.timingSafeEqual(data.encryptedPassword, hashedPassword)) {
              return res.status(401).json({status: 401, message: "Incorrect password or password"});
          }
          let token;
          try {
            token = jwt.sign(
              { id: data.id, email: data.email, username: data.username, roleId: data.roleId },
              process.env.TOKEN_SECRET,
              { expiresIn: "2h" }
            );
          } catch (err) {
            res.status(500).json({status: 500, message: "Something went wrong with creating JWT token"})
          }
          res.cookie('token', token, { httpOnly: true, sameSite: 'Strict' });
          res.status(200).json({status: 200, message: "You are logged in", "id": data.id, "email": data.email, "username": data.username, "token": token, "roleId": data.roleId});
        });
    });
});

module.exports = router;