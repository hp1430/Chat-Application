import { z } from 'zod';

export const userSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
  username: z.string().min(3)
});
