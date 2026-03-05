import List from '../models/List.js';
import ListItem from '../models/ListItem.js';

export async function createList(userId, data) {
  const list = await List.create({
    user: userId,
    title: data.title,
    description: data.description ?? '',
  });
  return list;
}

export async function getListsByUser(userId) {
  return List.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getListById(userId, listId) {
  return List.findOne({ _id: listId, user: userId });
}

export async function updateList(userId, listId, updates) {
  const allowedUpdates = ['title', 'description'];
  const safeUpdates = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  const list = await List.findOneAndUpdate(
    { _id: listId, user: userId },
    safeUpdates,
    { new: true, runValidators: true }
  );

  return list;
}

export async function deleteList(userId, listId) {
  const deleted = await List.findOneAndDelete({ _id: listId, user: userId });
  return deleted; 
}

export async function getListItems(userId, listId) {
  const items = await ListItem.find({ userId, listId })
    .populate('titleId')
    .sort({ createdAt: -1 });

  return items;
}

export async function getListsContainingTitle(userId, titleId) {
  const items = await ListItem.find({ userId, titleId }).select('listId').lean();
  if (!items.length) return [];
  const listIds = items.map(i => i.listId);
  return List.find({ _id: { $in: listIds } }).sort({ createdAt: -1 });
}