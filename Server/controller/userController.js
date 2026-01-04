import Creation from "../model/creationModel.js";

export const getUserCreations = async (req, res) => {
  try {
    const authData = req.auth?.();
    const userId = authData?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const creations = await Creation.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: creations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await Creation.find({ publish: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: creations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleLikeCreations = async (req, res) => {
  try {
    const authData = req.auth?.();
    const userId = authData?.userId;
    const { id } = req.body;

    if (!userId || !id) {
      return res.status(400).json({
        success: false,
        message: "UserId or CreationId missing",
      });
    }

    const creation = await Creation.findById(id);

    if (!creation) {
      return res.status(404).json({
        success: false,
        message: "Creation not found",
      });
    }

    const userIdStr = userId.toString();
    const likes = creation.likes || [];
    const isLiked = likes.includes(userIdStr);

    creation.likes = isLiked
      ? likes.filter((u) => u !== userIdStr)
      : [...likes, userIdStr];

    await creation.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      totalLikes: creation.likes.length,
      likes: creation.likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};