import z from "zod"

export const userZodSchema= z.object({
   phoneNumber: z.string().min(10),
   blanace: z.number(),
   role: z.string(),
})

export const orderbookZodSchema= z.object({

})  