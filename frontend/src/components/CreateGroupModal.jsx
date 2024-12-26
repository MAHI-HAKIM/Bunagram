import { useState } from "react";
import { useGroupStore } from "../store/useGroupStore";

const CreateGroupModal = ({ contacts, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null); // Store image file
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [errors, setErrors] = useState({ groupName: "", participants: "" });
  const { createGroup } = useGroupStore();

  const handleNameChange = (e) => {
    setGroupName(e.target.value);
    setErrors((prev) => ({ ...prev, groupName: "" })); // Clear error when the user changes the name
  };

  const handleUserSelect = (userId) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
    setErrors((prev) => ({ ...prev, participants: "" })); // Clear error when users are selected
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setGroupImage(base64Image);
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let isValid = true;
    const newErrors = { groupName: "", participants: "" };

    // Validation for Group Name
    if (!groupName) {
      newErrors.groupName = "Group name is required.";
      isValid = false;
    }
    // Validation for Participants (at least 2)
    if (selectedParticipants.length < 2) {
      newErrors.participants = "At least two participants are required.";
      isValid = false;
    }
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // // Debugging the final values before submitting
    // console.log("Final Group Data before submission:");
    // console.log("Group Name:", groupName);
    // console.log("Selected Participants:", selectedParticipants);
    // console.log("Group Image (Base64):", groupImage);

    // Call your group creation function (e.g., to create group via API)
    const groupData = { groupName, groupImage, participants: selectedParticipants };
    createGroup(groupData);

    // Close the modal after successful group creation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 w-96">
        <h2 className="text-lg font-bold mb-4">Create Group</h2>

        {/* Group Image Upload */}
        <div className="mb-4 flex flex-col items-center">
          <label htmlFor="groupImage" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {groupImage ? (
                // Display the image (this is a base64 URL after conversion)
                <img
                  src={groupImage}
                  alt="Group"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500">Add Picture</span>
              )}
            </div>
          </label>
          <input
            type="file"
            id="groupImage"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload} // First step: handling the file
          />
        </div>

        {/* Group Name */}
        <div className="mb-4">
          <input
            type="text"
            value={groupName}
            onChange={handleNameChange}
            placeholder="Group Name"
            className="input input-bordered w-full"
          />
          {errors.groupName && (
            <p className="text-red-500 text-xs mt-1">{errors.groupName}</p>
          )}
        </div>

        {/* Participants List */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Available Contacts</h3>
          <div className="overflow-y-auto max-h-40">
            {contacts.map((contact) => (
              <label key={contact._id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(contact._id)}
                  onChange={() => handleUserSelect(contact._id)}
                  className="checkbox"
                />
                <span>{contact.fullName}</span>
              </label>
            ))}
          </div>
          {errors.participants && (
            <p className="text-red-500 text-xs mt-1">{errors.participants}</p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">Create</button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
