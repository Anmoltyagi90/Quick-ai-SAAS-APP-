import React, { useState } from "react";
import { Hash, Sparkle } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const baseURL = import.meta.env.VITE_BASE_URL;
if (baseURL) {
  axios.defaults.baseURL = baseURL;
} else {
  console.warn("VITE_BASE_URL is not set. API calls may fail.");
}

const BlogTitle = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business", // स्पेलिंग ठीक की
    "Health",
    "LifeStyle",
    "Education", // स्पेलिंग ठीक की
    "Travel",
    "Food",
  ];

  const [seletedCategory, setSeletedCategory] = useState("General");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setContent(""); // Clear previous content while loading
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please sign in again.");
        setLoading(false);
        return;
      }

      const prompt = `Generate 5 catchy and SEO-friendly blog titles for the topic: "${input}" in the "${seletedCategory}" category. 
      Please provide them as a numbered list with bold text.`;

      console.log("Making API request to:", baseURL ? `${baseURL}/api/ai/generate-blog-title` : "/api/ai/generate-blog-title");
      console.log("Request payload:", { prompt, category: seletedCategory });

      const response = await axios.post(
        "/api/ai/generate-blog-title",
        { prompt, category: seletedCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      // Accessing the nested data correctly based on your backend structure
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.titles) {
          setContent(response.data.data.titles);
          toast.success("Titles generated!");
        } else {
          console.error("Response missing titles:", response.data);
          toast.error("Titles generated but content is missing.");
        }
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      // Handle the 429 error specifically in the UI
      const errorMsg =
        error.response?.data?.message || 
        error.message || 
        "AI Server busy, try again later";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2">
          <Sparkle className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Topic Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="e.g. Future of AI, Healthy Diet..."
          className="p-2 border w-full rounded-lg px-3 mt-1 outline-none text-sm border-gray-300 focus:border-[#8E37EB]"
          required
        />

        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSeletedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-all ${
                seletedCategory === item
                  ? "bg-purple-50 text-purple-700 border-purple-400 font-bold"
                  : "text-gray-500 border-gray-300 hover:border-purple-300"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-8 text-sm rounded-lg cursor-pointer hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5" />
          )}
          Generate titles
        </button>
      </form>

      {/* Result Area */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 w-full max-w-lg min-h-[420px] flex flex-col p-5">
        <div className="flex items-center gap-3 border-b pb-3">
          <Hash className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-lg font-semibold text-gray-700">
            Generated Titles
          </h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center">
              <Hash className="w-10 h-10 opacity-20" />
              <p>Enter a topic and click generate to see AI magic</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 h-full overflow-y-auto text-sm text-slate-600 leading-relaxed">
            <div className="prose prose-purple max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitle;
