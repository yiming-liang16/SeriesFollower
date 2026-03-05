import mongoose from 'mongoose';

const listItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    titleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Title', required: true, index: true },
  },
  { timestamps: true }
);

// 防止同一个 list 里重复添加同一个 title
listItemSchema.index({ userId: 1, listId: 1, titleId: 1 }, { unique: true });

export default mongoose.model('ListItem', listItemSchema);