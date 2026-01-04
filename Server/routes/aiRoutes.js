import express from "express";
import { auth } from "../middleWare/auth.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  resumeReview,
} from "../controller/aiController.js";
import { upload } from "../utils/multer.js";

const aiRoutes = express.Router();

// Add route logging
aiRoutes.use((req, res, next) => {
  console.log(`🎯 AI Route matched: ${req.method} ${req.path}`);
  next();
});

aiRoutes.post("/generate-article", auth, generateArticle);
aiRoutes.post("/generate-blog-title", auth, generateBlogTitle);
aiRoutes.post("/generate-image", auth, generateImage);
aiRoutes.post(
  "/remove-image-background",
  upload.single("image"),
  auth,
  removeImageBackground
);
aiRoutes.post(
  "/remove-image-object",
  upload.single("image"),
  auth,
  removeImageObject
);
aiRoutes.post("/review-resume", upload.single("resume"), auth, resumeReview);

// Log all registered routes
console.log("✅ AI Routes registered:");
console.log("  POST /api/ai/generate-article");
console.log("  POST /api/ai/generate-blog-title");
console.log("  POST /api/ai/generate-image");
console.log("  POST /api/ai/remove-image-background");
console.log("  POST /api/ai/remove-image-object");
console.log("  POST /api/ai/review-resume");

export default aiRoutes;
