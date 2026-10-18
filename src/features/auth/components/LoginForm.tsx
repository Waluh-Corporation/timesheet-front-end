"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconCalendarCheck,
  IconKey,
  IconFingerprint,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import ThemeToggle from "@/components/ThemeToggle";
import {
  loginWithPasskey,
  passkeysSupported,
  isConditionalSupported,
} from "@/lib/webauthn";
import { getToken } from "@/lib/api";
import { fetchSetupStatus } from "@/services/setup";
import { requestPasswordReset } from "../services/authService";

function friendlyAuthError(err: any, context: "password" | "passkey"): string {
  if (err?.name === "AbortError") return "";
  const raw = (err?.message || "").toLowerCase();
  if (raw.includes("abort") || raw.includes("signal is aborted") || raw.includes("canceled")) return "";
  if (err?.name === "NotAllowedError" || raw.includes("timed out") || raw.includes("not allowed")) {
    return "Passkey sign-in was cancelled or timed out. Please try again.";
  }
  if (raw.includes("failed to fetch") || raw.includes("networkerror") || raw.includes("load failed")) {
    return "Can't reach the server. Check your connection and try again.";
  }
  if (raw.includes("disabled")) {
    return "Your account has been deactivated. Please contact your administrator.";
  }
  if (raw.includes("invalid credentials") || raw.includes("unauthorized")) {
    return context === "passkey"
      ? "No matching passkey was found for this device."
      : "Incorrect username/email or password.";
  }
  return context === "passkey"
    ? "Couldn't sign in with a passkey. Try your password instead."
    : "Sign-in failed. Please try again.";
}

export default function LoginForm() {
  const { user, loading, loginWithPassword, loginWithToken } = useAuth();
  const { notify } = useToast();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const routeForRole = useCallback(
    (role: string) => {
      router.replace(role === "admin" ? "/users" : "/dashboard");
    },
    [router]
  );

  useEffect(() => {
    if (!loading && user) {
      routeForRole(user.role);
    }
  }, [user, loading, routeForRole]);

  useEffect(() => {
    async function checkSetup() {
      try {
        const setup = await fetchSetupStatus();
        if (setup && (setup.requires_setup || !setup.is_initialized)) {
          router.replace("/setup");
        }
      } catch (err) {
        console.error("Setup check error on login", err);
      }
    }
    void checkSetup();
  }, [router]);

  useEffect(() => {
    let active = true;

    async function startConditionalUI() {
      if (!passkeysSupported()) return;
      const supported = await isConditionalSupported();
      if (!supported || !active || showForgot) return;

      abortControllerRef.current = new AbortController();

      try {
        const user = await loginWithPasskey("", {
          conditional: true,
          signal: abortControllerRef.current.signal,
        });

        if (active && user) {
          loginWithToken(getToken() || "", user);
          notify(`Welcome back, ${user.name || user.username}!`, "success");
          routeForRole(user.role);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.debug("Conditional UI passkey interaction ended", err);
        }
      }
    }

    void startConditionalUI();

    return () => {
      active = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [showForgot, loginWithToken, notify, routeForRole]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      const msg = "Please enter your username/email and password.";
      setErrorMessage(msg);
      notify(msg, "error");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setBusy(true);
    setErrorMessage("");
    try {
      const user = await loginWithPassword(cleanId, password);
      notify(`Welcome back, ${user.name || user.username}!`, "success");
      routeForRole(user.role);
    } catch (err: any) {
      const msg = friendlyAuthError(err, "password");
      setErrorMessage(msg);
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const handlePasskeyLogin = async () => {
    const cleanId = identifier.trim();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setBusy(true);
    setErrorMessage("");
    try {
      const user = await loginWithPasskey(cleanId);
      loginWithToken(getToken() || "", user);
      notify("Signed in with passkey", "success");
      routeForRole(user.role);
    } catch (err: any) {
      const msg = friendlyAuthError(err, "passkey");
      if (msg) {
        setErrorMessage(msg);
        notify(msg, "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      const msg = "Please provide a valid email address.";
      setErrorMessage(msg);
      notify(msg, "error");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    try {
      await requestPasswordReset(cleanEmail);
      notify("If that email exists, a reset link is on its way.", "success");
      setShowForgot(false);
    } catch (err: any) {
      const msg = err.message || "Request failed";
      setErrorMessage(msg);
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page-center min-vh-100 d-flex flex-column justify-content-center py-4">
      <div className="position-absolute top-0 end-0 p-3">
        <ThemeToggle />
      </div>

      <div className="container container-tight">
        <div className="text-center mb-4">
          <div className="avatar bg-primary text-primary-fg rounded mb-2" style={{ width: 48, height: 48 }}>
            <IconCalendarCheck size={26} />
          </div>
          <h1 className="h2 mb-1 fw-bold">Timesheet Portal</h1>
          <p className="text-secondary small">Sign in to fill today&apos;s activity</p>
        </div>

        <div className="card card-md shadow-sm">
          <div className="card-body">
            {errorMessage && (
              <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                <IconAlertCircle size={18} className="me-2 shrink-0" />
                <div className="small">{errorMessage}</div>
              </div>
            )}

            {!showForgot ? (
              <form onSubmit={handlePasswordLogin}>
                <div className="mb-3">
                  <label htmlFor="login-identifier" className="form-label required">Username or Email</label>
                  <input
                    id="login-identifier"
                    className="form-control"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="username webauthn"
                    required
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="login-password" className="form-label required mb-0">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setShowForgot(true);
                      }}
                      className="btn btn-link p-0 small text-decoration-none"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-group input-group-flat">
                    <input
                      id="login-password"
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <span className="input-group-text">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="link-secondary p-0 border-0 bg-transparent"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </button>
                    </span>
                  </div>
                </div>

                <div className="form-footer d-flex flex-column gap-2 mt-4">
                  <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                    {busy ? (
                      <IconLoader2 size={18} className="animate-spin me-2" />
                    ) : (
                      <IconKey size={18} className="me-2" />
                    )}
                    Sign in
                  </button>

                  {passkeysSupported() && (
                    <button
                      type="button"
                      onClick={() => {
                        void handlePasskeyLogin();
                      }}
                      className="btn btn-outline-primary w-100"
                      disabled={busy}
                    >
                      <IconFingerprint size={18} className="me-2" /> Sign in with passkey
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgot}>
                <div className="mb-3">
                  <label htmlFor="forgot-email" className="form-label required">Email address</label>
                  <input
                    id="forgot-email"
                    className="form-control"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                  <div className="form-text text-secondary small mt-1">
                    We&apos;ll email you a link to reset your password.
                  </div>
                </div>

                <div className="form-footer d-flex flex-column gap-2 mt-4">
                  <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                    {busy && <IconLoader2 size={18} className="animate-spin me-2" />}
                    Send reset link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setShowForgot(false);
                    }}
                    className="btn btn-link text-secondary"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
