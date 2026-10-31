"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconWriting,
  IconPencil,
  IconUpload,
  IconTrash,
  IconCheck,
  IconRefresh,
  IconFileCertificate,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import {
  getUserSignature,
  uploadUserSignature,
  deleteUserSignature,
} from "@/services/signatureService";
import type { UserSignatureResponse } from "@/lib/types";

type SignatureTab = "type" | "draw" | "upload";

interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  className: string;
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: "caveat",
    name: "Caveat",
    fontFamily: "'Caveat', cursive",
    className: "font-signature-caveat",
  },
  {
    id: "dancing",
    name: "Dancing Script",
    fontFamily: "'Dancing Script', cursive",
    className: "font-signature-dancing",
  },
  {
    id: "greatvibes",
    name: "Great Vibes",
    fontFamily: "'Great Vibes', cursive",
    className: "font-signature-greatvibes",
  },
];

export function SignatureSection() {
  const { user } = useAuth();
  const { notify } = useToast();

  const [signature, setSignature] = useState<UserSignatureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<SignatureTab>("type");

  // Typed signature states
  const [typedName, setTypedName] = useState(user?.name || "");
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONT_OPTIONS[0]);

  // Drawing canvas states
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Uploaded image states
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hidden export canvas for typed signature
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchSignature = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserSignature();
      setSignature(res);
    } catch {
      setSignature(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignature();
  }, [fetchSignature]);

  useEffect(() => {
    if (user?.name && !typedName) {
      setTypedName(user.name);
    }
  }, [user?.name, typedName]);

  // -------------------------------------------------------------
  // Drawing Canvas Handlers
  // -------------------------------------------------------------
  const initDrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina / 2x DPI support
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || 400) * 2;
    canvas.height = 150 * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = "#182433";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (activeTab === "draw") {
      initDrawCanvas();
    }
  }, [activeTab, initDrawCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // -------------------------------------------------------------
  // Upload Handlers
  // -------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select an image file (PNG, JPEG, or WebP)", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notify("File size cannot exceed 2 MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // Render Typed Signature to High-DPI Canvas
  // -------------------------------------------------------------
  const renderTypedSignatureToCanvas = (): string | null => {
    if (!typedName.trim()) {
      notify("Please enter your full name first", "error");
      return null;
    }

    const canvas = hiddenCanvasRef.current || document.createElement("canvas");
    canvas.width = 800; // 2x retina
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Ink color
    ctx.fillStyle = "#182433";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 3. Dynamic font size fitting
    let fontSize = 72;
    ctx.font = `${fontSize}px ${selectedFont.fontFamily}`;

    // Measure and scale down if name is long
    let textWidth = ctx.measureText(typedName.trim()).width;
    while (textWidth > canvas.width - 80 && fontSize > 24) {
      fontSize -= 4;
      ctx.font = `${fontSize}px ${selectedFont.fontFamily}`;
      textWidth = ctx.measureText(typedName.trim()).width;
    }

    // 4. Draw centered cursive text
    ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
  };

  // -------------------------------------------------------------
  // Save / Upload Action
  // -------------------------------------------------------------
  const handleSaveSignature = async () => {
    let base64Payload: string | null = null;

    if (activeTab === "type") {
      base64Payload = renderTypedSignatureToCanvas();
    } else if (activeTab === "draw") {
      if (!hasDrawn || !drawCanvasRef.current) {
        notify("Please draw your signature first", "error");
        return;
      }
      base64Payload = drawCanvasRef.current.toDataURL("image/png");
    } else if (activeTab === "upload") {
      if (!uploadedBase64) {
        notify("Please select a signature image file first", "error");
        return;
      }
      base64Payload = uploadedBase64;
    }

    if (!base64Payload) return;

    setSaving(true);
    try {
      await uploadUserSignature(base64Payload);
      notify("Profile signature saved and updated successfully! ✍️", "success");
      await fetchSignature();
      setUploadedBase64(null);
      clearDrawing();
    } catch (err: any) {
      notify(err.message || "Failed to save signature", "error");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Delete / Revoke Action
  // -------------------------------------------------------------
  const handleDeleteSignature = async () => {
    if (!confirm("Are you sure you want to delete your profile signature specimen?")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteUserSignature();
      notify("Profile signature specimen deleted successfully", "info");
      await fetchSignature();
    } catch (err: any) {
      notify(err.message || "Failed to delete signature", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-xs bg-primary-lt rounded text-primary">
            <IconFileCertificate size={18} />
          </span>
          <div>
            <h3 className="card-title m-0">Digital Profile Signature</h3>
            <p className="card-subtitle m-0 text-secondary small">
              Official signature automatically stamped on monthly Timesheets and Attendance Incident Reports.
            </p>
          </div>
        </div>

        {signature?.has_signature && (
          <span className="badge bg-success-lt text-success d-inline-flex align-items-center gap-1">
            <IconCheck size={14} />
            Active Signature
          </span>
        )}
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-4 text-secondary">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading signature data...
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {/* Active Specimen Preview */}
            {signature?.has_signature && signature.signature_url ? (
              <div className="p-3 rounded border bg-body-tertiary">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div>
                    <span className="text-secondary small fw-bold text-uppercase d-block mb-2">
                      Active Signature Specimen Preview
                    </span>
                    <div
                      className="border rounded p-2 bg-white d-inline-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: "280px", height: "100px" }}
                      title="Transparent background displayed on white canvas"
                    >
                      <img
                        src={signature.signature_url}
                        alt="Signature Specimen"
                        className="mw-100 mh-100 object-fit-contain"
                      />
                    </div>
                    {signature.updated_at && (
                      <div className="text-secondary fs-6 mt-1">
                        Updated: {new Date(signature.updated_at).toLocaleString("en-US")}
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                      onClick={handleDeleteSignature}
                      disabled={deleting}
                    >
                      <IconTrash size={16} />
                      {deleting ? "Deleting..." : "Delete Specimen"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info d-flex align-items-center gap-2 mb-0" role="alert">
                <IconWriting size={20} className="text-info shrink-0" />
                <div className="small">
                  You do not have an active signature specimen yet. Create your signature below using <strong>Type Name</strong>, <strong>Draw</strong>, or <strong>Upload</strong>.
                </div>
              </div>
            )}

            {/* Creator Tabs */}
            <div>
              <ul className="nav nav-tabs card-header-tabs mb-3" role="tablist">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link d-flex align-items-center gap-2 ${activeTab === "type" ? "active" : ""}`}
                    onClick={() => setActiveTab("type")}
                  >
                    <IconWriting size={16} />
                    <span>Type Name</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link d-flex align-items-center gap-2 ${activeTab === "draw" ? "active" : ""}`}
                    onClick={() => setActiveTab("draw")}
                  >
                    <IconPencil size={16} />
                    <span>Draw</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link d-flex align-items-center gap-2 ${activeTab === "upload" ? "active" : ""}`}
                    onClick={() => setActiveTab("upload")}
                  >
                    <IconUpload size={16} />
                    <span>Upload Image</span>
                  </button>
                </li>
              </ul>

              {/* Tab 1: Type Name */}
              {activeTab === "type" && (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label htmlFor="typed-signature-input" className="form-label required">
                      Your Full Name
                    </label>
                    <input
                      id="typed-signature-input"
                      type="text"
                      className="form-control"
                      placeholder="Enter full name for signature..."
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                    />
                  </div>

                  <div>
                    <span className="form-label d-block">Select Calligraphy Style / Cursive Font</span>
                    <div className="row g-2">
                      {FONT_OPTIONS.map((font) => (
                        <div key={font.id} className="col-12 col-md-4">
                          <label
                            htmlFor={`font-option-${font.id}`}
                            className={`form-selectgroup-item flex-fill w-100 ${
                              selectedFont.id === font.id ? "border-primary" : ""
                            }`}
                          >
                            <input
                              id={`font-option-${font.id}`}
                              type="radio"
                              name="signature-font"
                              value={font.id}
                              className="form-selectgroup-input"
                              checked={selectedFont.id === font.id}
                              onChange={() => setSelectedFont(font)}
                              aria-label={font.name}
                            />
                            <span className="form-selectgroup-label p-3 text-center border rounded d-block">
                              <span className="small text-secondary d-block mb-1">{font.name}</span>
                              <span
                                className={`${font.className} fs-1 text-dark text-truncate d-block`}
                                style={{ lineHeight: "1.2" }}
                              >
                                {typedName.trim() || user?.name || "Signature"}
                              </span>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  <div>
                    <span className="form-label d-block mb-1">Signature Stamp Preview</span>
                    <div
                      className="border rounded p-4 bg-white d-flex align-items-center justify-content-center shadow-sm"
                      style={{ minHeight: "140px" }}
                    >
                      <div
                        className={`${selectedFont.className} fs-1 text-dark text-center`}
                        style={{ fontSize: "2.5rem", letterSpacing: "1px" }}
                      >
                        {typedName.trim() || "(Signature preview will appear here)"}
                      </div>
                    </div>
                    <span className="text-secondary fs-6 mt-1 d-block">
                      Signature will be exported as a high-resolution transparent PNG (2x Retina) with dark ink.
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Draw Signature */}
              {activeTab === "draw" && (
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="form-label m-0">Draw Signature Using Mouse / Touchscreen</span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      onClick={clearDrawing}
                    >
                      <IconRefresh size={14} />
                      Clear
                    </button>
                  </div>
                  <div className="border rounded bg-white overflow-hidden shadow-sm" style={{ touchAction: "none" }}>
                    <canvas
                      ref={drawCanvasRef}
                      className="w-100 d-block cursor-crosshair"
                      style={{ height: "150px" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <span className="text-secondary fs-6">
                    Use your mouse or finger on the drawing canvas above.
                  </span>
                </div>
              )}

              {/* Tab 3: Upload Image */}
              {activeTab === "upload" && (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label htmlFor="signature-file-upload" className="form-label">
                      Select Signature Image File
                    </label>
                    <input
                      id="signature-file-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                    <span className="text-secondary fs-6 d-block mt-1">
                      Supported formats: PNG (transparent background highly recommended), JPEG, WebP. Max 2 MB.
                    </span>
                  </div>

                  {uploadedBase64 && (
                    <div>
                      <span className="form-label d-block mb-1">Selected Image Preview</span>
                      <div
                        className="border rounded p-3 bg-white d-flex align-items-center justify-content-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <img
                          src={uploadedBase64}
                          alt="Selected Preview"
                          className="mw-100 mh-100 object-fit-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-4 pt-2 border-top d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleSaveSignature}
                  disabled={saving || (activeTab === "draw" && !hasDrawn) || (activeTab === "upload" && !uploadedBase64)}
                >
                  <IconCheck size={18} />
                  <span>
                    {saving
                      ? "Saving Signature..."
                      : signature?.has_signature
                      ? "Update Signature"
                      : "Save Signature"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden high-res canvas for rendering typed signature */}
      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
