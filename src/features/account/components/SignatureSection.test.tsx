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
    expect(document.body.innerHTML).toContain("Tanda Tangan Digital Profil");
    expect(document.body.innerHTML).toContain("Pratinjau Spesimen Tanda Tangan Aktif");
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

    expect(document.body.innerHTML).toContain("Anda belum memiliki spesimen tanda tangan aktif");
  });

  it("switches tabs between Ketik Nama, Gambar, and Unggah", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    const buttons = document.body.querySelectorAll("button");
    const drawTabBtn = Array.from(buttons).find((b) => b.textContent?.includes("Gambar (Draw)"));
    expect(drawTabBtn).toBeDefined();

    await act(async () => {
      drawTabBtn?.click();
    });

    expect(document.body.innerHTML).toContain("Goreskan Tanda Tangan");

    const uploadTabBtn = Array.from(buttons).find((b) => b.textContent?.includes("Unggah Gambar"));
    expect(uploadTabBtn).toBeDefined();

    await act(async () => {
      uploadTabBtn?.click();
    });

    expect(document.body.innerHTML).toContain("Pilih Berkas Gambar Tanda Tangan");
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
      b.textContent?.includes("Perbarui Tanda Tangan") || b.textContent?.includes("Simpan Tanda Tangan")
    );
    expect(saveBtn).toBeDefined();

    await act(async () => {
      saveBtn?.click();
    });

    expect(mockUploadUserSignature).toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith("Tanda tangan profil berhasil disimpan dan diperbarui! ✍️", "success");
  });

  it("handles delete signature with confirmation", async () => {
    const originalConfirm = globalThis.confirm;
    globalThis.confirm = () => true;

    root = createRoot(container);
    await act(async () => {
      root?.render(<SignatureSection />);
    });

    const deleteBtn = Array.from(document.body.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Hapus Spesimen")
    );
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      deleteBtn?.click();
    });

    expect(mockDeleteUserSignature).toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith("Spesimen tanda tangan profil berhasil dihapus", "info");

    globalThis.confirm = originalConfirm;
  });
});
