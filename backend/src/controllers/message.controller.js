import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId , io } from "../lib/socket.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
  
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.error("Error in getUsersForSidebar: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

export const getMessages = async (req, res) => {
    try {
      const { id: userToChatId } = req.params;
      const myId = req.user._id;
  
      if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
        return res.status(400).json({ error: "Invalid userToChatId" });
      }
  
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
          { receiverId: userToChatId, isGroupMessage: true },
        ],
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error in getMessages controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

export const fetchGroupParticipants = async (req, res) => {
  try {
    // Extract the group ID from the request parameters
    const {id : groupId } = req.params;

    // console.log("groupId is ", groupId);

    // Validate if the group ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: "Invalid groupId" });
    }

    // Fetch the group document using the groupId
    const selectedGroup = await Group.findById(groupId);

    // Check if the group exists
    if (!selectedGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    // console.log("Selected group is ", selectedGroup);

    // Extract participant IDs from the group document
    const participantIds = selectedGroup.participants;

    // Fetch user details based on participant IDs (excluding password)
    const groupParticipants = await User.find({ _id: { $in: participantIds } }).select("fullName profilePic");

    // console.log("Group participants are ", groupParticipants);

    // Return the participants' details
    res.status(200).json(groupParticipants);
  } catch (error) {
    console.log("Error in fetchGroupParticipants controller: ", error.message);
    res.status(500).json({ error: "Internal server error in group participants" });
  }
};

  

export const sendMessage = async (req, res) => {
    try {
      const { text, image , encryptedText , isGroupMessage} = req.body;

      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      console.log("receiverId is ", receiverId, "senderId is ", senderId);
  
      let imageUrl;
      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }

      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        encryptedText,
        isGroupMessage,
        isEncrypted: true,
        image: imageUrl,
      });
  
      await newMessage.save();

      const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error in message" });
    }
  };

export const sendGroupMessage = async (req, res) => {
  try{
    const {text , image , encryptedText , isGroupMessage} = req.body;

    const {id: receiverId} = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      encryptedText,
      isGroupMessage,
      image: imageUrl
    });

    await newMessage.save();

    console.log("Saved to database ", newMessage);


  }catch(error){
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error in group message" });
  }
};