import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUserForSidebar = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);

    }catch(err){
        console.log("Error in getUserForSidebar controller ::", err.message);
        res.status(500).json({msg: "Internal Server Error"});
    }
};

export const getusermessages = async (req, res) => {
 try{
        const {id:userToChatID} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or :[
                {to: userToChatID, from: myId},
                {to: myId, from: userToChatID}
            ]
        })

        res.status(200).json(messages);

 }catch(err){
     console.log("Error in getusermessages controller ::", err.message);
     res.status(500).json({msg: "Internal Server Error"});
 }
};

export const sendmessage = async (req, res) => {
    try{
        const {text , image} = req.body;
        const {id:receiverID} = req.params;
        const senderId = req.user._id;

        if(!text && !image){
            return res.status(400).json({msg: "Text or Image is required"});
        }

        let imageURL = "";
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.selure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL,
        });

        await newMessage.save();

        //todo: realtime functionality goes here => socket.io

        res.status(201).json(newMessage);

    }catch(err){
        console.log("Error in sendmessage controller ::", err.message);
        res.status(500).json({msg: "Internal Server Error"});
    }   
};