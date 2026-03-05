import { createListSchema, updateListSchema } from '../validators/list.js';
import {
  createList,
  getListsByUser,
  getListById,
  getListItems,
  updateList,
  deleteList,
  getListsContainingTitle,
} from '../services/listService.js';

export const createUserList = async (req, res, next) => {
  try {
    const userId = req.user?.id; 
    if (!userId) {
        
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const data = await createListSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const list = await createList(userId, data);

    return res.status(201).json({
      success: true,
      message: 'List created successfully',
      list,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyLists = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { titleId } = req.query;
    const lists = titleId
      ? await getListsContainingTitle(userId, titleId)
      : await getListsByUser(userId);

    return res.json({ success: true, lists });
  } catch (err) {
    next(err);
  }
};

export const getMyListById = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id: listId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const list = await getListById(userId, listId);

    if (!list) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    const items = await getListItems(userId, listId);

    return res.json({
      success: true,
      list,
      items,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id: listId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const updates = await updateListSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const list = await updateList(userId, listId, updates);

    if (!list) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    return res.json({
      success: true,
      message: 'List updated successfully',
      list,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMyList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id: listId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const deleted = await deleteList(userId, listId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    return res.json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
