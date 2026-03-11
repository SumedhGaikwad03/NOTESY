import { useState } from "react";
import { login } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await login({ email, password });
      console.log(res.data); 
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      navigate("/rooms");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 px-6">

      {/* Floating background shapes */}
      <div className="absolute w-72 h-72 bg-amber-300/40 rounded-full blur-3xl -top-16 -left-16 animate-floatSlow"></div>
      <div className="absolute w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl bottom-0 right-0 animate-floatMedium"></div>
      <div className="absolute w-60 h-60 bg-orange-300/30 rounded-full blur-2xl top-1/3 left-1/2 -translate-x-1/2 animate-floatFast"></div>

      {/* Decorative soft shapes */}
      <div className="absolute w-40 h-40 bg-white/40 rounded-2xl rotate-12 top-20 right-20 backdrop-blur-md animate-spinSlow"></div>
      <div className="absolute w-32 h-32 bg-yellow-200/50 rounded-xl rotate-6 bottom-24 left-16 animate-pulse"></div>

      {/* Glass card */}
      <div className="relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-br from-white/60 to-white/20 shadow-2xl">

        <div className="w-full bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/40 transition-all duration-300 hover:shadow-amber-200/40">

          {/* Branding */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-amber-600 tracking-tight">
              Notesy
            </h1>
            <p className="text-gray-500 mt-3 text-sm">
              Your collaborative whiteboard for modern teams
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-5 py-3 rounded-xl border border-yellow-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-5 py-3 rounded-xl border border-yellow-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                loading
                  ? "bg-amber-300 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-300/40 active:scale-95"
              }`}
            >
              {loading ? "Signing you in..." : "Login"}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            New here?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-amber-600 font-medium cursor-pointer hover:underline"
            >
              Create an account
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
