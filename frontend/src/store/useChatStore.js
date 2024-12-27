import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { encryptMessage , decryptMessage} from "../lib/utilis";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  groupParticipants : [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {

    set({ isMessagesLoading: true });
    try {
      let authUser = useAuthStore.getState().authUser;
      let selectedUser = get().selectedUser;
      // Fetch messages
      // console.log("Selected user is ", selectedUser);
      let res;
      if (selectedUser.participants) {
        res = await axiosInstance.get(`/messages/${selectedUser._id}`);

      }else{
         res = await axiosInstance.get(`/messages/${userId}`);

      }
      // Ensure data is defined
      if (!res.data) {
        throw new Error("Response data is undefined");
      }
      // Loop over messages and decrypt each one
    for (let message of res.data) {
      let decryptedMessage = null;

      message.receiverId.toString() === userId.toString() ? 
      decryptedMessage = decryptMessage(message.encryptedText, selectedUser.privateKey) 
      : decryptedMessage = decryptMessage(message.encryptedText, authUser.privateKey);

      message.chatContent = decryptedMessage || "Failed to decrypt";
    }
    // console.log("Messages are ", res.data);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getGroupParticipants: async (groupId)=>{
    try{
      // console.log("groupId is ", groupId);
      const res = await axiosInstance.get(`/messages/participants/${groupId}`);

      console.log("Group participants are ", res.data);
      set({ groupParticipants: res.data });

      // Ensure data is defined
      if (!res.data) {
        throw new Error("Response data is undefined");
      }

    }catch(error){
      console.error("Error in getGroupParticipants: ", error.message);
      toast.error(error.response.data.message);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      if (!selectedUser || !messageData.text.trim()) {
        throw new Error("Selected user or message text is missing");
      }

      const encryptedText = encryptMessage(messageData.text.trim(), selectedUser.publicKey);
      
      const encryptedMessageData = {
        ...messageData,
        encryptedText,
        ...(selectedUser.participants && {
          isGroupMessage: true,
          receiverId: selectedUser._id,
          groupId: selectedUser._id // Add groupId for group messages
        })
      };

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, encryptedMessageData);
      
      const newMessage = {
        ...res.data,
        chatContent: messageData.text.trim()
      };

      set({ messages: [...messages, newMessage] });

      // Emit socket event for group messages
      if (selectedUser.participants) {
        const socket = useAuthStore.getState().socket;
        socket.emit("groupMessage", {
          ...newMessage,
          groupId: selectedUser._id
        });
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

 
  broadcastMessage: async (messageData) => {
    try {
      const authUser = useAuthStore.getState().authUser;
      const socket = useAuthStore.getState().socket;

      if (!messageData.text.trim()) {
        throw new Error("Message text is missing");
      }

      // Get all users to broadcast to
      const users = await axiosInstance.get('/messages/users');
      const receivers = users.data.filter(user => user._id !== authUser._id);

      // Create messages for all receivers
      const messages = await Promise.all(
        receivers.map(async (receiver) => {
          // Encrypt message with receiver's public key
          console.log("encrypted with receiver's public key of ", receiver.fullName);
          const encryptedText = encryptMessage(messageData.text.trim(), receiver.publicKey);
          
          const messagePayload = {
            text: messageData.text.trim(),
            encryptedText,
            image: messageData.image,
            receiverId: receiver._id,
            isBroadcast: true
          };

          return axiosInstance.post('/messages/broadcast', messagePayload);
        })
      );

      // Emit socket event for broadcast
      socket.emit("broadcastMessage", {
        senderId: authUser._id,
        text: messageData.text.trim(),
        image: messageData.image,
        timestamp: new Date().toISOString(),
        isBroadcast: true
      });

      // Add messages to state
      const newMessages = messages.map(res => ({
        ...res.data,
        chatContent: messageData.text.trim() // Store original text for sender
      }));

      set(state => ({
        messages: [...state.messages, ...newMessages]
      }));

      return messages;
    } catch (error) {
      console.error("Error broadcasting message:", error);
      toast.error(error.response?.data?.message || "Failed to broadcast message");
      throw error;
    }
  },
  
  
  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    socket.on("newMessage", async (newMessage) => {
      let isRelevantMessage = false;

      if (newMessage.isBroadcast) {
        // For broadcast messages, we are the intended receiver
        isRelevantMessage = newMessage.receiverId === authUser._id;
      } else if (selectedUser?.participants) {
        // For group messages
        isRelevantMessage = newMessage.receiverId === selectedUser._id;
      } else {
        // For direct messages
        isRelevantMessage = newMessage.senderId === selectedUser._id;
      }

      if (!isRelevantMessage) return;

      try {
        let decryptedNewMessage;
        let decryptedContent;
        
        if (newMessage.isBroadcast) {
          try {
            decryptedContent = decryptMessage(newMessage.encryptedText, authUser.privateKey);
            if (!decryptedContent) {
              console.log("Broadcast message decryption returned empty content");
              return; // Skip this message if decryption returns empty
            }
          } catch (decryptError) {
            console.log("Broadcast message decryption failed, might be for another user");
            return; // Skip this message if decryption fails
          }

          decryptedNewMessage = {
            ...newMessage,
            chatContent: decryptedContent
          };
        } else if (selectedUser?.participants) {
          // For group messages
          decryptedContent = decryptMessage(newMessage.encryptedText, selectedUser.privateKey);
          decryptedNewMessage = {
            ...newMessage,
            chatContent: decryptedContent
          };
        } else {
          // For direct messages
          decryptedContent = decryptMessage(newMessage.encryptedText, authUser.privateKey);
          decryptedNewMessage = {
            ...newMessage,
            chatContent: decryptedContent
          };
        }

        // Only add the message if we successfully decrypted it
        if (decryptedContent) {
          set(state => ({
            messages: [...state.messages, decryptedNewMessage],
          }));
        }
      } catch (error) {
        // Only show error toast for non-broadcast messages or when debugging
        if (!newMessage.isBroadcast) {
          console.error("Error processing new message:", error);
          toast.error("Failed to decrypt message");
        } else {
          // For broadcast messages, just log it without showing error to user
          console.log("Skipped broadcast message processing:", error.message);
        }
      }
    });

    // Join room for group messages
    if (selectedUser?.participants) {
      socket.emit("joinRoom", selectedUser._id);
    }
  },
  // Your existing unsubscribeFromMessages remains the same


  unsubscribeFromMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    
    socket.off("newMessage");
    
    // Leave the room if it's a group chat
    if (selectedUser?.participants) {
      socket.emit("leaveRoom", selectedUser._id);
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
