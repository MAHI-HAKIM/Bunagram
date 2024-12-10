import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { encryptMessage , decryptMessage} from "../lib/cryptoUtilis.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

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
      const res = await axiosInstance.get(`/messages/${userId}`);

      // Decrypt messages if needed

        // Decrypt messages if needed
    const decryptedMessages = await Promise.all(
      res.data.map(async (message) => {
        if (message.isEncrypted) {
          try {
            const privateKey = useAuthStore.getState().privateKey; // Fetch the receiver's private key from auth store
            console.log("privateKey is ", privateKey);
            const decryptedText = await decryptMessage(message.encryptedText, privateKey);
            console.log("decryptedText is ", decryptedText);
            return { ...message, decryptedText }; // Add decrypted text to the message
          } catch (decryptError) {
            console.error('Decryption failed', decryptError);
            return { ...message, decryptedText: '[Decryption Error]' };
          }
        }
        return message;
      })
    );

      set({ messages: decryptedMessages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    console.log("selectedUser id is ", selectedUser._id , "messageData is ", messageData);
    try {
       // Fetch recipient's public key before sending

       const publicKeyRes = await axiosInstance.get(`auth/users/${selectedUser._id}/publicKey`);
        // console.log("publicKeyRes is ", publicKeyRes.data.publicKey);
       const recipientPublicKey = publicKeyRes.data.publicKey;
        // Encrypt message if text is present
      
        if (messageData.text) {
        const encryptedText = await encryptMessage(
          messageData.text, 
          recipientPublicKey
        );
        messageData.encryptedText = encryptedText;

        console.log("encryptedText is ", encryptedText);
      }

      console.log("messageData is ", messageData);
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      console.log("res is ", res.data);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;
  
    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
  
      // Decrypt message if encrypted
      if (newMessage.isEncrypted) {
        try {
          const privateKey = useAuthStore.getState().privateKey; // Fetch the receiver's private key from auth store
          const decryptedText = await decryptMessage(newMessage.encryptedText, privateKey);
          newMessage.decryptedText = decryptedText; // Add decrypted text to the message
        } catch (decryptError) {
          console.error('Decryption failed', decryptError);
          newMessage.decryptedText = '[Decryption Error]';
        }
      }
  
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },
   
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
