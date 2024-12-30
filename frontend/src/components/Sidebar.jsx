import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, PlusCircle } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal"; // Import the modal

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { getGroups, groups } = useGroupStore(); // Fetch groups
  const { authUser , onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups(authUser._id); // Fetch groups when component mounts
  }, [getUsers, getGroups, authUser._id]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  const handleCreateGroup = () => {
    setIsModalOpen(true); // Open modal on button click
  };

  return (
    <>
    {/* {console.log(selectedUser)} */}


      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        <div className="border-b border-base-300 w-full p-5 flex items-center justify-between">
          {/* Create Group Button (Mobile version) */}
          <button
            onClick={() => setIsModalOpen(true)} // Open modal
            className="btn btn-circle btn-sm btn-primary lg:hidden"
            title="Create Group"
          >
            <PlusCircle className="size-5" />
          </button>
          {/* Contacts Header */}
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
        </div>

        {/* Online Filter Toggle */}
        <div className="mt-3 hidden lg:flex items-center justify-between px-5">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>

        {/* Expanded Create Group Button */}
        <div className="mt-3 hidden lg:flex justify-between items-center px-5">
          <button
            onClick={handleCreateGroup} // Open modal
            className="btn btn-sm btn-primary flex items-center gap-2"
          >
            <PlusCircle className="size-4" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Groups List */}
        <div className="overflow-y-auto w-full py-3">
          {/* Display groups */}
          {groups.length > 0 && (
            <>
              <h3 className="font-medium text-sm px-5 mb-2">Groups</h3>
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedUser(group)} // Handle group selection (similar to users)
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={group.groupImage || "/groupavatar.png"} // Default image if no group image
                      alt={group.groupName}
                      className="size-12 object-cover rounded-full"
                    />
                  </div>

                  {/* Group info - only visible on larger screens */}
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{group.groupName}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Display users */}
          <h3 className="font-medium text-sm px-5 mb-2">Users</h3>
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No online users</div>
          )}
        </div>
      </aside>

      {/* Create Group Modal */}
      {isModalOpen && (
        <CreateGroupModal
          contacts={users} // Pass users to the modal
          onClose={() => setIsModalOpen(false)} // Close modal
        />
      )}
    </>
  );
};

export default Sidebar;
