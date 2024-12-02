import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";


export const login = (req, res) => {

    res.send("Login route");
};

export const logout = (req, res) => {
    res.send("Logout route");
};  

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try{
        //Create new user && Hash Password
        if(!fullName || !email || !password){
            return res.status(400).json({msg: "All fields are required"});
        }
        
        if(password.length < 6){
            return res.status(400).json({msg: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({msg: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword,
        });

        if(newUser){
            //Generate JWT token 
            // const token = 
            generateToken(newUser._id, res);
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                message: "User created successfully",
            });
        }else{
            return res.status(400).json({msg: "Invalid user data"});
        }


    }catch(err){
        console.log("Error in Signup controller ::" , err.message);
        res.status(500).json({msg: "Internal Server Error"});
    }
};