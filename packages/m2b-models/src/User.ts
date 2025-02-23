import { result } from "m2b-utils";
import { z } from "zod";

export const UserRole = z.enum(["ADMIN", "USER"]);

export type UserRole = z.infer<typeof UserRole>;

export const UserFields = z.object({
  id: z.number(),
  role: UserRole,
  name: z.string().nullable(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserView = UserFields.pick({
  id: true,
  role: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
});

export type UserView = z.infer<typeof UserView>;

export const UserCreate = UserFields.pick({
  email: true,
  password: true,
});

export type UserCreate = z.infer<typeof UserCreate>;

export const UserCreateErrorKind = z.enum(["EMAIL_ALREADY_EXISTS"]);

export type UserCreateErrorKind = z.infer<typeof UserCreateErrorKind>;

export const UserCreateResult = result(UserView, UserCreateErrorKind);

export type UserCreateResult = z.infer<typeof UserCreateResult>;
