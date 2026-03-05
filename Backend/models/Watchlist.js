import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Title',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['want_to_watch', 'watching', 'watched'],
      default: 'want_to_watch',
      index: true,
    },
  },
  { timestamps: true }
);


watchlistSchema.index({ userId: 1, titleId: 1 }, { unique: true }); //mongoDB用userID + titleID的组合来建立索引，并且同一个userID + titleID的组合只能出现一次

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
