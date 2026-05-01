import { z } from "zod";

export const testimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email"),
  content: z.string().min(10, "Testimonial must be at least 10 characters").max(2000, "Testimonial must be less than 2000 characters"),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  rating: z.coerce.number().min(1).max(5).optional().nullable(),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
