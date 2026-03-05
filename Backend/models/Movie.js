import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Title',
      required: true,
      unique: true, 
      index: true,
    },

    duration: {
      type: Number, 
      min: 1,
    },

    director: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
