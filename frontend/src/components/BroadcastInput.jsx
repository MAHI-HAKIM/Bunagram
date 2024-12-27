// components/BroadcastInput.jsx
import { useRef, useState } from "react";
import { Image } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

const BroadcastInput = () => {
  const [broadcastText, setBroadcastText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { broadcastMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    if (!broadcastText.trim() && !imagePreview) return;

    try {
      setIsLoading(true);
      
      await broadcastMessage({
        text: broadcastText.trim(),
        image: imagePreview
      });

      toast.success("Message broadcasted successfully!");
      
      // Clear form
      setBroadcastText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to broadcast message:", error);
      toast.error("Failed to broadcast message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-4">
      <form onSubmit={handleBroadcast} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full input input-bordered input-sm rounded-lg pr-20"
            placeholder="Broadcast a message..."
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className={`absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Image size={16} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={(!broadcastText.trim() && !imagePreview) || isLoading}
        >
          {isLoading ? "Broadcasting..." : "Broadcast"}
        </button>
      </form>
      {imagePreview && (
        <div className="absolute mt-1">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-8 w-8 object-cover rounded"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
              disabled={isLoading}
            >
              <span className="text-xs">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastInput;