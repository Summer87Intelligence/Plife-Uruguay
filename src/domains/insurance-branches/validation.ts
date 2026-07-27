import { z } from 'zod'

export const InsuranceBranchSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido'),
})
