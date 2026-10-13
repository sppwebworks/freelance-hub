import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, clearError } from "../features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
  });

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
    dispatch(register(form));
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create Account</h1>
        {error && <div className="auth-error">{error}</div>}

        <div className="role-toggle">
          <button
            type="button"
            className={form.role === "freelancer" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "freelancer" })}
          >
            👨‍💻 Freelancer
          </button>
          <button
            type="button"
            className={form.role === "client" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "client" })}
          >
            🏢 Client
          </button>
        </div>

        <input
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="auth-alt">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
