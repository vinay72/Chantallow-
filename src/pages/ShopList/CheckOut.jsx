import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CheckOut.css";
import paymentCards from "../../assets/footer/footer.png";
import SiteFooter from "../../components/SiteFooter";
import { useShop } from "../../context/ShopContext";
import { formatPrice } from "../../data/products";
import { placeOrder } from "../../data/account";
import Header from "../../components/Header";

/**
 * Chantallow — Check Out page
 * Route: /checkout
 * Reads the real cart from ShopContext; on a valid order it clears the cart
 * and shows a thank-you message.
 */

const FLAT_RATE = 25.75;

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia"];

// State -> cities (India). Pick "Other" to type a city that isn't listed.
const INDIA = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  Delhi: ["New Delhi", "Dwarka", "Rohini"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Haryana: ["Gurugram", "Faridabad", "Panipat"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Mohali"],
  Rajasthan: ["Kota", "Jaipur", "Jodhpur", "Udaipur", "Ajmer"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Telangana: ["Hyderabad", "Warangal"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur", "Varanasi", "Agra"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
};

const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  company: "",
  country: "India",
  street1: "",
  street2: "",
  state: "Rajasthan",
  city: "Kota",
  cityOther: "",
  zip: "",
};

const Chevron = ({ open, size = 14, weight = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}
  >
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------------- Small form helpers ---------------- */
function Field({ label, required, error, children, full }) {
  return (
    <div className={`co-field${full ? " co-field--full" : ""}${error ? " has-error" : ""}`}>
      {label && (
        <label className="co-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error && <span className="co-error">{error}</span>}
    </div>
  );
}

function Select({ value, onChange, options, ...rest }) {
  return (
    <div className="co-select">
      <select value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  );
}

/* Address block — used for billing and for "ship to a different address" */
function AddressFields({ data, set, errors, prefix }) {
  const isIndia = data.country === "India";
  const cities = isIndia ? [...(INDIA[data.state] || []), "Other"] : [];

  return (
    <>
      <div className="co-row">
        <Field label="First Name" required error={errors[`${prefix}firstName`]}>
          <input className="co-input" value={data.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />
        </Field>
        <Field label="Last Name" required error={errors[`${prefix}lastName`]}>
          <input className="co-input" value={data.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />
        </Field>
      </div>

      <Field label="Company name (optional)">
        <input className="co-input" value={data.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
      </Field>

      <Field label="Country / Region" required>
        <Select
          value={data.country}
          onChange={(v) => {
            set("country", v);
            if (v === "India") {
              set("state", "Rajasthan");
              set("city", "Kota");
            } else {
              set("state", "");
              set("city", "");
            }
          }}
          options={COUNTRIES}
          aria-label="Country / Region"
        />
      </Field>

      <Field label="Street address" required error={errors[`${prefix}street1`]}>
        <input
          className="co-input"
          placeholder="House number and street name"
          value={data.street1}
          onChange={(e) => set("street1", e.target.value)}
          autoComplete="address-line1"
        />
        <input
          className="co-input co-input--stack"
          placeholder="Apartment, suite, unit, etc. (optional)"
          value={data.street2}
          onChange={(e) => set("street2", e.target.value)}
          autoComplete="address-line2"
        />
      </Field>

      <Field label="Town / City" required error={errors[`${prefix}city`]}>
        {isIndia ? (
          <>
            <Select value={data.city} onChange={(v) => set("city", v)} options={cities} aria-label="Town / City" />
            {data.city === "Other" && (
              <input
                className="co-input co-input--stack"
                placeholder="Enter your town / city"
                value={data.cityOther}
                onChange={(e) => set("cityOther", e.target.value)}
              />
            )}
          </>
        ) : (
          <input className="co-input" value={data.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />
        )}
      </Field>

      <Field label="State" required error={errors[`${prefix}state`]}>
        {isIndia ? (
          <Select
            value={data.state}
            onChange={(v) => {
              set("state", v);
              set("city", (INDIA[v] || ["Other"])[0]);
            }}
            options={Object.keys(INDIA)}
            aria-label="State"
          />
        ) : (
          <input className="co-input" value={data.state} onChange={(e) => set("state", e.target.value)} autoComplete="address-level1" />
        )}
      </Field>

      <Field label="ZIP Code" required error={errors[`${prefix}zip`]}>
        <input className="co-input" value={data.zip} onChange={(e) => set("zip", e.target.value)} inputMode="numeric" autoComplete="postal-code" />
      </Field>
    </>
  );
}

/* ---------------- Page ---------------- */
export default function CheckOut() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart, showToast } = useShop();

  // collapsible bars
  const [loginOpen, setLoginOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [login, setLogin] = useState({ user: "", pass: "" });
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  // form
  const [billing, setBilling] = useState(EMPTY_ADDRESS);
  const [shipping, setShipping] = useState(EMPTY_ADDRESS);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [shipDifferent, setShipDifferent] = useState(false);
  const [notes, setNotes] = useState("");

  // order box
  const [shippingMethod, setShippingMethod] = useState("free");
  const [payment, setPayment] = useState("bank");
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState({});
  const [placedOrder, setPlacedOrder] = useState(null);
  const [placing, setPlacing] = useState(false);

  const shippingCost = shippingMethod === "flat" ? FLAT_RATE : 0;
  const total = subtotal + shippingCost;

  const setB = (k, v) => setBilling((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setShipping((p) => ({ ...p, [k]: v }));

  const orderLines = useMemo(
    () =>
      cartItems.map((line) => ({
        key: line.key,
        name: line.product.displayName || line.product.name,
        img: line.product.cardImage || line.product.gallery[0],
        size: line.size,
        qty: line.qty,
        total: line.product.price * line.qty,
      })),
    [cartItems]
  );

  const validateAddress = (a, prefix, out) => {
    if (!a.firstName.trim()) out[`${prefix}firstName`] = "Please enter a first name.";
    if (!a.lastName.trim()) out[`${prefix}lastName`] = "Please enter a last name.";
    if (!a.street1.trim()) out[`${prefix}street1`] = "Please enter a street address.";
    const city = a.city === "Other" ? a.cityOther : a.city;
    if (!city.trim()) out[`${prefix}city`] = "Please enter a town / city.";
    if (!a.state.trim()) out[`${prefix}state`] = "Please enter a state.";
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(a.zip.trim())) out[`${prefix}zip`] = "Please enter a valid ZIP code.";
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const out = {};
    validateAddress(billing, "", out);
    if (shipDifferent) validateAddress(shipping, "ship_", out);
    if (!/^\+?[0-9 ]{7,15}$/.test(phone.trim())) out.phone = "Please enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) out.email = "Please enter a valid email address.";
    if (createAccount && password.length < 6) out.password = "Password must be at least 6 characters.";
    if (!agree) out.agree = "Please accept the terms and conditions to continue.";
    if (cartItems.length === 0) out.cart = "Your cart is empty.";

    setErrors(out);
    if (Object.keys(out).length) {
      // scroll to the first problem
      requestAnimationFrame(() => {
        const el = document.querySelector(".co-page .has-error, .co-page .co-error");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    // Save the order on the server (shows in My Account → Orders and the admin panel)
    setPlacing(true);
    let saved;
    try {
      saved = await placeOrder({
        items: cartItems.map((line) => ({
          productId: line.product.id,
          name: line.product.displayName || line.product.name,
          img: line.product.cardImage || line.product.gallery[0],
          size: line.size,
          qty: line.qty,
          price: line.product.price,
        })),
        address: shipDifferent ? shipping : billing,
        email: email.trim(),
        phone: phone.trim(),
        payment,
        shippingCost,
        notes,
      });
    } catch (err) {
      setErrors({ submit: `Your order wasn't placed: ${err.message}` });
      return;
    } finally {
      setPlacing(false);
    }
    const orderNo = `#${saved.id}`;
    setPlacedOrder({ id: saved.id, orderNo, total, email: email.trim(), payment });
    clearCart();
    showToast && showToast("Order placed — thank you!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    setCouponMsg(coupon.trim() ? `Coupon "${coupon.trim()}" applied.` : "Please enter a coupon code.");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    showToast && showToast(login.user ? `Welcome back, ${login.user}` : "Enter your username or email");
  };

  return (
    <div className="co-page">
      <Header />

      {/* ---------------- Banner ---------------- */}
      <div className="co-banner">
        <div className="co-banner__inner">
          <h1>Check Out</h1>
          <nav className="co-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="co-breadcrumb__sep">◆</span>
            <span aria-current="page">Check Out</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Thank-you (after placing an order) ---------------- */}
      {placedOrder ? (
        <section className="co-content">
          <div className="co-thanks">
            <h2>Thank you for your order!</h2>
            <p>
              Your order <strong>{placedOrder.orderNo}</strong> for <strong>{formatPrice(placedOrder.total)}</strong> has been
              received. A confirmation will be sent to <strong>{placedOrder.email}</strong>.
            </p>
            {placedOrder.payment === "bank" && (
              <p className="co-thanks__note">
                Please use <strong>{placedOrder.orderNo}</strong> as the payment reference for your bank transfer. Your order will
                be shipped once the funds have cleared.
              </p>
            )}
            <div className="co-thanks__actions">
              <button type="button" className="co-btn co-btn--primary" onClick={() => navigate(`/account/orders/${placedOrder.id}`)}>
                View My Order
              </button>
              <button type="button" className="co-btn co-btn--outline" onClick={() => navigate("/shop-list")}>
                Continue Shopping
              </button>
              <button type="button" className="co-btn co-btn--outline" onClick={() => navigate("/")}>
                Back To Home
              </button>
            </div>
          </div>
        </section>
      ) : (
        <form className="co-content" onSubmit={handlePlaceOrder} noValidate>
          <div className="co-grid">
            {/* ======== LEFT: Billing details ======== */}
            <div className="co-billing">
              <h2 className="co-title">Billing details</h2>

              {/* Returning customer */}
              <div className="co-toggle">
                <button type="button" className="co-toggle__bar" onClick={() => setLoginOpen((v) => !v)} aria-expanded={loginOpen}>
                  <span>
                    Returning customer? <em>Click here to login</em>
                  </span>
                  <Chevron open={loginOpen} size={20} weight={2.6} />
                </button>
                {loginOpen && (
                  <div className="co-toggle__panel">
                    <p className="co-hint">
                      If your order has not yet shipped, you can contact us to change your shipping address
                    </p>
                    <div className="co-row">
                      <Field label="Username or email">
                        <input className="co-input" value={login.user} onChange={(e) => setLogin((p) => ({ ...p, user: e.target.value }))} />
                      </Field>
                      <Field label="Password">
                        <input
                          className="co-input"
                          type="password"
                          value={login.pass}
                          onChange={(e) => setLogin((p) => ({ ...p, pass: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <button type="button" className="co-btn co-btn--primary co-btn--sm" onClick={handleLogin}>
                      Login
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon */}
              <div className="co-toggle">
                <button type="button" className="co-toggle__bar" onClick={() => setCouponOpen((v) => !v)} aria-expanded={couponOpen}>
                  <span>
                    Have a coupon? <em>Click here to enter your code</em>
                  </span>
                  <Chevron open={couponOpen} size={20} weight={2.6} />
                </button>
                {couponOpen && (
                  <div className="co-toggle__panel">
                    <p className="co-hint">
                      If your order has not yet shipped, you can contact us to change your shipping address
                    </p>
                    <div className="co-coupon">
                      <input className="co-input" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                      <button type="button" className="co-btn co-btn--primary co-btn--sm" onClick={applyCoupon}>
                        Apply Coupon
                      </button>
                    </div>
                    {couponMsg && <p className="co-hint co-hint--ok">{couponMsg}</p>}
                  </div>
                )}
              </div>

              <AddressFields data={billing} set={setB} errors={errors} prefix="" />

              <Field label="Phone" required error={errors.phone}>
                <input className="co-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </Field>

              <Field label="Email address" required error={errors.email}>
                <input className="co-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </Field>

              <div className="co-checks">
                <label className="co-check">
                  <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                  <span>Create an account?</span>
                </label>
                {createAccount && (
                  <Field label="Create account password" required error={errors.password}>
                    <input
                      className="co-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </Field>
                )}

                <label className="co-check">
                  <input type="checkbox" checked={shipDifferent} onChange={(e) => setShipDifferent(e.target.checked)} />
                  <span>Ship to a different address?</span>
                </label>
                {shipDifferent && (
                  <div className="co-ship-box">
                    <AddressFields data={shipping} set={setS} errors={errors} prefix="ship_" />
                  </div>
                )}
              </div>

              <Field label="Order notes (optional)">
                <textarea
                  className="co-input co-textarea"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>

            {/* ======== RIGHT: Your Order ======== */}
            <aside className="co-order-col">
              <h2 className="co-title">Your Order</h2>
              <div className="co-order">
                {orderLines.length === 0 ? (
                  <div className="co-order__empty">
                    Your cart is empty. <Link to="/shop-list">Continue shopping</Link>
                  </div>
                ) : (
                  orderLines.map((l) => (
                    <div className="co-order__item" key={l.key}>
                      <img src={l.img} alt={l.name} />
                      <div className="co-order__name">
                        {l.name}
                        <span>
                          {l.size.replace("oz", " oz")} × {l.qty}
                        </span>
                      </div>
                      <div className="co-order__price">{formatPrice(l.total)}</div>
                    </div>
                  ))
                )}
                {errors.cart && <p className="co-error">{errors.cart}</p>}

                <div className="co-order__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <h3 className="co-order__heading">Shipping</h3>
                <div className="co-radios">
                  <label className="co-radio">
                    <input type="radio" name="shipping" checked={shippingMethod === "free"} onChange={() => setShippingMethod("free")} />
                    <span>Free shipping</span>
                  </label>
                  <label className="co-radio co-radio--split">
                    <span className="co-radio__left">
                      <input type="radio" name="shipping" checked={shippingMethod === "flat"} onChange={() => setShippingMethod("flat")} />
                      <span>Flat Rate:</span>
                    </span>
                    <span>{FLAT_RATE.toFixed(2)}</span>
                  </label>
                </div>

                <div className="co-order__row co-order__row--total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>

                {/* Payment */}
                <div className="co-pay">
                  <label className="co-radio co-radio--lg">
                    <input type="radio" name="payment" checked={payment === "bank"} onChange={() => setPayment("bank")} />
                    <span>Direct bank transfer</span>
                  </label>
                  {payment === "bank" && (
                    <p className="co-pay__desc">
                      Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your
                      order will not be shipped until the funds have cleared in our account.
                    </p>
                  )}

                  <label className="co-radio co-radio--lg">
                    <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                    <span>Cash on delivery</span>
                  </label>
                  {payment === "cod" && <p className="co-pay__desc">Pay with cash when your order is delivered.</p>}

                  <label className="co-radio co-radio--lg co-radio--paypal">
                    <input type="radio" name="payment" checked={payment === "paypal"} onChange={() => setPayment("paypal")} />
                    <span>Paypal</span>
                    <img src={paymentCards} alt="Accepted cards" />
                    <a href="https://www.paypal.com/webapps/mpp/paypal-popup" target="_blank" rel="noreferrer">
                      What is PayPal?
                    </a>
                  </label>
                  {payment === "paypal" && (
                    <p className="co-pay__desc">Pay via PayPal; you can pay with your credit card if you don't have a PayPal account.</p>
                  )}
                </div>

                <p className="co-privacy">
                  Your personal data will be used to process your order, support your experience throughout this website, and for
                  other purposes described in our <Link to="/privacy-policy">privacy policy.</Link>
                </p>

                <label className={`co-check co-check--terms${errors.agree ? " has-error" : ""}`}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>
                    I have read and agree to the website <Link to="/terms-and-conditions">terms and conditions</Link>
                  </span>
                </label>
                {errors.agree && <p className="co-error">{errors.agree}</p>}

                {errors.submit && (
                  <p className="co-error" role="alert">
                    {errors.submit}
                  </p>
                )}
                <button type="submit" className="co-btn co-btn--primary co-btn--block" disabled={orderLines.length === 0 || placing}>
                  {placing ? "Placing Order…" : "Place Order"}
                </button>
              </div>
            </aside>
          </div>
        </form>
      )}

      <SiteFooter />
    </div>
  );
}
