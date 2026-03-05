import { object, string, number } from "yup";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addToWatchlistSchema = object({
  titleId: string()
    .required("titleId is required")
    .matches(objectIdRegex, "titleId must be a valid Mongo ObjectId"),

  status: string().oneOf(["want_to_watch", "watching", "watched"]).optional(),
});

export const removeFromWatchlistSchema = object({
  titleId: string()
    .required("titleId is required")
    .matches(objectIdRegex, "titleId must be a valid Mongo ObjectId"),
});

export const getWatchlistSchema = object({
  status: string().oneOf(["want_to_watch", "watching", "watched"]).optional(),
  kind: string().oneOf(["movie", "series"]).optional(),
  q: string().trim().max(100).optional(),
  page: number().integer().min(1).optional().default(1),
  limit: number().integer().min(1).max(50).optional().default(20),
});

export const updateWatchlistStatusSchema = object({
  titleId: string()
    .required("titleId is required")
    .matches(objectIdRegex, "titleId must be a valid Mongo ObjectId"),

  status: string().oneOf(["want_to_watch", "watching", "watched"]).required(),

  season: number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? undefined
        : value
    )
    .typeError("Season must be a number")
    .integer("Season must be an integer")
    .min(1, "Season must be >= 1")
    .notRequired(),

  episode: number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? undefined
        : value
    )
    .typeError("Episode must be a number")
    .integer("Episode must be an integer")
    .min(1, "Episode must be >= 1")
    .notRequired(),
});