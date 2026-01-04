import { File, FileText, Sparkles } from "lucide-react";
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

const ReviewResume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select a resume file");
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF, JPG, or PNG file");
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setLoading(true);
    setReview("");

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please sign in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("resume", selectedFile);

      console.log("Making API request to:", baseURL ? `${baseURL}/api/ai/review-resume` : "/api/ai/review-resume");
      console.log("File:", selectedFile.name, "Size:", selectedFile.size, "Type:", selectedFile.type);

      const response = await axios.post(
        "/api/ai/review-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        if (response.data.review) {
          setReview(response.data.review);
          toast.success("Resume reviewed successfully!");
        } else {
          console.error("Response missing review:", response.data);
          toast.error("Review generated but content is missing.");
        }
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);

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
          "Failed to review resume. Please check your file and try again.";
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
          <Sparkles className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Resume</p>
        <input
          onChange={(e) => setSelectedFile(e.target.files[0])}
          type="file"
          accept="application/pdf,image/jpeg,image/jpg,image/png"
          className="p-2 border w-full rounded-lg px-3 mt-1 outline-none text-sm border-gray-300 text-gray-600"
          required
        />

        <p
          className="text-sm text-gray-500 font-medium
         mt-1"
        >
          Supports PDF, JPG,PNG formats
        </p>

        <button
          disabled={loading || !selectedFile}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <FileText className="w-5" />
          )}
          Review Resume
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg border border-gray-200 w-full max-w-lg min-h-[420px] flex flex-col p-5 max-h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-3">
          <FileText className="w-5 h-5 text-[#00DA83]" />
          <h1 className="text-lg font-semibold text-gray-700">
            Analysis Results
          </h1>
        </div>

        {/* Content Area */}
        {!review ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center">
              <FileText className="w-10 h-10" />
              <p>Upload a resume and click "Review Resume" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 h-full overflow-y-auto text-sm text-slate-600 leading-relaxed">
            <div className="prose prose-green max-w-none">
              <ReactMarkdown>{review}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;
