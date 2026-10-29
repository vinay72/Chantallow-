import React, { useState } from "react";
import AccountLayout from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { formatAddress, saveAddress, useAccount } from "../../data/account";

/**
 * My Account → Address
 * Route: /account/address
 * Billing + shipping address cards, each with its own Edit form.
 */
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia"];

const FIELDS = [
  ["firstName", "First Name *", "given-name"],
  ["lastName", "Last Name", "family-name"],
  ["company", "Company (optional)", "organization"],
  ["street1", "Street Address *", "address-line1"],
  ["street2", "Apartment, suite, etc. (optional)", "address-line2"],
  ["city", "Town / City *", "address-level2"],
  ["state", "State / County *", "address-level1"],
  ["zip", "ZIP / Postcode *", "postal-code"],
];

function AddressCard({ type, title, address, onCopy }) {
  const { showToast } = useShop();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(address);
  const [errors, setErrors] = useState({});

  const start = () => {
    setForm({ ...address, city: address.city === "Other" ? address.cityOther : address.city });
    setErrors({});
    setEditing(true);
  };

  const onSave = (e) => {
    e.preventDefault();
    const out = {};
    if (!form.firstName.trim()) out.firstName = "Required.";
    if (!form.street1.trim()) out.street1 = "Required.";
    if (!form.city.trim()) out.city = "Required.";
    if (!form.state.trim()) out.state = "Required.";
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(form.zip.trim())) out.zip = "Enter a valid ZIP / postcode.";
    setErrors(out);
    if (Object.keys(out).length) return;
    saveAddress(type, { ...form, cityOther: "" });
    setEditing(false);
    showToast && showToast(`${title} saved`);
  };

  return (
    <div className="ua-address">
      <div className="ua-address__head">
        <h5>{title}</h5>
        {!editing && (
          <div className="ua-address__actions">
            {onCopy && (
              <button type="button" className="ua-link ua-link-btn" onClick={onCopy}>
                Same as billing
              </button>
            )}
            <button type="button" className="ua-link ua-link-btn" onClick={start}>
              Edit
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form className="ua-form" onSubmit={onSave} noValidate>
          <div className="ua-form__grid">
            {FIELDS.map(([k, label, ac]) => (
              <label key={k} className={`ua-field${errors[k] ? " has-error" : ""}`}>
                <span>{label}</span>
                <input value={form[k] || ""} autoComplete={ac} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} />
                {errors[k] && <em>{errors[k]}</em>}
              </label>
            ))}
            <label className="ua-field">
              <span>Country *</span>
              <select value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="ua-form__buttons">
            <button type="submit" className="ua-btn ua-btn--primary ua-btn--sm">
              Save Address
            </button>
            <button type="button" className="ua-btn ua-btn--outline ua-btn--sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <address>
          <strong>{`${address.firstName || ""} ${address.lastName || ""}`.trim() || "—"}</strong>
          {address.company && <span>{address.company}</span>}
          <span>{formatAddress(address) || "No address saved yet."}</span>
        </address>
      )}
    </div>
  );
}

export default function AccountAddress() {
  const { addresses } = useAccount();
  const { showToast } = useShop();

  return (
    <AccountLayout crumb="Account Address">
      <div className="ua-card">
        <h4 className="ua-card__title">Address</h4>
        <p className="ua-card__text">These addresses are used by default at checkout.</p>
        <div className="ua-address-grid">
          <AddressCard key={`b-${JSON.stringify(addresses.billing)}`} type="billing" title="Billing Address" address={addresses.billing} />
          <AddressCard
            key={`s-${JSON.stringify(addresses.shipping)}`}
            type="shipping"
            title="Shipping Address"
            address={addresses.shipping}
            onCopy={() => {
              saveAddress("shipping", addresses.billing);
              showToast && showToast("Shipping address set to billing address");
            }}
          />
        </div>
      </div>
    </AccountLayout>
  );
}
