import { ulid } from "ulid";

export const newID = () => ulid().toLowerCase();
