import { searchTitlesSchema, createTitleSchema, updateTitleSchema } from '../validators/title.js';
import { searchTitles, getTitleById, getMyTitleStatus as getMyTitleStatusService, createTitle as createTitleService, updateTitle as updateTitleService } from '../services/titleService.js';

export const search = async (req, res, next) => {
  try {
    const filters = await searchTitlesSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await searchTitles(filters);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getTitleById(id);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    // multipart/form-data sends numbers as strings — normalise before validation
    const raw = { ...req.body };
    const numFields = ['year', 'duration', 'totalSeasons', 'totalEpisodes', 'episodeLength'];
    for (const f of numFields) {
      if (raw[f] === '' || raw[f] === undefined) delete raw[f];
      else if (raw[f] !== undefined) raw[f] = Number(raw[f]);
    }

    // if a poster file was uploaded, use its path; otherwise keep posterUrl from body
    if (req.file) {
      raw.posterUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const data = await createTitleSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await createTitleService(data);

    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const raw = { ...req.body };
    const numFields = ['year', 'duration', 'totalSeasons', 'totalEpisodes', 'episodeLength'];
    for (const f of numFields) {
      if (raw[f] === '' || raw[f] === undefined) delete raw[f];
      else if (raw[f] !== undefined) raw[f] = Number(raw[f]);
    }

    if (req.file) {
      raw.posterUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const data = await updateTitleSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await updateTitleService(id, data);

    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getMyTitleStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id: titleId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await getMyTitleStatusService(userId, titleId);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error); 
  }
};