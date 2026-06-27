import { useState } from "react";
import { apiRequest } from "../api/axios.js";

function getTokenFromHash() {
  const match = window.location.hash.match(/^#\/reset-password\/(.+)$/);
  return match ? match[1] : null;
}

export default function ResetPassword() {
  const [token] = useState(getTokenFromHash);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await apiRequest(`/auth/reset-password/${token}`, {
        method: "POST",
        body: { password }
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-panel">
          <p className="eyebrow">FinTrack</p>
          <h1>Invalid link</h1>
          <p className="page-subtitle">This password reset link is invalid or has expired.</p>
          <p className="auth-switch" style={{ marginTop: "18px" }}>
            <a href="#/forgot-password">Request a new link</a>
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-screen">
        <div className="auth-panel">
          <p className="eyebrow">FinTrack</p>
          <h1>Password reset</h1>
          <p className="page-subtitle">Your password has been reset successfully.</p>
          <p className="auth-switch" style={{ marginTop: "18px" }}>
            <a href="#/login">Login with your new password</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <p className="eyebrow">FinTrack</p>
        <h1>Set new password</h1>
        <p className="page-subtitle">Enter your new password below.</p>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>
          <label>
            <span>Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              minLength={6}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="auth-switch">
          <a href="#/login">Back to login</a>
        </p>
      </div>
    </div>
  );
}
