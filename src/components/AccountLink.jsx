// src/components/AccountLink.jsx
// The header's "Login / Register" link. Once signed in it becomes
// "My Account" (users -> /account, admins -> /admin).
//   <AccountLink className="login" />            two lines: "Login /" + "Register"
//   <AccountLink className="ctw-login" inline /> one line

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountLink({ className, inline = false }) {
    const { user, isAdmin } = useAuth();

    if (user) {
        return (
            <Link to={isAdmin ? "/admin" : "/account"} className={className}>
                {isAdmin ? "Admin Panel" : "My Account"}
            </Link>
        );
    }
    return (
        <Link to="/login" className={className}>
            {inline ? "Login / Register" : <>Login /<br />Register</>}
        </Link>
    );
}
