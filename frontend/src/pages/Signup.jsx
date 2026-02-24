import { useState } from "react";
import { signup } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 px-6 overflow-hidden">

      <div className="absolute w-72 h-72 bg-amber-300 rounded-full blur-3xl opacity-30 -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-yellow-300 rounded-full blur-3xl opacity-30 bottom-0 right-0 animate-pulse"></div>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40 transition-all duration-300 hover:shadow-amber-200/40">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-amber-600 tracking-tight">
            Join Notesy
          </h1>
          <p className="text-gray-500 mt-3 text-sm">
            Build and collaborate without friction
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />

          {error && (
            <p className="text-red-500 text-sm text-center animate-fadeIn">
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
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-amber-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Signup;
