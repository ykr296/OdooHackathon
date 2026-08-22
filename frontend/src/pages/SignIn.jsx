import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function SignIn() {
  const { signIn, resetToDemoData } = useApp();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function handleReset() {
    resetToDemoData();
    setError("");
    setLoginId("");
    setPassword("");
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!loginId.trim() || !password) {
      setError("Enter your login ID or email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      const err = await signIn(loginId, password);
      if (err) setError(err);
      else navigate("/app/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 mx-auto mb-4 flex items-center justify-center text-accent font-bold">
            D
          </div>
          <h1 className="text-xl font-semibold text-base-100">
            Sign in to Dayflow
          </h1>
          <p className="text-sm text-base-400 mt-1.5">
            Every workday, perfectly aligned.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-base-850 border border-base-700 rounded-2xl p-6 shadow-card space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">
              Login ID or email
            </label>
            <input
              autoFocus
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. OIRISH20230001 or you@company.com"
              className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-base-900 border border-base-700 rounded-lg pl-3 pr-10 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-base-500 hover:text-base-300 focus-ring rounded-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-bad bg-bad/10 border border-bad/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg py-2.5 transition-colors focus-ring disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-xs text-base-400">
            Setting up your company for the first time?{" "}
            <Link
              to="/sign-up"
              className="text-accent hover:text-accent-hover font-medium"
            >
              Sign Up
            </Link>
          </p>
        </form>

        <div className="mt-5 text-center text-xs text-base-500 space-y-1">
          <p>
            Demo admin:{" "}
            <span className="text-base-300 font-mono">OIARDE20220001</span> /{" "}
            <span className="text-base-300 font-mono">Welcome@123</span>
          </p>
          <p>
            Demo employee:{" "}
            <span className="text-base-300 font-mono">OIRISH20230001</span> /{" "}
            <span className="text-base-300 font-mono">Welcome@123</span>
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-base-500 hover:text-base-300 mt-2 focus-ring rounded"
          >
            <RotateCcw size={11} />{" "}
            {resetDone
              ? "Demo data restored"
              : "Demo logins not working? Reset to demo data"}
          </button>
        </div>
      </div>
    </div>
  );
}
