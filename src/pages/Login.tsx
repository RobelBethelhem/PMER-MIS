import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ercs.org");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const authData = {
        name: "ERCS Administrator",
        role: "admin",
        email,
        rememberMe,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem("pmer_auth", JSON.stringify(authData));
      setIsLoading(false);
      navigate("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0F172A]">
      {/* ── Gradient Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E11D48]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E11D48]/8 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

      {/* ── Grid Pattern Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* ── Branding ── */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-2xl shadow-rose-500/30 mb-6">
            <svg viewBox="0 0 24 24" fill="#E11D48" className="w-12 h-12">
              <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#0f172a] animate-pulse" />
          </div>
          <h1
            className="text-6xl font-black text-white tracking-tight mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ERCS <span className="text-[#E11D48] italic">PMER-MIS</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/20" />
            <span
              className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Planning, Monitoring, Evaluation &amp; Reporting
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
          <div className="mb-8">
            <h2
              className="text-xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Welcome back
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Email ── */}
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ercs.org"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#E11D48]/50 focus:ring-2 focus:ring-[#E11D48]/20 transition-all"
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#E11D48]/50 focus:ring-2 focus:ring-[#E11D48]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Remember Me ── */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-[#E11D48] peer-checked:border-[#E11D48] transition-all flex items-center justify-center">
                    {rememberMe && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-xs text-[#E11D48]/70 hover:text-[#E11D48] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-[#E11D48] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/40 hover:bg-[#BE123C] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="text-center mt-8">
          <p className="text-white/20 text-[11px] font-bold tracking-[0.2em] uppercase">
            PMER-MIS v2.0 &bull; Ethiopian Red Cross Society
          </p>
          <p className="text-white/10 text-[10px] mt-2">
            &copy; {new Date().getFullYear()} Ethiopian Red Cross Society. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
