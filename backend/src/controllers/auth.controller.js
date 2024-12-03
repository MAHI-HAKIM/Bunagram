import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

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
                message: "User created successfully!!",
            });
        }else{
            return res.status(400).json({msg: "Invalid user data"});
        }


    }catch(err){
        console.log("Error in Signup controller ::" , err.message);
        res.status(500).json({msg: "Internal Server Error"});
    }
};

export const login = async (req, res) => {

    const {email, password} = req.body;
    try{
        //Check if user exists
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({msg: "Invalid credentials while finding by email"});
        }

        await bcrypt.compare(password, user.password, (err, result) => {
            if(err){
                return res.status(400).json({msg: "Invalid credentials in Compare"});
            }
            if(result){
                //Generate JWT token 
                generateToken(user._id, res);

                res.status(200).json({
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    profilePic: user.profilePic,
                    message: "User logged in successfully",
                });
            }else{
                return res.status(400).json({msg: "Invalid credentials in the password"});
            }
        });

    }catch(err){
        console.log("Error in Login controller ::" , err.message);
        res.status(500).json({msg: "Internal Server Error"});
    }
};

export const logout = (req, res) => {
    try{
        res.cookie("token", "",{maxAge: 0});
        res.status(200).json({msg: "User logged out successfully"});

    }catch(err){
        console.log("Error in Logout controller ::" , err.message);
        res.status(500).json({msg: "Internal Server Error"});
    } 
};  

export const updateProfile = async (req, res) => {
    try{
        const {profilePic} = req.body;
        const userID = req.user._id;

        // const user = await User.findById(userID);
        // if(!user){
        //     return res.status(404).json({msg: "User not found"});
        // }  
        // user.profilePic = profilePic;
        
        if(!profilePic){
            return res.status(400).json({msg: "Profile Picture is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        
        const updatedUser = await user.findByIdAndUpdate(userID, {profilePic: uploadResponse.secure_url}, {new: true});

        res.status(200).json(updatedUser);

    }catch(err){
        console.log("Error in updateProfile controller ::" , err.message);
        res.status(500).json({msg: "Internal Server Error"});
    }
};

export const checkAuth = (req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth controller ::", error.message);
        res.status(500).json({msg: "Internal Server Error"});
    }
};