import jwt from "jsonwebtoken";
import User from "../models/User_Model.js";

const authMiddleware =(req , res , next ) =>{
    try{
        const authHeader = req.headers.authorization;
    if(!authHeader){

        return res.status(401).json({message:"Authorization header missing"});
    }
    const token = authHeader.split(" ")[1];
    
    if(!token){
        return res.status(401).json({message:"Token missing"});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.userId;

    const user = User.findById(req.userId);
    if(!user){
        return res.status(401).json({message:"User not found"});
    }
    if(user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()){
        return res.status(401).json({message:"Token is invalid due to password change please login again to get a new token"});
    }
    req.user+user(); // this is used to get user details in the route where we are 
    // using authmiddleware and then we can use req.user to get user details in that route
    next();


} catch (error) {
    
    return res.status(401).json({message:"Invalid token"});
}
};

export default authMiddleware;
