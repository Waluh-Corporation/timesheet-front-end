import { api } from "@/lib/api";
import type { InitSetupRequest, SetupStatusResponse } from "@/lib/types";

export async function fetchSetupStatus(): Promise<SetupStatusResponse> {
  return api<SetupStatusResponse>("/api/v1/setup/status", { auth: false });
}

export async function initializeSystem(payload: InitSetupRequest): Promise<any> {
  return api<any>("/api/v1/setup/init", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}
