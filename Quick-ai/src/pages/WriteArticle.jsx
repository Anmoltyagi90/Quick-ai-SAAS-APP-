import { Edit, Flashlight, Sparkle } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

const baseURL = import.meta.env.VITE_BASE_URL;
if (baseURL) {
  axios.defaults.baseURL = baseURL;
} else {
  console.warn("VITE_BASE_URL is not set. API calls may fail.");
}

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 word)" },
    { length: 1200, text: "Short (800-1200 word)" },
    { length: 1600, text: "Short (1200+ word)" },
  ];

  const [seletedLength, setSeletedLength] = useState(articleLength[0]);
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

      const prompt = `Write a comprehensive, professional, and detailed article about "${input}". 
    The article must be around ${seletedLength.length} words. 
    Use a catchy title, an introduction, several detailed subheadings (using ##), and a conclusion. 
    Make it engaging and informative.`;

      console.log("Making API request to:", baseURL ? `${baseURL}/api/ai/generate-article` : "/api/ai/generate-article");
      console.log("Request payload:", { prompt, length: seletedLength.length });

      const response = await axios.post(
        "/api/ai/generate-article",
        { prompt, length: seletedLength.length },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        if (response.data.content) {
          setContent(response.data.content);
          toast.success("Article generated successfully!");
        } else {
          console.error("Response missing content:", response.data);
          toast.error("Article generated but content is missing.");
        }
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      console.error("Error Headers:", error.response?.headers);
      
      // Handle 429 Rate Limit errors specifically
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60;
        toast.error(
          `AI service is busy. Please wait ${retryAfter} seconds and try again.`,
          { duration: 5000 }
        );
      } else {
        const errorMsg =
          error.response?.data?.message || 
          error.message || 
          "Failed to generate article. Please check your connection and try again.";
        toast.error(errorMsg);
      }
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
          <Sparkle className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Article Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="The future of artifical intelligence is...."
          className="p-2 border w-full rounded-lg px-3 mt-1 outline-none text-sm border-gray-300"
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <span
              key={index}
              onClick={() => setSeletedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                seletedLength.text === item.text
                  ? "bg-blue-50 text-blue-700 border-blue-400"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>
        <br />
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Edit className="w-5" />
          )}
          Generate article
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg border border-gray-200 w-full max-w-lg min-h-[420px] flex flex-col p-5">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-3">
          <Edit className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-lg font-semibold text-gray-700">
            Generated Article
          </h1>
        </div>

        {/* Content Area */}
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center">
              <Edit className="w-10 h-10" />
              <p>Enter a Topic and click Generate article to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div className="reset-tw,">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
