const express = require('express');
const router = express.Router();
const {userlogin , userregister} = require("../controller/authcontroller");
const user = require('../model/users');
router.get('/',(req,res) => {
    res.send('auth route is working ');
    console.log("auth is working ");
});
router.post("/login",userlogin);
router.post("register",userregister);
module.exports = router;

// register a new user  
router.post('/register', async (req, res) => {
    
    try {
        const { username, email, password } = req.body;

        const userexists = await user.findOne({ email });
        if (userexists) {
            return res.status(400).json({ message: "User already exists" });
        }  
        const usetr = await user.create({
            username,
            email,
            password
        });
        
        const token = jwt.sign(
            {
            id : user._id},
            process.env.JWT_SECRET || your_jwt_secret,
            {
                expiresIn: '30d'
            }
        );

        res.status(201).json({
            _id: usetr._id,
            username: usetr.username,
            email: usetr.email,
            token: token
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }   

});
 router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userexists = await user.findOne({ email });
        if (!userexists) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: userexists._id }, process.env.JWT_SECRET || your_jwt_secret, {
            expiresIn: '30d'
        });

        res.status(200).json({
            _id: userexists._id,
            username: userexists.username,
            email: userexists.email,
            token: token
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
});
