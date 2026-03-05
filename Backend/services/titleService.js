import Title from '../models/Title.js';
import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import WatchlistItem from '../models/WatchlistItem.js';

function buildSort(sortKey) {
  switch (sortKey) {
    case 'oldest':
      return { year: 1, name: 1 };
    case 'name_asc':
      return { name: 1 };
    case 'name_desc':
      return { name: -1 };
    case 'newest':
    default:
      return { year: -1, createdAt: -1 };
  }
}

export async function searchTitles(filters) {
  const {
    q,
    kind,
    country,
    genre,
    genres,
    yearMin,
    yearMax,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = filters;

  const query = {};

  if (q) {
    // name 模糊搜索（不区分大小写）
    query.name = { $regex: q, $options: 'i' };
  }

  if (kind) query.kind = kind;
  if (country) query.country = country;

  // genres 过滤：Title 模型里是 genres: [String]
  // genre=Drama：包含 Drama
  if (genre) {
    query.genres = genre;
  }

  // genres=Drama,Crime：包含任意一个（OR）
  if (genres) {
    const arr = genres.split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length) {
      query.genres = { $in: arr };
    }
  }

  // 年份范围
  if (yearMin !== undefined || yearMax !== undefined) {
    query.year = {};
    if (yearMin !== undefined) query.year.$gte = yearMin;
    if (yearMax !== undefined) query.year.$lte = yearMax;
  }

  const skip = (page - 1) * limit;
  const sortObj = buildSort(sort);

  // 同时返回分页数据 + 总数
  const [items, total] = await Promise.all([
    Title.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('name year country genres kind posterUrl overview createdAt'),
    Title.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTitleById(titleId) {
  const title = await Title.findById(titleId).select(
    'name year country genres kind posterUrl overview createdAt'
  );

  if (!title) {
    const err = new Error('Title not found');
    err.statusCode = 404;
    throw err;
  }

  let details = null;

  if (title.kind === 'movie') {
    details = await Movie.findOne({ titleId: title._id }).select(
      'duration director'
    );
  } else if (title.kind === 'series') {
    details = await Series.findOne({ titleId: title._id }).select(
      'totalSeasons totalEpisodes episodeLength'
    );
  }

  return { title, details };
}

export async function createTitle(data) {
  const {
    name, kind, year, country, genres, overview, posterUrl,
    // movie
    duration, director,
    // series
    totalSeasons, totalEpisodes, episodeLength,
  } = data;

  // parse genres: "Drama,Crime" → ["Drama","Crime"]
  const genresArr = genres
    ? genres.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const title = await Title.create({
    name, kind,
    ...(year !== undefined && { year }),
    ...(country && { country }),
    ...(genresArr.length && { genres: genresArr }),
    ...(overview && { overview }),
    ...(posterUrl && { posterUrl }),
  });

  let details = null;
  if (kind === 'movie') {
    details = await Movie.create({
      titleId: title._id,
      ...(duration !== undefined && { duration }),
      ...(director && { director }),
    });
  } else {
    details = await Series.create({
      titleId: title._id,
      ...(totalSeasons !== undefined && { totalSeasons }),
      ...(totalEpisodes !== undefined && { totalEpisodes }),
      ...(episodeLength !== undefined && { episodeLength }),
    });
  }

  return { title, details };
}

export async function updateTitle(titleId, data) {
  const title = await Title.findById(titleId);
  if (!title) {
    const err = new Error('Title not found');
    err.statusCode = 404;
    throw err;
  }

  const {
    name, year, country, genres, overview, posterUrl,
    duration, director,
    totalSeasons, totalEpisodes, episodeLength,
  } = data;

  if (name !== undefined)     title.name = name;
  if (year !== undefined)     title.year = year;
  if (country !== undefined)  title.country = country;
  if (overview !== undefined) title.overview = overview;
  if (posterUrl !== undefined) title.posterUrl = posterUrl;
  if (genres !== undefined) {
    title.genres = genres.split(',').map(s => s.trim()).filter(Boolean);
  }
  await title.save();

  let details = null;
  if (title.kind === 'movie') {
    details = await Movie.findOneAndUpdate(
      { titleId: title._id },
      {
        ...(duration !== undefined && { duration }),
        ...(director !== undefined && { director }),
      },
      { new: true }
    );
  } else {
    details = await Series.findOneAndUpdate(
      { titleId: title._id },
      {
        ...(totalSeasons !== undefined && { totalSeasons }),
        ...(totalEpisodes !== undefined && { totalEpisodes }),
        ...(episodeLength !== undefined && { episodeLength }),
      },
      { new: true }
    );
  }

  return { title, details };
}

export async function getMyTitleStatus(userId, titleId) {
  const item = await WatchlistItem.findOne({ userId, titleId });

  if (!item) {
    return {
      inWatchlist: false,
      status: null,
    };
  }

  return {
    inWatchlist: true,
    status: item.status,
  };
}
