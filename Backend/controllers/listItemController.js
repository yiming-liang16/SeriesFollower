import * as listItemService from '../services/listItemService.js';

// POST /api/lists/:listId/items
// body: { titleId }
export const createListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { titleId } = req.body;

    const item = await listItemService.createListItem({ userId, listId, titleId });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/lists/:listId/items/:titleId
export const deleteListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listId, titleId } = req.params;

    const result = await listItemService.deleteListItem({ userId, listId, titleId });

    res.status(200).json({
      success: true,
      ...result, // { deleted: true, itemId: '...' }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lists/:listId/items
export const getListItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;

    const items = await listItemService.getListItems({ userId, listId });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
};