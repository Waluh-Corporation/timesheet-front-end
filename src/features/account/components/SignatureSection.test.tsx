import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SignatureSection } from "./SignatureSection";

// Stable mock for Toast
const mockNotify = mock(() => {});
mock.module("@/components/Toast", () => ({
  useToast: () => ({
    notify: mockNotify,
  }),
}));

// Stable mock for Auth
mock.module("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Antigravity Engineer", username: "engineer", role: "user" },
  }),
}));

// Stable mocks for signatureService
let mockSignatureData: any = {
  has_signature: true,
  signature_url: "https://example.com/specimen.png",
  updated_at: "2026-10-24T10:00:00Z",
};

const mockGetUserSignature = mock(async () => mockSignatureData);
const mockUploadUserSignature = mock(async () => ({ message: "Signature uploaded" }));
const mockDeleteUserSignature = mock(async () => ({ message: "Signature deleted" }));

mock.module("@/services/signatureService", () => ({
  getUserSignature: mockGetUserSignature,
  uploadUserSignature: mockUploadUserSignature,
  deleteUserSignature: mockDeleteUserSignature,
}));

describe("SignatureSection Component", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    mockNotify.mockClear();
    mockGetUserSignature.mockClear();
    mockUploadUserSignature.mockClear();
    mockDeleteUserSignature.mockClear();
    mockSignatureData = {
      has_signature: true,
      signature_url: "https://example.com/specimen.png",
      updated_at: "2026-10-24T10:00:00Z",
    };
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    container.remove();
  });

  it("renders active signature specimen when user has signature", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    expect(mockGetUserSignature).toHaveBeenCalled();
    expect(document.body.innerHTML).toContain("Digital Profile Signature");
    expect(document.body.innerHTML).toContain("Active Signature Specimen Preview");
    expect(document.body.innerHTML).toContain("https://example.com/specimen.png");
  });

  it("renders alert when user has no active signature", async () => {
    mockSignatureData = {
      has_signature: false,
      signature_url: "",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    expect(document.body.innerHTML).toContain("You do not have an active signature specimen yet");
  });

  it("switches tabs between Type Name, Draw, and Upload", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    const buttons = document.body.querySelectorAll("button");
    const drawTabBtn = Array.from(buttons).find((b) => b.textContent?.includes("Draw"));
    expect(drawTabBtn).toBeDefined();

    await act(async () => {
      drawTabBtn?.click();
    });

    expect(document.body.innerHTML).toContain("Draw Signature Using Mouse");

    const uploadTabBtn = Array.from(buttons).find((b) => b.textContent?.includes("Upload Image"));
    expect(uploadTabBtn).toBeDefined();

    await act(async () => {
      uploadTabBtn?.click();
    });

    expect(document.body.innerHTML).toContain("Select Signature Image File");
  });

  it("saves typed signature using HTML5 canvas export", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    // Verify input exists
    const input = document.body.querySelector("#typed-signature-input") as HTMLInputElement;
    expect(input).toBeDefined();

    // Click submit button
    const buttons = document.body.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Update Signature") || b.textContent?.includes("Save Signature")
    );
    expect(saveBtn).toBeDefined();

    await act(async () => {
      saveBtn?.click();
    });

    expect(mockUploadUserSignature).toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith("Profile signature saved and updated successfully! ✍️", "success");
  });

  it("handles delete signature with confirmation", async () => {
    const originalConfirm = globalThis.confirm;
    globalThis.confirm = () => true;

    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    const deleteBtn = Array.from(document.body.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Delete Specimen")
    );
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      deleteBtn?.click();
    });

    expect(mockDeleteUserSignature).toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith("Profile signature specimen deleted successfully", "info");

    globalThis.confirm = originalConfirm;
  });
});
