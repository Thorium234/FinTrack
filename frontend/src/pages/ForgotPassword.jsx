import { useState } from "react";
import { apiRequest } from "../api/axios.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-screen">
        <div className="auth-panel">
          <p className="eyebrow">FinTrack</p>
          <h1>Check your email</h1>
          <p className="page-subtitle">
            If that email is registered, you will receive a password reset link shortly.
            Check the server console for the simulated reset link.
          </p>
          <p className="auth-switch" style={{ marginTop: "18px" }}>
            <a href="#/login">Back to login</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <p className="eyebrow">FinTrack</p>
        <h1>Reset password</h1>
        <p className="page-subtitle">Enter your email and we will send you a reset link.</p>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password? <a href="#/login">Login</a>
        </p>
      </div>
    </div>
  );
}
