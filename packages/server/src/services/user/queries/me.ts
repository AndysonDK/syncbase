import { User } from "../../../entities/User";
import type { Context } from "src/types";

export const me = async ({ em, userId }: Context) => {
  return em.findOne(User, { id: userId });
};