import { generateToken , generateKeyPair } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { publicKey, privateKey } = generateKeyPair();

    console.log("publicKey", publicKey);
    console.log("privateKey", privateKey);


    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      publicKey,
      privateKey,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      // console.log("New user created: ", newUser);
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        publicKey: newUser.publicKey, // Optionally send the public key back to the client
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      publicKey: user.publicKey, // Optionally send the public key back to the
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicKey = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("publicKey");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ publicKey: user.publicKey });
  } catch (error) {
    console.error("Error fetching public key: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getKeys = async (req, res) => {
  try {
    // Retrieve the currently authenticated user from the request object (from middleware)
    const user = await User.findById(req.user._id).select("publicKey privateKey");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only send back the public key to the client
    res.status(200).json({ publicKey: user.publicKey , privateKey: user.privateKey });
  } catch (error) {
    console.error("Error fetching keys: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const checkAuth = (req, res) => {
  try {
    // console.log("User in checkAuth and checking", req.user);
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Couldnt verify shit");
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error while checking Auth in backend" });
  }
};
