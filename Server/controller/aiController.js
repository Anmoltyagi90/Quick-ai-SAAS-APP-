import OpenAI from "openai";
import { clerkClient } from "@clerk/express";
import { Article } from "../model/Article.js";
import { BlogTitle } from "../model/BlogTitle.js";
import axios from "axios";
import { Image } from "../model/Image.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import FormData from "form-data";
// import pdf from "pdf-parse";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
    const { userId } = req.auth();

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Use Gemini API (same as blog titles and resume review)
    const response = await AI.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a professional article writer. Write comprehensive, well-structured articles with engaging content.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    const article = await Article.create({
      userId,
      prompt,
      content,
      plan,
    });

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    return res.status(200).json({
      success: true,
      content,
      articleId: article._id,
    });
  } catch (error) {
    console.error("Generate Article Error:", error?.response?.data || error);
    console.error("Error Status:", error?.response?.status);
    console.error("Error Message:", error?.message);

    // Extract error message from different error formats
    let errorMessage = "AI service busy, try again after some time";
    
    if (error?.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.error) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : error.response.data.error.message || errorMessage;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Handle specific error status codes
    const statusCode = error?.response?.status || 500;
    
    if (statusCode === 401) {
      errorMessage = "Unauthorized: Please check your API key";
    } else if (statusCode === 404) {
      errorMessage = "Service not found or not available";
    } else if (statusCode === 503) {
      errorMessage = "AI service is currently unavailable. Please try again in a moment";
    } else if (statusCode === 429) {
      errorMessage = "Rate limit exceeded. Please try again later";
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.auth.userId;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-1.5-flash", // Updated model name
      messages: [
        { role: "system", content: "Generate catchy blog titles" },
        { role: "user", content: prompt },
      ],
    });

    const titles = response.choices[0].message.content;

    const blogTitle = await BlogTitle.create({
      userId,
      prompt,
      titles,
      plan,
    });

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        titles: blogTitle.titles,
        blogTitleId: blogTitle._id,
      },
    });
  } catch (error) {
    console.error("Generate Blog Title Error:", error);
    console.error("Error Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { prompt, style } = req.body;
    const userId = req.auth.userId;
    const plan = req.plan;

    // 🔒 Premium check
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // 🎨 Generate image from ClipDrop
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data).toString(
      "base64"
    )}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    // 💾 Save to DB
    const image = await Image.create({
      userId,
      prompt,
      imageUrl: secure_url,
      style: style || "realistic",
      plan,
    });

    // ✅ Single Response
    return res.status(200).json({
      success: true,
      content: secure_url,
      imageId: image._id,
    });
  } catch (error) {
    console.error("Generate Image Error:", error);
    console.error("Error Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Image generation failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const plan = req.plan;

    // 🔒 Premium check
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // ☁ Cloudinary background removal
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "bg-removed",
      transformation: [
        {
          effect: "background_removal",
        },
      ],
    });

    // 💾 Save to D
    const savedImage = await Image.create({
      userId,
      prompt: "Background removed image",
      imageUrl: upload.secure_url,
      plan,
    });

    // ✅ SINGLE response
    return res.status(200).json({
      success: true,
      data: savedImage,
    });
  } catch (error) {
    console.error("Remove Background Error:", error);
    res.status(500).json({
      success: false,
      message: "Background removal failed",
    });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { Object: objectName } = req.body; // Object keyword fix
    const plan = req.plan;

    // 🔒 Premium check
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // ☁ Upload original image
    const upload = await cloudinary.uploader.upload(req.file.path);

    // ☁ Generate transformed image URL
    const imageUrl = cloudinary.url(upload.public_id, {
      transformation: [
        {
          effect: `gen_remove:${objectName}`,
        },
      ],
      resource_type: "image",
    });

    // 💾 Save to DB
    const savedImage = await Image.create({
      userId,
      prompt: "Object removed image",
      imageUrl: imageUrl,
      plan,
    });

    // ✅ SINGLE response
    return res.status(200).json({
      success: true,
      data: savedImage,
    });
  } catch (error) {
    console.error("Remove Object Error:", error);
    return res.status(500).json({
      success: false,
      message: "Object removal failed",
    });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const resume = req.file;
    const plan = req.plan;

    // 🔒 Premium check
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    // 📄 Read PDF
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await PDFParse(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement.

Resume Content:
${pdfData.text}`;

    // 🤖 AI Review
    console.log("Making AI API request for resume review...");
    const response = await AI.chat.completions.create({
      model: "gemini-1.5-flash", // Updated model name
      messages: [
        { role: "system", content: "You are a professional resume reviewer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    // 💾 Save to DB (store review text)
    // Note: Using Image model to store review, but imageUrl is required
    // We'll use a data URI placeholder since imageUrl is required by schema
    const savedFile = await Image.create({
      userId,
      prompt: `Resume Review: ${pdfData.text.substring(0, 200)}...`,
      imageUrl: "data:text/plain;base64,cmVzdW1lLXJldmlldy1wbGFjZWhvbGRlcg==", // Base64 placeholder
      plan,
    });

    // ✅ Response
    return res.status(200).json({
      success: true,
      review: content,
      data: savedFile,
    });
  } catch (error) {
    console.error("Resume Review Error:", error);
    console.error("Error Stack:", error.stack);
    console.error("Error Status:", error.status);
    console.error("Error Response:", error.response?.data);
    console.error("Error Message:", error.message);

    // Extract error details
    const errorStatus = error.status || error.response?.status || error.code;
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Resume review failed";

    // Handle 400 Bad Request errors
    if (errorStatus === 400 || errorMessage.includes("400")) {
      return res.status(400).json({
        success: false,
        message: errorMessage.includes("no body")
          ? "Invalid request to AI service. Please check your resume file and try again."
          : errorMessage || "Invalid request. Please check your resume file.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    // Handle 429 Rate Limit errors
    const isRateLimit =
      errorStatus === 429 ||
      (error.message && error.message.includes("429")) ||
      (error.message && error.message.toLowerCase().includes("rate limit"));

    if (isRateLimit) {
      const retryAfter =
        error.response?.headers?.["retry-after"] ||
        error.response?.headers?.["Retry-After"] ||
        60;
      return res.status(429).json({
        success: false,
        message:
          "AI service is currently busy. Please wait a moment and try again.",
        retryAfter: parseInt(retryAfter),
      });
    }

    // Handle other API errors
    if (error.response || errorStatus) {
      const statusCode = errorStatus || error.response?.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
