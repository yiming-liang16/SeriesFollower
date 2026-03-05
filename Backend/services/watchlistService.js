
import mongoose from "mongoose";
import Title from "../models/Title.js";
import WatchlistItem from "../models/WatchlistItem.js";

/**
 * helpers
 */
function toObjectIdOrNull(v) {
  if (!v) return null;
  if (v instanceof mongoose.Types.ObjectId) return v;
  return mongoose.isValidObjectId(v) ? new mongoose.Types.ObjectId(v) : null;
}

function badRequest(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * addToWatchlist
 * -------------
 * ✅ 统一写入 WatchlistItem（不要再用旧的 Watchlist model）
 * - 使用 upsert 避免 unique index (userId+titleId) 重复报错
 * - 可选：若已存在，更新 status（也可以改成不更新）
 */
export async function addToWatchlist(userId, titleId, status = "want_to_watch") {
  const userObjId = toObjectIdOrNull(userId);
  if (!userObjId) throw badRequest("Invalid userId", 401);

  const titleObjId = toObjectIdOrNull(titleId);
  if (!titleObjId) throw badRequest("Invalid titleId", 400);

  // 1) 确认 Title 存在
  const titleExists = await Title.exists({ _id: titleObjId });
  if (!titleExists) {
    const err = new Error("Title not found");
    err.statusCode = 404;
    throw err;
  }

  // 2) upsert 写入（避免 duplicate key 11000）
  const item = await WatchlistItem.findOneAndUpdate(
    { userId: userObjId, titleId: titleObjId },
    {
      // 如果你不希望重复添加时改变 status，把下面 $set 删掉即可
      $set: { status: status || "want_to_watch" },
      $setOnInsert: { userId: userObjId, titleId: titleObjId },
    },
    { new: true, upsert: true }
  ).populate({
    path: "titleId",
    select: "name year country genres kind posterUrl overview",
  });

  return item;
}

/**
 * removeFromWatchlist
 * ------------------
 * ✅ 使用 WatchlistItem 删除（与 GET/PATCH 同一个 collection）
 */
export async function removeFromWatchlist(userId, titleId) {
  console.log("[removeFromWatchlist] userId(raw) =", userId);
  console.log("[removeFromWatchlist] titleId(raw) =", titleId);

  const userObjId = toObjectIdOrNull(userId);
  if (!userObjId) throw badRequest("Invalid userId", 401);

  const titleObjId = toObjectIdOrNull(titleId);
  if (!titleObjId) throw badRequest("Invalid titleId", 400);

  const deleted = await WatchlistItem.findOneAndDelete({
    userId: userObjId,
    titleId: titleObjId,
  });

  console.log("[removeFromWatchlist] deleted? =", !!deleted);

  if (!deleted) {
    // 诊断：看看这个 titleId 在任何用户下是否存在
    const any = await WatchlistItem.findOne({ titleId: titleObjId }).lean();
    console.log("[removeFromWatchlist] exists with this titleId (any user)? =", !!any);
    if (any) console.log("[removeFromWatchlist] that item's userId =", String(any.userId));

    const err = new Error("Watchlist item not found");
    err.statusCode = 404;
    throw err;
  }

  return deleted;
}

/**
 * getMyWatchlist
 * -------------
 * ✅ 统一从 WatchlistItem 读取
 * - 支持 status/kind/q 过滤
 * - 支持分页
 */
export async function getMyWatchlist(userId, filters = {}) {
  const { status, kind, q, page = 1, limit = 20 } = filters;

  const userObjId = toObjectIdOrNull(userId);
  if (!userObjId) throw badRequest("Invalid userId", 401);

  const query = { userId: userObjId };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const items = await WatchlistItem.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate({
      path: "titleId",
      match: {
        ...(kind ? { kind } : {}),
        ...(q ? { name: { $regex: q, $options: "i" } } : {}),
      },
      select: "name year country genres kind posterUrl overview",
    });

  // populate match 后 titleId 可能变 null
  return items.filter((i) => i.titleId);
}

/**
 * updateWatchlistStatus
 * --------------------
 * ✅ 使用 WatchlistItem 更新（与 GET/DELETE 同一个 collection）
 * ✅ watching + series 才写 progress，否则清掉 progress
 */
export async function updateWatchlistStatus(userId, titleId, status, progress = {}) {

  const userObjId = toObjectIdOrNull(userId);
  if (!userObjId) throw badRequest("Invalid userId", 401);

  const titleObjId = toObjectIdOrNull(titleId);
  if (!titleObjId) throw badRequest("Invalid titleId", 400);

  const item = await WatchlistItem.findOne({
    userId: userObjId,
    titleId: titleObjId,
  }).populate("titleId");

  if (!item) {
    // 诊断：看看这个 titleId 在任何用户下是否存在
    const any = await WatchlistItem.findOne({ titleId: titleObjId }).lean();
    if (any) console.log("[updateWatchlistStatus] that item's userId =", String(any.userId));
    return null;
  }

  item.status = status;

  const kind = item.titleId?.kind; // "movie" | "series"
  const isWatchingSeries = item.status === "watching" && kind === "series";

  if (isWatchingSeries) {
    const { season, episode } = progress || {};
    const hasAny = season !== undefined || episode !== undefined;

    if (hasAny) {
      const s = season !== undefined ? Number(season) : item.progress?.season;
      const e = episode !== undefined ? Number(episode) : item.progress?.episode;

      if (s !== undefined && (!Number.isInteger(s) || s < 1)) {
        throw badRequest("season must be an integer >= 1", 400);
      }
      if (e !== undefined && (!Number.isInteger(e) || e < 1)) {
        throw badRequest("episode must be an integer >= 1", 400);
      }

      item.progress = {
        season: s,
        episode: e,
        updatedAt: new Date(),
      };
    }
  } else {
    // 不是 watching series 时清掉进度
    item.progress = undefined;
  }

  await item.save();

  return item;
}