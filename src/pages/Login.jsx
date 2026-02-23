import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export default function Login() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!form.email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!form.password) {
      setLocalError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password, rememberMe);
      navigate(from, { replace: true });
    } catch {
      // Error is set by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-20">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#e94560]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#f5a623]/5 rounded-full blur-3xl" />
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
            Welcome <span className="text-[#e94560]">Back</span>
          </h1>
          <p className="text-[#a0a0a0]">Sign in to your Nimo's account</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 shadow-xl shadow-black/20">
          {/* Error display */}
          {displayError && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6" role="alert">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#e0e0e0] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0]" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#e0e0e0] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0]" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-[#080808] border border-white/10 rounded peer-checked:bg-[#e94560] peer-checked:border-[#e94560] transition-all duration-200 flex items-center justify-center">
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#a0a0a0] group-hover:text-[#e0e0e0] transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => setLocalError('To reset your password, please contact us at +353 6243300 or visit the restaurant.')}
                className="text-sm text-[#e94560] hover:text-[#f5a623] transition-colors"
              >
                Forgot password?
              </button>
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
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

          {/* Register link */}
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#e94560] hover:text-[#f5a623] font-semibold transition-colors inline-flex items-center gap-1"
              >
                Create Account
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
