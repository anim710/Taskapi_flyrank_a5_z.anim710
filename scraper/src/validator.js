import { z } from 'zod';

// Zod Schema for normalized records
export const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url(),
  price_text: z.string(),
  price_gbp: z.number().positive(),
  availability_text: z.string(),
  rating_text: z.string(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime()
});

export function normalizeAndValidate(rawRecord) {
  // 1. Normalize price_text ("£51.77") -> price_gbp (51.77)
  const priceMatch = rawRecord.price_text.match(/[\d.]+/);
  const price_gbp = priceMatch ? parseFloat(priceMatch[0]) : NaN;

  const normalized = {
    ...rawRecord,
    price_gbp
  };

  // 2. Validate against Zod Schema
  const result = BookSchema.safeParse(normalized);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      rawRecord,
      errors: result.error.format()
    };
  }
}