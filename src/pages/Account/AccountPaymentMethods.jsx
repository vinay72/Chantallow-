import React, { useState } from "react";
import AccountLayout from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { removeSavedCard, savePaymentMethod, useAccount } from "../../data/account";

/**
 * My Account → Payment Methods
 * Route: /account/payment-methods
 * Choose the default way to pay. For a card, only the brand, last 4 digits and
 * expiry are saved — the full number and CVC are never stored.
 */

/* ---------------- Icons ---------------- */
const PaypalIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
    <path d="M12.6 30H7.4a.8.8 0 0 1-.8-.95L10.5 4.7A1.6 1.6 0 0 1 12.1 3.4h8.3c4.9 0 7.8 2.6 7 7.2-.9 5.3-4.4 7.8-9.5 7.8h-3.1l-1.4 10.9a.8.8 0 0 1-.8.7Z" fill="#253B80" />
    <path d="M27.6 10.9c-.9 5.3-4.4 7.8-9.5 7.8h-3.1L13.4 30.6a.6.6 0 0 0 .6.7h4.4a.8.8 0 0 0 .8-.7l.9-6.1h2.5c4.6 0 7.8-2.4 8.6-7 .4-2.6-.5-4.8-3.6-6.6Z" fill="#179BD7" />
  </svg>
);
const CardIcon = () => (
  <svg width="46" height="32" viewBox="0 0 46 32" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="44" height="30" rx="3" stroke="#1c1c1a" strokeWidth="1.6" />
    <path d="M1 8.5h44" stroke="#1c1c1a" strokeWidth="1.6" />
    <rect x="6" y="14" width="9" height="6" rx="1" stroke="#1c1c1a" strokeWidth="1.4" />
    <path d="M6 25h6M15 25h4M22 25h4M29 25h4M36 25h4" stroke="#1c1c1a" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const BankIcon = () => (
  <svg width="46" height="32" viewBox="0 0 46 32" aria-hidden="true">
    <rect width="46" height="32" rx="2" fill="#fff" />
    <text x="4" y="22" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="17" fill="#1c1c1a">
      INB
    </text>
    <rect x="4" y="3.5" width="3.2" height="3.2" fill="#e53935" />
    <text x="4" y="29" fontFamily="Arial, sans-serif" fontSize="4.2" fill="#555">
      Indian Net Banking
    </text>
  </svg>
);
const CashIcon = () => (
  <svg width="46" height="34" viewBox="0 0 46 34" fill="none" aria-hidden="true">
    <path d="M8 9 33 2l3 7" stroke="#1c1c1a" strokeWidth="1.6" strokeLinejoin="round" />
    <rect x="2" y="9" width="42" height="23" rx="2" stroke="#1c1c1a" strokeWidth="1.6" />
    <rect x="6" y="13" width="34" height="15" rx="1.5" stroke="#1c1c1a" strokeWidth="1.2" />
    <circle cx="23" cy="20.5" r="5" stroke="#1c1c1a" strokeWidth="1.5" />
    <path d="M24.6 18.6c-.4-.6-1-.9-1.7-.9-1 0-1.6.5-1.6 1.2 0 1.7 3.5.9 3.5 2.7 0 .7-.7 1.3-1.8 1.3-.8 0-1.5-.3-1.9-1M23 16.8v7.4" stroke="#1c1c1a" strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="11" cy="20.5" r="1.4" fill="#1c1c1a" />
    <circle cx="35" cy="20.5" r="1.4" fill="#1c1c1a" />
  </svg>
);

const METHODS = [
  { key: "paypal", label: "Paypal", Icon: PaypalIcon },
  { key: "card", label: "Credit or Debit Card", Icon: CardIcon },
  { key: "bank", label: "Direct bank Transfer", Icon: BankIcon },
  { key: "cod", label: "Cash on Delivery", Icon: CashIcon },
];

/* ---------------- Card helpers ---------------- */
const digitsOnly = (v) => v.replace(/\D/g, "");
const formatCardNumber = (v) => digitsOnly(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

const cardBrand = (num) => {
  const n = digitsOnly(num);
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^(60|65|81|82|508)/.test(n)) return "RuPay";
  if (/^6/.test(n)) return "Discover";
  return "Card";
};

// Luhn check — catches typos in the card number
const isValidCardNumber = (num) => {
  const n = digitsOnly(num);
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = Number(n[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
};

// expiry comes from <input type="month"> as "YYYY-MM"
const isFutureMonth = (ym) => {
  if (!/^\d{4}-\d{2}$/.test(ym)) return false;
  const [y, m] = ym.split("-").map(Number);
  const now = new Date();
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1);
};
const prettyExpiry = (ym) => {
  const [y, m] = ym.split("-");
  return `${m}/${y.slice(2)}`;
};

export default function AccountPaymentMethods() {
  const { paymentMethod = { type: "cod" }, profile } = useAccount();
  const { showToast } = useShop();

  const [type, setType] = useState(paymentMethod.type || "cod");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [paypalEmail, setPaypalEmail] = useState(paymentMethod.paypalEmail || profile.email || "");
  const [errors, setErrors] = useState({});

  const saved = paymentMethod.card;
  const setC = (k, v) => setCard((p) => ({ ...p, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    const out = {};

    if (type === "card") {
      // a saved card can be kept without retyping it
      const typing = card.number || card.expiry || card.cvc;
      if (!saved || typing) {
        if (!isValidCardNumber(card.number)) out.number = "Please enter a valid card number.";
        if (!isFutureMonth(card.expiry)) out.expiry = "Please enter a valid expiry date.";
        if (!/^\d{3,4}$/.test(card.cvc)) out.cvc = "Please enter the 3 or 4 digit code.";
      }
    }
    if (type === "paypal" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail.trim())) out.paypalEmail = "Please enter your PayPal email.";

    setErrors(out);
    if (Object.keys(out).length) return;

    let nextCard = saved;
    if (type === "card" && card.number) {
      const n = digitsOnly(card.number);
      nextCard = { brand: cardBrand(n), last4: n.slice(-4), expiry: prettyExpiry(card.expiry), name: card.name.trim() };
    }

    // TODO: when you add a payment gateway (Razorpay / Stripe / PayPal), send the card
    // details to the gateway here and save only the token it returns.
    savePaymentMethod({ type, card: nextCard, paypalEmail: type === "paypal" ? paypalEmail.trim() : paymentMethod.paypalEmail });
    setCard({ number: "", expiry: "", cvc: "", name: "" });
    showToast && showToast("Payment method saved");
  };

  return (
    <AccountLayout crumb="Account Payment Methods">
      <div className="ua-card ua-pay">
        <h4 className="ua-pay__title">Payment Methods</h4>

        <form onSubmit={onSubmit} noValidate>
          {/* ---------- Method choices ---------- */}
          <div className="ua-pay__grid" role="radiogroup" aria-label="Payment method">
            {METHODS.map(({ key, label, Icon }) => (
              <label key={key} className={`ua-pay__option${type === key ? " is-selected" : ""}`}>
                <span className="ua-pay__icon">
                  <Icon />
                </span>
                <span className="ua-pay__label">{label}</span>
                <input
                  type="radio"
                  name="payment-method"
                  value={key}
                  checked={type === key}
                  onChange={() => {
                    setType(key);
                    setErrors({});
                  }}
                />
                <span className="ua-pay__radio" aria-hidden="true" />
              </label>
            ))}
          </div>

          {/* ---------- Details for the chosen method ---------- */}
          {type === "card" && (
            <>
              {saved && (
                <div className="ua-pay__saved">
                  <span>
                    Saved card: <strong>{saved.brand} •••• {saved.last4}</strong> — expires {saved.expiry}
                  </span>
                  <button
                    type="button"
                    className="ua-link ua-link-btn ua-link--danger"
                    onClick={() => {
                      removeSavedCard();
                      showToast && showToast("Saved card removed");
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="ua-pay__fields">
                <label className={`ua-pay__field ua-pay__field--number${errors.number ? " has-error" : ""}`}>
                  <span>Card Number</span>
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 4567 8910 1112"
                    value={card.number}
                    onChange={(e) => setC("number", formatCardNumber(e.target.value))}
                  />
                  {errors.number && <em>{errors.number}</em>}
                </label>

                <label className={`ua-pay__field${errors.expiry ? " has-error" : ""}`}>
                  <span>Expiry Date</span>
                  <input type="month" autoComplete="cc-exp" value={card.expiry} onChange={(e) => setC("expiry", e.target.value)} />
                  {errors.expiry && <em>{errors.expiry}</em>}
                </label>

                <label className={`ua-pay__field${errors.cvc ? " has-error" : ""}`}>
                  <span>CVC/CVV</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="1234"
                    maxLength={4}
                    value={card.cvc}
                    onChange={(e) => setC("cvc", digitsOnly(e.target.value).slice(0, 4))}
                  />
                  {errors.cvc && <em>{errors.cvc}</em>}
                </label>
              </div>
            </>
          )}

          {type === "paypal" && (
            <div className="ua-pay__fields ua-pay__fields--one">
              <label className={`ua-pay__field${errors.paypalEmail ? " has-error" : ""}`}>
                <span>PayPal Email</span>
                <input type="email" autoComplete="email" placeholder="you@example.com" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
                {errors.paypalEmail && <em>{errors.paypalEmail}</em>}
              </label>
            </div>
          )}

          {type === "bank" && (
            <p className="ua-pay__note">
              Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will be
              shipped once the funds have cleared in our account.
            </p>
          )}

          {type === "cod" && <p className="ua-pay__note">Pay with cash when your order is delivered to your door.</p>}

          <button type="submit" className="ua-btn ua-btn--primary ua-pay__submit">
            Save Payment Method
          </button>
        </form>
      </div>
    </AccountLayout>
  );
}
