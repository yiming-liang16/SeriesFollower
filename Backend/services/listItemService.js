import mongoose from 'mongoose';
import ListItem from '../models/ListItem.js';
import List from '../models/List.js';
import Title from '../models/Title.js';

function assertObjectId(id, name) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`${name} is invalid`);
    err.statusCode = 400;
    throw err;
  }
}

// ✅ CREATE
export async function createListItem({ userId, listId, titleId }) {
  assertObjectId(userId, 'userId');
  assertObjectId(listId, 'listId');
  assertObjectId(titleId, 'titleId');

  // 🔥 注意这里改成 user
  const list = await List.findOne({ _id: listId, user: userId });
  if (!list) {
    const err = new Error('List not found (or not yours)');
    err.statusCode = 404;
    throw err;
  }

  const title = await Title.findById(titleId);
  if (!title) {
    const err = new Error('Title not found');
    err.statusCode = 404;
    throw err;
  }

  try {
    const item = await ListItem.create({ userId, listId, titleId });

    return await ListItem.findById(item._id)
      .populate('titleId')
      .populate('listId', 'title'); // 你的list字段叫title（不是name）
  } catch (err) {
    if (err?.code === 11000) {
      const e = new Error('This title is already in the list');
      e.statusCode = 409;
      throw e;
    }
    throw err;
  }
}

// ✅ DELETE
export async function deleteListItem({ userId, listId, titleId }) {
  assertObjectId(userId, 'userId');
  assertObjectId(listId, 'listId');
  assertObjectId(titleId, 'titleId');

  // 🔥 同样改这里
  const list = await List.findOne({ _id: listId, user: userId });
  if (!list) {
    const err = new Error('List not found (or not yours)');
    err.statusCode = 404;
    throw err;
  }

  const deleted = await ListItem.findOneAndDelete({
    userId,
    listId,
    titleId,
  });

  if (!deleted) {
    const err = new Error('Item not found in this list');
    err.statusCode = 404;
    throw err;
  }

  return { deleted: true, itemId: deleted._id.toString() };
}