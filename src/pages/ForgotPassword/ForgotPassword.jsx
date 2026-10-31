// src/pages/ForgotPassword/ForgotPassword.jsx
// /forgot-password — ask for the account email, then call
// POST /api/auth/forgot-password (via AuthContext.forgotPassword).
//
// The server always answers the same way whether or not that email has an
// account (so this page can't be used to find out who has one), so the
// confirmation message here is deliberately generic too.

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import { useAuth } from "../../context/AuthContext";
import "./ForgotPassword.css";

export default function ForgotPassword() {
    return (
        <div className="fp-page">
            <Header />

            <div className="fp-banner">
                <h1>Forgot Password</h1>
                <nav className="fp-crumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">◆</span>
                    <span aria-current="page">Forgot Password</span>
                </nav>
            </div>

            <main className="fp-main">
                <ForgotPasswordForm />
            </main>

            <SiteFooter />
        </div>
    );
}

function ForgotPasswordForm() {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const msg = await forgotPassword(email.trim());
            setMessage(msg || "If an account exists for that email, a password reset link has been sent.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fp-card">
            <h2 className="fp-title">Forgot Password ?</h2>
            <p className="fp-subtitle">
                Remember Your Password?{" "}
                <Link to="/login" className="fp-link">
                    login
                </Link>
            </p>

            {message ? (
                <p className="fp-success" role="status">
                    {message}
                </p>
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    {error && (
                        <p className="fp-error" role="alert">
                            {error}
                        </p>
                    )}

                    <label className="fp-label" htmlFor="fp-email">
                        Enter Your Email Address
                    </label>
                    <input
                        id="fp-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Email Address"
                        className="fp-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button type="submit" className="fp-submit" disabled={submitting}>
                        {submitting ? "Sending…" : "Reset Password"}
                    </button>
                </form>
            )}
        </div>
    );
}
