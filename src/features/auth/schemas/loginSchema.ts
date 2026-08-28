import { z } from 'zod';

import { extractLocalDigits } from '@/utils/phone';

export const loginSchema = z.object({
  phone: z
    .string()
    .refine((value) => extractLocalDigits(value).length === 9, 'Введите номер полностью'),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
