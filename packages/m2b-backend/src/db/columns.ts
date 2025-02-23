import type { Writable } from "drizzle-orm";
import { pgEnum as corePgEnum, type PgEnum } from "drizzle-orm/pg-core";
import { type ZodEnum } from "zod";

/**
 * 
 * @param enumName 
 * @param z 
 * @returns Converts a ZodEnum to a PgEnum
 */
export const pgEnum = <
  U extends string,
  T extends [U, ...U[]],
>(
  enumName: string,
  z: ZodEnum<T>,
): PgEnum<Writable<T>> => {
  const values = z.options;

  return corePgEnum(enumName, values);
};
