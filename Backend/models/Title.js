import mongoose from 'mongoose';

const titleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Title name is required'],
      trim: true,
      index: true, // for searching
    },

    year: {
      type: Number,
      min: 1888, 
    },

    country: {
      type: String,
      trim: true,
      index: true,
    },

    genres: {
      type: [String], //for searching for more than one genre
      default: [],
      index: true,
    },

    // Kind (movie/series)
    kind: {
      type: String,
      required: true,
      enum: ['movie', 'series'],
      index: true,
    },

    // 详情页常用字段
    posterUrl: { type: String, default: '' },
    overview: { type: String, default: '' },
  },
  { timestamps: true }
);

// 一个常见需求：同名同年同类型不重复
titleSchema.index({ name: 1, year: 1, kind: 1 }, { unique: false });

const Title = mongoose.model('Title', titleSchema);
export default Title;
