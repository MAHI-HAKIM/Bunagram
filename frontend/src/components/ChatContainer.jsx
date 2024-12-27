import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utilis.js";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    groupParticipants, // Add participants' data from the store
    subscribeToMessages,
    getGroupParticipants,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    
    getMessages(selectedUser._id);
    
    if (selectedUser.participants) {
      getGroupParticipants(selectedUser._id);
    }
  
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, selectedUser.isGroup, getMessages, subscribeToMessages, unsubscribeFromMessages, selectedUser.participants, selectedUser, getGroupParticipants]);
  
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // console.log("Messages are ", messages);
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Helper function to get the sender's profile picture
  const getSenderProfilePic = (senderId) => {
    if (senderId === authUser._id) return authUser.profilePic || "/avatar.png";
    if (selectedUser.participants) {
      const participant = groupParticipants.find((user) => user._id === senderId);
      return participant ? participant.profilePic || "/avatar.png" : "/avatar.png";
    }
    return selectedUser.profilePic || "/avatar.png";
  };
  // Helper function to get the sender's profile picture
  const getSenderName = (senderId) => {
    // Check if the sender is not the authenticated user
    if (senderId !== authUser._id) {
      // For group chats, look for the participant's full name
      if (selectedUser.participants) {
        const participant = groupParticipants.find((user) => user._id === senderId);
        return participant ? participant.fullName || "Unknown" : "Unknown";
      }
      return selectedUser.fullName || "Unknown";
    }
    return "You"; // Return "You" for the authenticated user
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={getSenderProfilePic(message.senderId)} // Dynamically fetch the sender's profile picture
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
               
              <time className="text-xs opacity-50 ml-1">
                 {/* Display the sender's name */}
                {formatMessageTime(message.createdAt)} - {getSenderName(message.senderId)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.chatContent &&  <p>{message.chatContent}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
