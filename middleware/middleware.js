const jwt = require('jsonwebtoken');


function isAuth(req, res, next) {
  const token = req.cookies.token
  console.log('Received Token:', token);
  if (!token) {
    return res.status(401).json({status: 401, message:'Unauthorized: No token provided'});
  }

  
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Decoded Token:', decoded);
      console.error('Token verification error:', err.message);
      console.error('Decoded:', decoded);
      return res.status(401).json({status: 401, message: 'Unauthorized: Invalid token'});
    }

    req.user = decoded;
    next();
  });
}

function isAdmin(req, res, next) {
  
    if (! req.user || req.user.roleId !== 1) { // "1" is the roleId for admin
        return res.status(403).json({message: "Unauthorized: Only admins have access"});
    }
    next();
}
 
module.exports = {isAuth, isAdmin};