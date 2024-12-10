import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    }, 
    profilePic: {
      type: String,
      default: "",
    },
    publicKey: {
      type: String, // Store the private key as a string
      required: true,
    },
    privateKey: {
      type: String, // Store the private key as a string
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
