const jwt = require("jsonwebtoken");

/** authenticating user is login or not , And token expired or not */
module.exports.authenticator = (req,res,next)=>{
    try{
        /**get the authorization token from header */
        const token= req.headers.authorization;
        /** if token not found */
        if(!token) return res.status(400).send("token is required to access the data");
        /** verify the token and pass to next */
        const decode =  jwt.verify(token, process.env.SECRET_KEY);
        req.user = decode;
        next();
    }catch(e){
        /**if any error occure while verify the token then it will catch here send the error message to user */
        return res.status(400).send(e);
    }
}
/** authorization the user in the base of role  */
module.exports.authorization = (roleArray)=>{
    return (req,res,next )=>{
        try{
            const userRole = req?.user?.role
            if(!roleArray.includes(userRole)) return res.status(403).send({message:"unauthorized access"});
            next();
        }catch(e){
            return res.send({message:"error occure while authorization",error:e})
        }
    }
}