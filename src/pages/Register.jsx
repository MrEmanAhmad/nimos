import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const InputField = ({ id, name, type = 'text', label, icon: Icon, placeholder, autoComplete, isPassword, showToggle, onToggle, value, onChange, error: fieldError }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#e0e0e0] mb-2">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0]" aria-hidden="true" />
      <input
        id={id}
        name={name}
        type={isPassword ? (showToggle ? 'text' : 'password') : type}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={!!fieldError}
        aria-describedby={fieldError ? `${id}-error` : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-12 ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 bg-[#080808] border rounded-lg text-white placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all duration-200 ${
          fieldError ? 'border-red-500/50' : 'border-white/10'
        }`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors"
          aria-label={showToggle ? 'Hide password' : 'Show password'}
        >
          {showToggle ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
    {fieldError && (
      <p id={`${id}-error`} className="text-red-400 text-xs mt-1.5 flex items-center gap-1" role="alert">
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        {fieldError}
      </p>
    )}
  </div>
);

export default function Register() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone.trim())) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreedTerms) {
      errors.terms = 'You must agree to the terms and conditions.';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Excellent', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.phone.trim(), form.password);
      navigate('/account', { replace: true });
    } catch {
      // Error is set by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-20">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#e94560]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-[#f5a623]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <picture className="img-placeholder inline-block rounded-full">
              <source srcSet="/images/logo.webp" type="image/webp" />
              <img
                src="/images/logo.webp"
                alt="Nimo's Limerick - Takeaway in Knocklong, Co. Limerick"
                className="w-16 h-16 object-contain mx-auto"
                width="64"
                height="64"
                loading="lazy"
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
              />
            </picture>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Create <span className="text-[#e94560]">Account</span>
          </h1>
          <p className="text-[#a0a0a0]">Join Nimo's and start earning rewards</p>
        </div>

        {/* Register Card */}
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 shadow-xl shadow-black/20">
          {/* API error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6" role="alert">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Create account form">
            <InputField
              id="name"
              name="name"
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              error={localErrors.name}
            />

            <InputField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              icon={Mail}
              placeholder="your@email.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={localErrors.email}
            />

            <InputField
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              icon={Phone}
              placeholder="+353 86 123 4567"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              error={localErrors.phone}
            />

            <div>
              <InputField
                id="password"
                name="password"
                label="Password"
                icon={Lock}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                isPassword
                showToggle={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                value={form.password}
                onChange={handleChange}
                error={localErrors.password}
              />
              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#a0a0a0]">
                    Strength: <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              icon={Lock}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              isPassword
              showToggle={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              value={form.confirmPassword}
              onChange={handleChange}
              error={localErrors.confirmPassword}
            />

            {/* Password match indicator */}
            {form.confirmPassword && form.password && (
              <div className="flex items-center gap-1.5 -mt-2">
                {form.password === form.confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-xs">Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => {
                      setAgreedTerms(e.target.checked);
                      if (localErrors.terms) {
                        setLocalErrors((prev) => {
                          const next = { ...prev };
                          delete next.terms;
                          return next;
                        });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 bg-[#080808] border rounded peer-checked:bg-[#e94560] peer-checked:border-[#e94560] transition-all duration-200 flex items-center justify-center ${
                    localErrors.terms ? 'border-red-500/50' : 'border-white/10'
                  }`}>
                    {agreedTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#a0a0a0] group-hover:text-[#e0e0e0] transition-colors leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#e94560] hover:text-[#f5a623] transition-colors underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#e94560] hover:text-[#f5a623] transition-colors underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {localErrors.terms && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 ml-8" role="alert">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  {localErrors.terms}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#d13350] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#e94560]/25 hover:shadow-[#e94560]/40"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#a0a0a0] text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors inline-flex items-center gap-1"
              >
                Sign In
                <ChevronRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
