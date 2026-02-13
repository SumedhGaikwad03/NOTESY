const user = require('../model/users');
const Product = require('../model/products');
const userlogin = async (req , res ) =>{

    try 
    {
        res.status(200).json({message : "login sucessfull", user: {username: 'testUser'}});
    }
    catch(error){
        console.error("invalid login",error);
        res.status(500).json({message : "error during login ",error : error.message});

    }

}

const userregister = async (req , res ) => {
    try {
        res.status(200).json({message : "login sucessfull", user : {username : 'testUser'}});
    }
    catch{
        console.error("invalid user ",error);
    }
} 

module.exports={
    userlogin,userregister
};