import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId , io } from "../lib/socket.js";
import { encryptMessage,decryptMessage } from "../lib/cryptoUtilis.js";


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
  

  // Controller to fetch and decrypt messages
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    
    // Fetch messages where either the sender or receiver is the user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Decrypt messages before sending to the client
    const decryptedMessages = await Promise.all(messages.map(async (message) => {
      let decryptedMessage = null;

      if (message.receiverId.toString() === myId.toString()) {
        const reciverUser = await User.findById(myId);
        decryptedMessage = decryptMessage(message.encryptedText, reciverUser.privateKey);
      } else if (message.senderId.toString() === myId.toString()) {
        const reciverUser = await User.findById(message.receiverId);
        decryptedMessage = decryptMessage(message.encryptedText, reciverUser.privateKey);
      }

      return {
        ...message.toObject(),
        text: decryptedMessage || "Failed to decrypt",
      };
    }));

    // Send decrypted messages to the client
    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// export const getMessages = async (req, res) => {
//     try {
//       const { id: userToChatId } = req.params;
//       const myId = req.user._id;
  
//       const messages = await Message.find({
//         $or: [
//           { senderId: myId, receiverId: userToChatId },
//           { senderId: userToChatId, receiverId: myId },
//         ],
//       });
      
//       // const firstMessage = messages[0];
//       // console.log("First Message ",firstMessage);

//       // const reciverUser = await User.findById(firstMessage.receiverId);
//       // const decryptFirstMessage = decryptMessage(firstMessage.encryptedText, reciverUser.privateKey);
      
//       // console.log("decryptedFirstMessage is ", decryptFirstMessage);

//       const decryptedMessages = await Promise.all(
//         messages.map(async (message) => {
//           if (message.receiverId.toString() === myId.toString()) {
//             // Decrypting as receiver
//             const receiverUser = await User.findById(myId); // Current user
//             const decryptedMessage = decryptMessage(message.encryptedText, receiverUser.privateKey);
      
//             if (decryptedMessage !== null) {
//               return {
//                 ...message.toObject(),
//                 text: decryptedMessage,
//               };
//             }
//           } else if (message.senderId.toString() === myId.toString()) {
//             // Decrypting as sender
//             const receiverUser = await User.findById(message.receiverId); // Chat partner
//             const decryptedMessage = decryptMessage(message.encryptedText, receiverUser.privateKey);
      
//             if (decryptedMessage !== null) {
//               return {
//                 ...message.toObject(),
//                 text: decryptedMessage,
//               };
//             }
//           }
      
//           // Fallback if decryption fails
//           return {
//             ...message.toObject(),
//             text: "Failed to decrypt",
//           };
//         })
//       );
      
//       // console.log("Decrypted Messages: ", decryptedMessages.text);
//       decryptedMessages.forEach((message) => {
//         console.log("Decrypted Message text: ", message.text);
//       });
//       res.status(200).json(messages);
//     } catch (error) {
//       console.log("Error in getMessages controller: ", error.message);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   };

export const sendMessage = async (req, res) => {
    try {
      const { text, image , encryptedText} = req.body;

      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      console.log("receiverId is ", receiverId, "senderId is ", senderId);
  
      let imageUrl;
      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }

      // const recvUser = await User.findById(receiverId);

      // const encryptedUserText = encryptMessage(text, recvUser.publicKey);
      // // console.log("encryptedText is ", encryptedUserText);
      // // console.log("recvUser is ", recvUser);
      // if(encryptedUserText === null){
      //   return res.status(400).json({ error: "Failed to send message" });
      // }

      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        encryptedText,
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