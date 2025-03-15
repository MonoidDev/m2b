import { z, type ZodTypeAny } from "zod";

export const result = <T extends ZodTypeAny, E extends ZodTypeAny>(
  t: T,
  e: E,
) => {
  return z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: t,
    }),
    z.object({
      success: z.literal(false),
      error: e,
    }),
  ]);
};

export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T, E = never>(data: T): Result<T, E> => ({
  success: true,
  data,
});

export const err = <E, T = never>(error: E): Result<T, E> => ({
  success: false,
  error,
});
