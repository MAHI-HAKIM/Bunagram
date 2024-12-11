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
      const res = await axiosInstance.get(`/messages/${userId}`);
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
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
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
      };

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, encryptedMessageData);
      const newMessage = {
        ...res.data,
        chatContent: decryptMessage(res.data.encryptedText, selectedUser.privateKey),
      }

       set({ messages: [...messages, newMessage] });
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

      let reciverUser = useAuthStore.getState().authUser;
       const decryptedNewMessage = {
        ...newMessage,
        chatContent: decryptMessage(newMessage.encryptedText, reciverUser.privateKey),
      }
  
      set({
        messages: [...get().messages, decryptedNewMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
