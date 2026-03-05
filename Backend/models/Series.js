import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema(
  {
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Title',
      required: true,
      unique: true, 
      index: true,
    },

    totalSeasons: {
      type: Number,
      min: 1,
    },

    totalEpisodes: {
      type: Number,
      min: 1,
    },

    episodeLength: {
      type: Number, 
      min: 1,
    },
  },
  { timestamps: true }
);

const Series = mongoose.model('Series', seriesSchema);
export default Series;
