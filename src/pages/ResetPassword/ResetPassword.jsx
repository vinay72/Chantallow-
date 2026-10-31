// src/pages/ResetPassword/ResetPassword.jsx
// /reset-password?token=... — the page a "Forgot Password" email links to.
// Submits the new password + token to POST /api/auth/reset-password (via
// AuthContext.resetPassword). The token is single-use and expires in 1 hour
// (enforced on the server); this page just shows whatever it says.

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import { useAuth } from "../../context/AuthContext";
import "./ResetPassword.css";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";

    return (
        <div className="rp-page">
            <Header />

            <div className="rp-banner">
                <h1>Reset Password</h1>
                <nav className="rp-crumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">◆</span>
                    <span aria-current="page">Reset Password</span>
                </nav>
            </div>

            <main className="rp-main">
                {token ? (
                    <ResetPasswordForm token={token} />
                ) : (
                    <div className="rp-card">
                        <h2 className="rp-title">Reset Password !</h2>
                        <p className="rp-error" role="alert">
                            This link is missing its reset code. Request a new one from the{" "}
                            <Link to="/forgot-password" className="rp-link">
                                Forgot Password
                            </Link>{" "}
                            page.
                        </p>
                    </div>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}

function ResetPasswordForm({ token }) {
    const { resetPassword } = useAuth();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Those passwords don't match.");
            return;
        }

        setSubmitting(true);
        try {
            await resetPassword(token, password);
            setDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="rp-card">
                <h2 className="rp-title">Reset Password !</h2>
                <p className="rp-success" role="status">
                    Your password has been updated.{" "}
                    <Link to="/login" className="rp-link">
                        Sign in
                    </Link>{" "}
                    with your new password.
                </p>
            </div>
        );
    }

    return (
        <div className="rp-card">
            <h2 className="rp-title">Reset Password !</h2>
            <p className="rp-subtitle">
                Remember Your Password?{" "}
                <Link to="/login" className="rp-link">
                    login
                </Link>
            </p>

            <form onSubmit={handleSubmit} noValidate>
                {error && (
                    <p className="rp-error" role="alert">
                        {error}
                    </p>
                )}

                <label className="rp-label" htmlFor="rp-password">
                    Enter Your New Password
                </label>
                <div className="rp-password-wrap">
                    <input
                        id="rp-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Password"
                        className="rp-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="rp-eye-btn"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <label className="rp-label" htmlFor="rp-confirm">
                    Confirm Password
                </label>
                <div className="rp-password-wrap">
                    <input
                        id="rp-confirm"
                        type={showConfirm ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Password"
                        className="rp-input"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                    <button
                        type="button"
                        className="rp-eye-btn"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirm((v) => !v)}
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <p className="rp-hint">Must be at least 8 Characters.</p>

                <button type="submit" className="rp-submit" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Password"}
                </button>
            </form>
        </div>
    );
}
