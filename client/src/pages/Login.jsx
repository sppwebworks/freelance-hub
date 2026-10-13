import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearError } from "../features/auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);
  useEffect(
    () => () => {
      dispatch(clearError());
    },
    [dispatch],
  );

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>💼 FreelanceHub</h1>
        <p>Sign in to continue</p>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="auth-alt">
          No account? <Link to="/register">Register</Link>
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            textAlign: "center",
            color: "var(--text-3)",
            marginTop: "0.5rem",
          }}
        >
          Demo: client@freelance.com / password123
        </p>
      </form>
    </div>
  );
};

export default Login;
