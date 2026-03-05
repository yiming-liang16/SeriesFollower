import { string, object } from 'yup';

export const signInSchema = object({
  username: string().required(),
  password: string().required().min(6),
});

export const signUpSchema = object({
  username: string().required(),
  email: string().required().email(),
  password: string().required().min(6),
  name: string().optional(),
});

export const updateProfileSchema = object({
  name: string()
    .max(50, 'Name must be at most 50 characters')
    .optional(),

  bio: string()
    .max(200, 'Bio must be at most 200 characters')
    .optional(),

});

export const updateAvatarSchema = object({
  avatarUrl: string()
    .required('Avatar URL is required'),
});
