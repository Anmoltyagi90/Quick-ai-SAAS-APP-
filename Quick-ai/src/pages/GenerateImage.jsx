import { Image, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_BASE_URL;
if (baseURL) {
  axios.defaults.baseURL = baseURL;
} else {
  console.warn("VITE_BASE_URL is not set. API calls may fail.");
}

const GenerateImage = () => {
  const imageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "Realistic style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedImage("");

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please sign in again.");
        setLoading(false);
        return;
      }

      console.log("Making API request to:", baseURL ? `${baseURL}/api/ai/generate-image` : "/api/ai/generate-image");
      console.log("Request payload:", { prompt: input, style: selectedStyle });

      const response = await axios.post(
        "/api/ai/generate-image",
        { prompt: input, style: selectedStyle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        if (response.data.content) {
          setGeneratedImage(response.data.content);
          toast.success("Image generated successfully!");
        } else {
          console.error("Response missing image URL:", response.data);
          toast.error("Image generated but URL is missing.");
        }
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate image. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-700">
      {/* Left Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Describe Your Image</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="Describe what you want to see in the image..."
          className="p-2 border w-full rounded-lg mt-1 outline-none text-sm border-gray-300"
          required
        />

        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-[90%]">
          {imageStyle.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition ${
                selectedStyle === item
                  ? "bg-blue-50 text-blue-700 border-green-400"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Toggle */}
        <div className="my-6 flex items-center gap-3">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm">Make this image public</p>
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#65ADFF] text-white px-4 py-2 mt-6 cursor-pointer text-sm rounded-lg disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <Image className="w-5" />
          )}
          Generate Image
        </button>
      </form>

      {/* Right Preview */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 w-full max-w-lg min-h-[420px] flex flex-col p-5">
        <div className="flex items-center gap-3 border-b pb-3">
          <Image className="w-5 h-5 text-[#00AD25]" />
          <h1 className="text-lg font-semibold text-gray-700">
            Generated Images
          </h1>
        </div>

        {!generatedImage ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center">
              <Image className="w-10 h-10" />
              <p>Enter a prompt and click Generate Image</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center p-4">
            <img
              src={generatedImage}
              alt="Generated"
              className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImage;
