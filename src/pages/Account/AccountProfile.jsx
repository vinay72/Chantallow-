import React, { useEffect, useRef, useState } from "react";
import AccountLayout, { Avatar } from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { saveProfile, useAccount } from "../../data/account";

/**
 * My Account → Profile
 * Route: /account/profile
 * Edit name, email, phone and photo. The sidebar updates as soon as you save.
 */
export default function AccountProfile() {
  const { profile } = useAccount();
  const { showToast } = useShop();
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState({});
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => setForm(profile), [profile]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast && showToast("Please choose an image file");
    if (file.size > 1.5 * 1024 * 1024) return showToast && showToast("Please choose an image under 1.5 MB");
    const reader = new FileReader();
    reader.onload = () => {
      saveProfile({ avatar: reader.result });
      showToast && showToast("Profile photo updated");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onSave = (e) => {
    e.preventDefault();
    const out = {};
    if (!form.firstName.trim()) out.firstName = "Please enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) out.email = "Please enter a valid email address.";
    if (form.phone && !/^\+?[0-9 ]{7,15}$/.test(form.phone.trim())) out.phone = "Please enter a valid phone number.";
    setErrors(out);
    if (Object.keys(out).length) return;
    saveProfile({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() });
    showToast && showToast("Profile saved");
  };

  const onPassword = (e) => {
    e.preventDefault();
    const out = {};
    if (!pw.current) out.current = "Please enter your current password.";
    if (pw.next.length < 6) out.next = "New password must be at least 6 characters.";
    if (pw.next !== pw.confirm) out.confirm = "Passwords don't match.";
    setPwErrors(out);
    if (Object.keys(out).length) return;
    // TODO: send to your backend, e.g. PUT /api/users/me/password
    setPw({ current: "", next: "", confirm: "" });
    showToast && showToast("Password updated");
  };

  const Field = ({ label, name, type = "text", error, full, ...rest }) => (
    <label className={`ua-field${full ? " ua-field--full" : ""}${error ? " has-error" : ""}`}>
      <span>{label}</span>
      <input type={type} value={form[name] || ""} onChange={(e) => set(name, e.target.value)} {...rest} />
      {error && <em>{error}</em>}
    </label>
  );

  return (
    <AccountLayout crumb="Account Profile">
      <div className="ua-card">
        <h4 className="ua-card__title">Profile</h4>

        <div className="ua-photo-row">
          <Avatar profile={profile} size={110} />
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <button type="button" className="ua-btn ua-btn--outline ua-btn--sm" onClick={() => fileRef.current && fileRef.current.click()}>
              Change Photo
            </button>
            {profile.avatar && (
              <button type="button" className="ua-link ua-link-btn ua-link--danger" onClick={() => saveProfile({ avatar: "" })}>
                Remove
              </button>
            )}
            <p className="ua-card__text ua-card__text--sm">JPG or PNG, up to 1.5 MB.</p>
          </div>
        </div>

        <form className="ua-form" onSubmit={onSave} noValidate>
          <div className="ua-form__grid">
            {Field({ label: "First Name *", name: "firstName", error: errors.firstName, autoComplete: "given-name" })}
            {Field({ label: "Last Name", name: "lastName", autoComplete: "family-name" })}
            {Field({ label: "Email Address *", name: "email", type: "email", error: errors.email, autoComplete: "email" })}
            {Field({ label: "Phone", name: "phone", type: "tel", error: errors.phone, autoComplete: "tel" })}
            <label className="ua-field">
              <span>Gender</span>
              <select value={form.gender || ""} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Prefer not to say</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
            {Field({ label: "Birthday", name: "birthday", type: "date" })}
          </div>
          <button type="submit" className="ua-btn ua-btn--primary">
            Save Changes
          </button>
        </form>

        <h5 className="ua-subtitle">Change Password</h5>
        <form className="ua-form" onSubmit={onPassword} noValidate>
          <div className="ua-form__grid">
            {[
              ["current", "Current Password", "current-password"],
              ["next", "New Password", "new-password"],
              ["confirm", "Confirm New Password", "new-password"],
            ].map(([k, label, ac]) => (
              <label key={k} className={`ua-field${pwErrors[k] ? " has-error" : ""}`}>
                <span>{label}</span>
                <input type="password" autoComplete={ac} value={pw[k]} onChange={(e) => setPw((p) => ({ ...p, [k]: e.target.value }))} />
                {pwErrors[k] && <em>{pwErrors[k]}</em>}
              </label>
            ))}
          </div>
          <button type="submit" className="ua-btn ua-btn--outline">
            Update Password
          </button>
        </form>
      </div>
    </AccountLayout>
  );
}
