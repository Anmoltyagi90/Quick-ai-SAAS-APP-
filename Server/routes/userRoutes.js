import express from "express";
import { auth } from "../middleWare/auth.js";
import {
  getPublishedCreations,
  getUserCreations,
  toggleLikeCreations,
} from "../controller/userController.js";

const userRouter = express.Router();

userRouter.get("/get-user-creation", auth, getUserCreations);
userRouter.get("/get-publish-creation", auth, getPublishedCreations);
userRouter.post("/toggle-like-creation", auth, toggleLikeCreations);

export default userRouter;
