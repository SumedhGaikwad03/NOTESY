import { useState } from "react";
import { signup } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .signup-root * { font-family: 'DM Sans', sans-serif; }
        .brand-font { font-family: 'Playfair Display', serif; }

        @keyframes floatSlow   { 0%,100% { transform: translateY(0) rotate(0deg);   } 50% { transform: translateY(-24px) rotate(4deg);  } }
        @keyframes floatMedium { 0%,100% { transform: translateY(0) rotate(0deg);   } 50% { transform: translateY(20px)  rotate(-4deg); } }
        @keyframes floatFast   { 0%,100% { transform: translateY(0) rotate(0deg);   } 50% { transform: translateY(-16px) rotate(6deg);  } }
        @keyframes spinSlow    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp      { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes shimmer     { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        .animate-floatSlow   { animation: floatSlow   7s ease-in-out infinite; }
        .animate-floatMedium { animation: floatMedium 9s ease-in-out infinite; }
        .animate-floatFast   { animation: floatFast   5s ease-in-out infinite; }
        .animate-spinSlow    { animation: spinSlow   18s linear infinite; }
        .card-enter          { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }

        .top-shimmer {
          height: 3px;
          background: linear-gradient(90deg, #fbbf24, #f97316, #ea580c, #f97316, #fbbf24);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          border-radius: 9999px 9999px 0 0;
        }

        .signup-input {
          width: 100%;
          padding: 13px 18px;
          border-radius: 14px;
          border: 1.5px solid #fde68a;
          background: rgba(255,255,255,0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1c1917;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .signup-input::placeholder { color: #a8a29e; }
        .signup-input:focus {
          border-color: #f97316;
          background: rgba(255,255,255,0.97);
          box-shadow: 0 0 0 4px rgba(251,146,60,0.15);
        }

        .signup-btn {
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          background: linear-gradient(135deg, #f97316, #ea580c);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          letter-spacing: 0.01em;
        }
        .signup-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(234,88,12,0.4);
        }
        .signup-btn:active:not(:disabled) { transform: scale(0.98); }
        .signup-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        .step-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #fde68a;
          transition: background 0.3s, transform 0.3s;
        }
        .step-dot.active {
          background: #f97316;
          transform: scale(1.3);
        }
      `}</style>

      <div className="signup-root min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 px-6">

        {/* ── BLOBS (same as Login) ── */}
        <div className="absolute w-72 h-72 bg-amber-300/40 rounded-full blur-3xl -top-16 -left-16 animate-floatSlow" />
        <div className="absolute w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl bottom-0 right-0 animate-floatMedium" />
        <div className="absolute w-60 h-60 bg-orange-300/30 rounded-full blur-2xl top-1/3 left-1/2 -translate-x-1/2 animate-floatFast" />
        <div className="absolute w-40 h-40 bg-white/40 rounded-2xl rotate-12 top-20 right-20 backdrop-blur-md animate-spinSlow" />
        <div className="absolute w-32 h-32 bg-yellow-200/50 rounded-xl rotate-6 bottom-24 left-16 animate-pulse" />

        {/* ── CARD ── */}
        <div className="card-enter relative w-full max-w-md">

          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(251,146,60,0.15) 0%, transparent 70%)", transform: "scale(1.15)", filter: "blur(24px)" }} />

          <div className="relative w-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(194,65,12,0.1), 0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)" }}>

            <div className="top-shimmer" />

            <div className="px-10 pt-9 pb-10">

              {/* Branding */}
              <div className="mb-7 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)", boxShadow: "0 6px 18px rgba(249,115,22,0.35)" }}>
                  <span className="brand-font text-white font-extrabold text-2xl">N</span>
                </div>
                <h1 className="brand-font text-4xl font-extrabold text-amber-600 tracking-tight">
                  Join Notesy
                </h1>
                <p className="text-gray-500 mt-2 text-sm font-light">
                  Build and collaborate without friction
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-7">
                <div className={`step-dot ${form.username ? "active" : ""}`} />
                <div className={`step-dot ${form.email ? "active" : ""}`} />
                <div className={`step-dot ${form.password ? "active" : ""}`} />
              </div>

              {/* Form */}
              <div className="space-y-4">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="signup-input"
                />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="signup-input"
                />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="signup-input"
                />

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 font-medium"
                    style={{ background: "rgba(254,226,226,0.75)", border: "1px solid rgba(252,165,165,0.4)" }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                <div className="pt-1">
                  <button onClick={handleSubmit} disabled={loading} className="signup-btn">
                    {loading
                      ? <><span className="spinner" />Creating account…</>
                      : "Create Account →"
                    }
                  </button>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-7">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-amber-600 font-semibold cursor-pointer hover:underline"
                >
                  Sign in
                </span>
              </p>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Signup;