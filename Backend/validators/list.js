import { object, string } from 'yup';

export const createListSchema = object({
  title: string().required('Title is required').max(80),
  description: string().max(300).optional(),
});

export const updateListSchema = object({
  title: string().max(80).optional(),
  description: string().max(300).optional(),
});
