import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
  authUser: null,
  isCreatingGroup: false,
  isUpdatingGroupProfile: false,
  isFetchingGroups: false,
  groups: [],
  selectedGroup: null,
  selectedGroupMembers: [],
  privateKey: null,

  createGroup: async (data) => {
    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/groups/create-group", data);
      set({ selectedGroup: res.data });
      toast.success("Group created successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  getGroups: async (userId) => {
    set({ isFetchingGroups: true });
    try {
      const res = await axiosInstance.get(`/groups/groups/${userId}`);
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isFetchingGroups: false });
    }
  },

  // Fetch selected group members
  getSelectedGroupMembers: async () => {
    const { selectedGroup, authUser } = get(); // Get selected group and authUser from the store
    if (selectedGroup && authUser) {
      try {
        const res = await axiosInstance.get(`/groups/group-members/${selectedGroup._id}`);
        const groupMembers = res.data;

        const filteredMembers = groupMembers.filter((member) => member._id === authUser._id);
        set({ selectedGroupMembers: filteredMembers });
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  },

  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
}));
