import { api } from "@/lib/api";

export const newUserService = {
  createUser: (payload: unknown) => 
    api("/api/v1/admin/users", { method: "POST", body: JSON.stringify(payload) }),
};
