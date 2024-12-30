import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Check if the selected item is a group or a user
  const isGroup = selectedUser && selectedUser.groupName;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar (Group or User) */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={isGroup ? selectedUser.groupImage || "/groupavatar.png" : selectedUser.profilePic || "/avatar.png"}
                alt={isGroup ? selectedUser.groupName : selectedUser.fullName}
              />
            </div>
          </div>

          {/* User or Group Info */}
          <div>
            <h3 className="font-medium">{isGroup ? selectedUser.groupName : selectedUser.fullName}</h3>
            
            {/* Display Online Status */}
            <p className="text-sm text-base-content/70">
              {isGroup
                ? `${selectedUser.participants.length} participants`
                : onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)} className="text-base-content/70">
          {/* Add any close icon if needed */}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
