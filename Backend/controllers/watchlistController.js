import {
  addToWatchlistSchema,
  removeFromWatchlistSchema,
  getWatchlistSchema,
  updateWatchlistStatusSchema,
} from "../validators/watchlist.js";

import {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  updateWatchlistStatus,
} from "../services/watchlistService.js";

export const addItem = async (req, res, next) => {
  try {
    // ✅ 统一：始终从 req.user._id 取（authMiddleware 挂的是 user document）
    const userId = String(req.user?._id || req.user?.id || req.user?.userId || "");
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const data = await addToWatchlistSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const item = await addToWatchlist(userId, data.titleId, data.status);

    return res.status(201).json({
      success: true,
      message: "Added to watchlist",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const userId = String(req.user?._id || req.user?.id || req.user?.userId || "");
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const params = await removeFromWatchlistSchema.validate(
      { titleId: req.params.titleId },
      { abortEarly: false, stripUnknown: true }
    );

    const deleted = await removeFromWatchlist(userId, params.titleId);

    return res.json({
      success: true,
      message: "Removed from watchlist",
      deleted,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyItems = async (req, res, next) => {
  try {
    const userId = String(req.user?._id || req.user?.id || req.user?.userId || "");
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const filters = await getWatchlistSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    const items = await getMyWatchlist(userId, filters);

    return res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItemStatus = async (req, res, next) => {
  try {
    const userId = String(req.user?._id || req.user?.id || req.user?.userId || "");
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const data = await updateWatchlistStatusSchema.validate(
      {
        titleId: req.params.titleId,
        status: req.body?.status,
        season: req.body?.season,
        episode: req.body?.episode,
      },
      { abortEarly: false, stripUnknown: true }
    );

    const item = await updateWatchlistStatus(userId, data.titleId, data.status, {
      season: data.season,
      episode: data.episode,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Watchlist item not found",
      });
    }

    return res.json({
      success: true,
      message: "Status updated",
      item,
    });
  } catch (error) {
    next(error);
  }
};