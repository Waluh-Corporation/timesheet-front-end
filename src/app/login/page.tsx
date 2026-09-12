"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  KeyRound,
  Fingerprint,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import ThemeToggle from "@/components/ThemeToggle";
import {
  loginWithPasskey,
  passkeysSupported,
  isConditionalSupported,
} from "@/lib/webauthn";
import { api, getToken } from "@/lib/api";
import { fetchSetupStatus } from "@/services/setup";

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

export default function LoginPage() {
  const { loginWithPassword, loginWithToken } = useAuth();
  const { notify } = useToast();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [conditionalActive, setConditionalActive] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const routeForRole = useCallback(
    (role: string) => {
      router.replace(role === "admin" ? "/users" : "/dashboard");
    },
    [router]
  );

  // Check setup status
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
    checkSetup();
  }, [router]);

  // WebAuthn Conditional UI (Passkey Autofill)
  useEffect(() => {
    let active = true;

    async function startConditionalUI() {
      if (!passkeysSupported()) return;
      const supported = await isConditionalSupported();
      if (!supported || !active || showForgot) return;

      setConditionalActive(true);
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
        // Silently catch abort or user dismissal
        if (err?.name !== "AbortError") {
          console.debug("Conditional UI passkey interaction ended", err);
        }
      }
    }

    startConditionalUI();

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

    // Abort conditional mediation when explicit form submit starts
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
    // Abort any ongoing conditional request before explicit modal request
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
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = "Please provide a valid email address.";
      setErrorMessage(msg);
      notify(msg, "error");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    try {
      await api("/api/v1/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email: cleanEmail }),
      });
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
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-16 w-16 place-items-center bg-mr-yellow text-black shadow-hard border-2 border-mr-ink">
            <CalendarCheck size={30} className="text-black" />
          </div>
          <h1 className="text-2xl font-extrabold">Timesheet Portal</h1>
          <p className="mt-1 text-sm text-mr-muted">
            Sign in to fill today&apos;s activity ✨
          </p>
        </div>

        <div className="card p-6 shadow-hard">
          {/* Conditional Error Banner */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 border-2 border-mr-ink bg-mr-pink/15 p-3 text-xs font-semibold text-mr-pink">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <div>
                <input
                  className="input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="username webauthn"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                Sign in
              </button>

              {passkeysSupported() && (
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  className="btn-accent w-full"
                  disabled={busy}
                >
                  <Fingerprint size={18} /> Sign in with passkey
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setShowForgot(true);
                }}
                className="text-center text-sm font-semibold text-mr-purple hover:underline"
              >
                Forgot your password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Email</label>
                <input
                  className="input"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
                <p className="mt-2 text-xs text-mr-muted">
                  We&apos;ll email you a link to reset your password.
                </p>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? <Loader2 size={18} className="animate-spin" /> : null}
                Send reset link
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setShowForgot(false);
                }}
                className="text-center text-sm font-semibold text-mr-purple hover:underline"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-mr-muted">
          Accounts are provisioned by administrators. Contact your admin for access.
        </p>
      </div>
    </div>
  );
}
