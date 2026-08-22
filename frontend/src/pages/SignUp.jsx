import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  PASSWORD_RULES,
  passwordFailures,
  generateOtp,
} from "../data/mockData";

const initialForm = {
  companyName: "",
  adminFirstName: "",
  adminLastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function SignUp() {
  const { signUpCompany, users, company } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Mock email verification — no mail server behind this frontend demo, so
  // the "sent" code is surfaced directly in the UI for the person to enter.
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  const hasExistingWorkspace = users.length > 0;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "email" && emailVerified) {
      // Changing the email after verifying invalidates the verification.
      setEmailVerified(false);
      setOtpSent(false);
      setOtpValue("");
      setSentOtp("");
    }
  }

  function handleSendOtp() {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErrors((e) => ({
        ...e,
        email: "Enter a valid email address before sending a code.",
      }));
      return;
    }
    const code = generateOtp();
    setSentOtp(code);
    setOtpSent(true);
    setOtpValue("");
    setOtpError("");
  }

  function handleVerifyOtp() {
    if (otpValue.trim() === sentOtp) {
      setEmailVerified(true);
      setOtpError("");
    } else {
      setOtpError(
        "That code doesn't match. Check the code shown below and try again.",
      );
    }
  }

  function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.adminFirstName.trim())
      e.adminFirstName = "First name is required.";
    if (!form.adminLastName.trim()) e.adminLastName = "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address.";
    else if (!emailVerified)
      e.email = "Verify your email address before continuing.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (form.phone.replace(/\D/g, "").length < 10)
      e.phone = "Enter a 10-digit phone number.";
    if (passwordFailures(form.password).length > 0)
      e.password = "Password doesn't meet all the requirements below.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    if (hasExistingWorkspace && !confirmReplace) {
      setErrors((e) => ({
        ...e,
        confirmReplace:
          "Check the box to confirm you want to replace the existing workspace.",
      }));
      return;
    }

    setLoading(true);
    try {
      const result = await signUpCompany({
        ...form,
        phone: `+91 ${form.phone.trim()}`,
        confirmReplace,
      });

      if (result?.error) {
        setErrors((e) => ({ ...e, submit: result.error }));
        return;
      }

      navigate("/app/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 mx-auto mb-4 flex items-center justify-center text-accent font-bold">
            D
          </div>
          <h1 className="text-xl font-semibold text-base-100">
            Set up your company
          </h1>
          <p className="text-sm text-base-400 mt-1.5">
            This creates your company workspace and your HR admin account.
          </p>
        </div>

        {hasExistingWorkspace && (
          <div className="mb-4 flex gap-2.5 bg-warn/10 border border-warn/30 rounded-xl px-3.5 py-3">
            <AlertTriangle size={16} className="text-warn shrink-0 mt-0.5" />
            <p className="text-xs text-base-300 leading-relaxed">
              This browser already has a workspace set up for{" "}
              <span className="text-base-100 font-medium">{company.name}</span>.
              Signing up again will{" "}
              <span className="text-base-100 font-medium">replace it</span> —
              every current employee's login ID will stop working. Looking to
              add a new person to {company.name}? Sign in as an admin and use{" "}
              <span className="text-base-100 font-medium">Add Employee</span>{" "}
              from the Employees tab instead — that's the only place login IDs
              are generated for people joining an existing company.{" "}
              <Link
                to="/sign-in"
                className="text-accent hover:text-accent-hover font-medium"
              >
                Go to Sign In
              </Link>
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-base-850 border border-base-700 rounded-2xl p-6 shadow-card space-y-4"
        >
          <div className="flex items-center gap-4">
            <label className="w-16 h-16 rounded-xl border border-dashed border-base-600 bg-base-900 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:border-accent transition-colors">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload size={18} className="text-base-500" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogo}
                className="hidden"
              />
            </label>
            <div className="flex-1">
              <label className="block text-xs font-medium text-base-300 mb-1.5">
                Company name
              </label>
              <input
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Odoo India"
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent"
              />
              {errors.companyName && (
                <p className="text-xs text-bad mt-1">{errors.companyName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-base-300 mb-1.5">
                First name
              </label>
              <input
                value={form.adminFirstName}
                onChange={(e) => set("adminFirstName", e.target.value)}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
              />
              {errors.adminFirstName && (
                <p className="text-xs text-bad mt-1">{errors.adminFirstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-base-300 mb-1.5">
                Last name
              </label>
              <input
                value={form.adminLastName}
                onChange={(e) => set("adminLastName", e.target.value)}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
              />
              {errors.adminLastName && (
                <p className="text-xs text-bad mt-1">{errors.adminLastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">
              Work email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={emailVerified}
                  placeholder="you@company.com"
                  className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent disabled:opacity-70"
                />
                {emailVerified && (
                  <ShieldCheck
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-good"
                  />
                )}
              </div>
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="shrink-0 text-xs font-medium text-accent border border-accent/40 hover:bg-accent/10 rounded-lg px-3 focus-ring"
                >
                  {otpSent ? "Resend code" : "Send code"}
                </button>
              )}
            </div>
            {errors.email && (
              <p className="text-xs text-bad mt-1">{errors.email}</p>
            )}

            {otpSent && !emailVerified && (
              <div className="mt-2.5 bg-base-900 border border-base-700 rounded-lg p-3 space-y-2">
                <p className="text-xs text-base-400">
                  Demo mode — there's no mail server behind this build, so
                  here's the verification code that would've been emailed to{" "}
                  <span className="text-base-200">{form.email}</span>:{" "}
                  <span className="font-mono text-base-100 tracking-widest">
                    {sentOtp}
                  </span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={otpValue}
                    onChange={(e) =>
                      setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit code"
                    inputMode="numeric"
                    className="flex-1 bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus-ring focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="shrink-0 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg px-3.5 focus-ring"
                  >
                    Verify
                  </button>
                </div>
                {otpError && <p className="text-xs text-bad">{otpError}</p>}
              </div>
            )}
            {emailVerified && (
              <p className="text-xs text-good mt-1.5">Email verified.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-base-300 mb-1.5">
              Phone
            </label>
            <div className="flex items-stretch bg-base-900 border border-base-700 rounded-lg focus-within:border-accent overflow-hidden">
              <span className="flex items-center px-3 text-sm text-base-400 border-r border-base-700 bg-base-850 select-none shrink-0">
                +91
              </span>
              <input
                value={form.phone}
                onChange={(e) =>
                  set(
                    "phone",
                    e.target.value.replace(/[^\d ]/g, "").slice(0, 11),
                  )
                }
                placeholder="90000 00000"
                inputMode="numeric"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-bad mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-base-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    set("password", e.target.value);
                    setPasswordTouched(true);
                  }}
                  onFocus={() => setPasswordTouched(true)}
                  className="w-full bg-base-900 border border-base-700 rounded-lg pl-3 pr-9 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-0 top-0 h-full w-9 flex items-center justify-center text-base-500 hover:text-base-300 focus-ring rounded-lg"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-bad mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-base-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  className="w-full bg-base-900 border border-base-700 rounded-lg pl-3 pr-9 py-2.5 text-sm text-base-100 focus-ring focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-0 top-0 h-full w-9 flex items-center justify-center text-base-500 hover:text-base-300 focus-ring rounded-lg"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-bad mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {passwordTouched && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 -mt-1">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(form.password);
                return (
                  <li
                    key={rule.id}
                    className={`flex items-center gap-1.5 text-xs ${ok ? "text-good" : "text-base-500"}`}
                  >
                    {ok ? <Check size={12} /> : <X size={12} />} {rule.label}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-xs text-base-500 bg-base-900 border border-base-700 rounded-lg px-3 py-2.5">
            Only companies sign up here. Once you're in, add employees from the
            Employees tab — Dayflow generates their login ID and a temporary
            password automatically.
          </p>

          {hasExistingWorkspace && (
            <div>
              <label className="flex items-start gap-2.5 text-xs text-base-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmReplace}
                  onChange={(e) => {
                    setConfirmReplace(e.target.checked);
                    setErrors((er) => ({ ...er, confirmReplace: undefined }));
                  }}
                  className="mt-0.5 accent-accent"
                />
                I understand this replaces the existing {company.name} workspace
                and all current login IDs.
              </label>
              {errors.confirmReplace && (
                <p className="text-xs text-bad mt-1">{errors.confirmReplace}</p>
              )}
            </div>
          )}

          {errors.submit && (
            <p className="text-xs text-bad bg-bad/10 border border-bad/30 rounded-lg px-3 py-2">
              {errors.submit}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            title={
              !emailVerified ? "Verify your email address first" : undefined
            }
            className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg py-2.5 transition-colors focus-ring disabled:opacity-60"
          >
            {loading ? "Creating workspace…" : "Sign Up"}
          </button>

          <p className="text-center text-xs text-base-400">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-accent hover:text-accent-hover font-medium"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
