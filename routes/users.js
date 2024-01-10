var express = require('express');
var router = express.Router();
var db = require('../models');
const {isAuth, isAdmin} = require('../middleware/middleware');

/* GET users listing. */
router.get('/', isAuth, isAdmin, async function(req, res, next) {
  /*  #swagger.tags = ['Users and Roles']
    #swagger.summary = "View all Users"
    #swagger.produces = ['json']
    #swagger.responses[200] = { description: "OK"}
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to view users" }
  */
  try {
    const users = await db.User.findAll({
      include: [
        {
            model: db.Role,
            as: 'role',
        },
        {
          model: db.Membership,
          as: 'membership',
      }
    ],
      attributes: {
        exclude: ['encryptedPassword', 'salt']
      }
    });

    res.status(200).json({status: 200, result: users});
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to view user' });
  }
});

router.put('/:userId', isAuth, isAdmin, async (req, res) => {
   /*  #swagger.tags = ['Users and Roles']
    #swagger.summary = "Updates a user by userID"
    #swagger.description = "You need to execute /auth/login as admin first"
    #swagger.produces = ['json']
	  #swagger.parameters['body'] =  {
    "name": "body",
    "in": "body",
      "schema": {
        $ref: "#/definitions/UpdateUser"
      }
    }
  
    #swagger.responses[201] = { description: "Created: User updated successfully" }
    #swagger.responses[400] = { description: "Bad Request: Invalid properties" }
    #swagger.responses[404] = { description: "Not Found: User not found" }
    #swagger.responses[401] = { description: "Unauthorized: No token provided or invalid token" }
    #swagger.responses[403] = { description: "Unauthorized: Only admins have access" }
    #swagger.responses[500] = { description: "Internal Server Error: An error occurred while trying to update user" }
  */
  const userId = req.params.userId;
  const { firstname, lastname, email, username, address, telephone, totalProductsPurchased, membership, roleId } = req.body;

  try {
    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    const validProperties = ['firstname', 'lastname', 'email', 'username', 'address', 'telephone', 'totalProductsPurchased', 'membership', 'roleId'];
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
    if ('totalProductsPurchased' in req.body && typeof totalProductsPurchased !== 'number') {
      typeErrors.push("'totalProductsPurchased' should be a number.");
    }

    if ('telephone' in req.body) {
      const telephoneRegex = /^[0-9]{1,14}$/;
      if (!telephoneRegex.test(telephone)) {
        typeErrors.push("'telephone' should be a valid 1-14 digits number.");
      }
    }

    if (typeErrors.length > 0) {
      return res.status(400).json({ status: 400, message: `Invalid data types: ${typeErrors.join(' ')}` });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ('email' in req.body && !emailRegex.test(email)) {
      return res.status(400).json({ status: 400, message: "'email' should be a valid email address." });
    }

      let roleIdOrName = roleId;
      if (typeof roleId === 'string') {
        const role = await db.Role.findOne({ where: { name: roleId } });
        if (role) {
          roleIdOrName = role.id;
        } 
      } 

    await user.update({
      firstname,
      lastname,
      email,
      username,
      address,
      telephone,
      totalProductsPurchased,
      membership,
      roleId: roleIdOrName
    });

    res.status(200).json({ status: 200, message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: 'An error occurred while trying to update user' });
  }
});

module.exports = router;
