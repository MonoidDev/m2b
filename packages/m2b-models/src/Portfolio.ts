import { z } from "zod";

export const Currency = z.enum(["USD", "JPY", "CNY"]);

export type Currency = z.infer<typeof Currency>;

export const Side = z.enum(["BUY", "SELL"]);

export type Side = z.infer<typeof Side>;

export const Money = z.object({
  currency: Currency,
  amount: z.number(),
});

export type Money = z.infer<typeof Money>;

/**
 * Cost of an asset according to Weighted Average Cost
 */
export const Inventory = z.object({
  amount: z.number(),
  cost: Money,
});

export type Inventory = z.infer<typeof Inventory>;

/**
 * A holding asset
 */
export const Asset = z.object({
  id: z.number(),
  accountId: z.number(),
  symbol: z.string(),
  inventory: Inventory,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Asset = z.infer<typeof Asset>;

export const Account = z.object({
  id: z.number(),
  title: z.string(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Account = z.infer<typeof Account>;

export const Transaction = z.object({
  assetId: z.number(),
  accountId: z.number(),
  amount: z.number(),
  cost: Money,
  side: Side,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof Transaction>;
