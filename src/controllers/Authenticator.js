require('dotenv').config();
const jwt = require('jsonwebtoken');


module.exports.Authenticator = (req, res )=>{
    const tokenstring= req.headers.authorization;
    if (tokenstring) {
        try {
          const decodedToken = jwt.verify(tokenstring, process.env.SECRET_KEY);
          return res.status(200).json({ message: 'True' });
        } catch (error) {
            console.log(error);
          // Token is invalid or expired
          return res.status(201).json({ message: 'Error' });
        }
      }
      return res.status(201).json({ message: 'True' });
}