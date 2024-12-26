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
      // console.log("Selected user is ", selectedUser);
      let res;
      if (selectedUser.participants) {
        res = await axiosInstance.get(`/messages/${selectedUser._id}`);

      }else{
         res = await axiosInstance.get(`/messages/${userId}`);

      }
      // console.log("res.data", res.data);
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
  
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    socket.on("newMessage", async (newMessage) => {
      console.log("New message received:", newMessage);
      
      let isRelevantMessage = false;

      if (selectedUser.participants) {
        // For group messages, check if the message is for this group
        isRelevantMessage = newMessage.receiverId === selectedUser._id;
      } else {
        // For direct messages, check if the message is from the selected user
        isRelevantMessage = newMessage.senderId === selectedUser._id;
      }

      if (!isRelevantMessage) return;

      try {
        let decryptedNewMessage = "";
        if(selectedUser.participants){
          decryptedNewMessage = {
            ...newMessage,
            chatContent: decryptMessage(newMessage.encryptedText, selectedUser.privateKey)
          };
        }else{
          decryptedNewMessage = {
            ...decryptedNewMessage,
            chatContent: decryptMessage(newMessage.encryptedText, authUser.privateKey)
          };
        }

        set(state => ({
          messages: [...state.messages, decryptedNewMessage],
        }));
      } catch (error) {
        console.error("Error processing new message:", error);
        toast.error("Failed to decrypt new message");
      }
    });

    // Join the room for group messages
    if (selectedUser.participants) {
      socket.emit("joinRoom", selectedUser._id);
    }
  },

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
