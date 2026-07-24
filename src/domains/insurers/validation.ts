import { z } from 'zod'

export const InsurerSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido'),
})
