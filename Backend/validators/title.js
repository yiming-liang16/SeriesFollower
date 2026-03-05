import { object, string, number } from 'yup';

export const searchTitlesSchema = object({
  q: string().trim().max(100).optional(),

  kind: string().oneOf(['movie', 'series']).optional(),

  country: string().trim().max(80).optional(),

  // 支持单个 genre
  genre: string().trim().max(50).optional(),

  // 支持 "Drama,Crime" 这种逗号分隔
  genres: string().trim().max(200).optional(),

  yearMin: number().integer().min(1800).max(3000).optional(),
  yearMax: number().integer().min(1800).max(3000).optional(),

  sort: string()
    .oneOf(['newest', 'oldest', 'name_asc', 'name_desc'])
    .optional()
    .default('newest'),

  page: number().integer().min(1).optional().default(1),
  limit: number().integer().min(1).max(50).optional().default(20),
});

export const createTitleSchema = object({
  // --- Title fields ---
  name: string().trim().required('Name is required').max(200),
  kind: string().oneOf(['movie', 'series']).required('Kind is required'),
  year: number().integer().min(1888).max(2100).optional(),
  country: string().trim().max(80).optional(),
  genres: string().trim().max(300).optional(), // comma-separated, parsed in service
  overview: string().trim().max(2000).optional(),
  posterUrl: string().trim().max(500).optional(),

  // --- Movie-only ---
  duration: number().integer().min(1).optional(),   // minutes
  director: string().trim().max(200).optional(),

  // --- Series-only ---
  totalSeasons: number().integer().min(1).optional(),
  totalEpisodes: number().integer().min(1).optional(),
  episodeLength: number().integer().min(1).optional(), // minutes per episode
});

// PATCH — all fields optional, same constraints
export const updateTitleSchema = object({
  name:     string().trim().max(200).optional(),
  year:     number().integer().min(1888).max(2100).optional(),
  country:  string().trim().max(80).optional(),
  genres:   string().trim().max(300).optional(),
  overview: string().trim().max(2000).optional(),
  posterUrl: string().trim().max(500).optional(),
  duration:  number().integer().min(1).optional(),
  director:  string().trim().max(200).optional(),
  totalSeasons:  number().integer().min(1).optional(),
  totalEpisodes: number().integer().min(1).optional(),
  episodeLength: number().integer().min(1).optional(),
});
