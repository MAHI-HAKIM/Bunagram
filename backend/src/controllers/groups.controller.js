import { generateToken } from "../lib/utils.js";
import { generateKeyPair } from "../lib/cryptoUtilis.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroup = async (req, res) => {
    const { groupName, participants, groupImage } = req.body;
    const userId = req.user._id; // Corrected extraction of userId
  
    try {
      // Check if all required fields are provided
      if (!groupName || !participants) {
        return res.status(400).json({ message: "All fields are required" });
      }
      // Ensure the user is included in the participants list
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      // Ensure there are at least two participants
      if (participants.length < 2) {
        return res.status(400).json({ message: "Group must have at least 2 participants" });
      }
      // Check if group image is provided, and upload it if so
      let uploadedGroupImage = "";
      if (groupImage) {
        const uploadResponse = await cloudinary.uploader.upload(groupImage);
        uploadedGroupImage = uploadResponse.secure_url;
      }
      // Check if a group with the same name already exists
      const groupExists = await Group.findOne({ groupName });
      if (groupExists) {
        return res.status(400).json({ message: "Group already exists" });
      }
  
      // Generate an encryption key for the group
      const { publicKey , privateKey } = generateKeyPair();
  
      // Create the new group
      const newGroup = new Group({
        groupName,
        participants,
        groupImage: uploadedGroupImage,
        publicKey: publicKey,
        privateKey: privateKey
      });
  
      // Save the group to the database
      await newGroup.save();
  
      // Respond with the created group details
      res.status(201).json({
        _id: newGroup._id,
        groupName: newGroup.groupName,
        participants: newGroup.participants,
        groupImage: uploadedGroupImage, // Use the uploaded image URL
      });
    } catch (error) {
      console.log("Error in createGroup controller", error.message);
      res.status(500).json({ message: "Internal Server Error while creating group in backend" });
    }
  };
  
export const getGroupsForSidebar = async (req,res)=>{
    try{
        const {id : loggedInUserId} = req.params;
        const groups = await Group.find({participants: loggedInUserId});
        res.status(200).json(groups);
    }catch(error){
        console.log("Error in getGroupsForSidebar controller", error.message);
        res.status(500).json({ message: "Internal Server Error while getting groups in backend" });
    }
}

// Function to get group members by group ID
export const getSelectedGroupMembers = async (req, res) => {
    try {
      const groupId = req.params.id; // Group ID from the route parameter
  
      // Find the group by its ID
      const group = await Group.findById(groupId).populate('participants', 'fullName profilePic _id'); // Populate participants (if referenced in the Group model)
  
      // If the group is not found, return an error
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      // Send the group members (participants) as the response
      return res.status(200).json({
        message: "Group members fetched successfully",
        participants: group.participants,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };