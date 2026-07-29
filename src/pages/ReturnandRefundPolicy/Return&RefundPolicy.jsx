import React, { useState } from "react";
import "./ReturnRefundPolicy.css";

/**
 * Chantallow — Return & Refund Policy page
 * Converted from the static HTML template (Bootstrap accordion + contact
 * form) into a self-contained React component.
 *
 * Wrap this with your shared <Header /> and <Footer /> in your router,
 * the same ones used on the Product Detail page.
 */

const POLICY_ITEMS = [
  {
    id: "returns",
    title: "Returns",
    body: [
      "For hygiene and safety reasons, opened or used products cannot be returned or exchanged.",
      "Returns are only accepted for products received in damaged, defective, or incorrect condition.",
    ],
  },
  {
    id: "timeline",
    title: "Return Request Timeline",
    body: [
      "Any issue with the order must be reported within 48 hours of delivery.",
      "Customers must provide order details along with clear images of the product and packaging.",
    ],
  },
  {
    id: "refunds",
    title: "Refunds & Replacements",
    body: [
      "Once the issue is reviewed and approved, we may offer:",
      "Replacement of the product, or Refund to the original payment method. Refund timelines may vary depending on the payment provider.",
    ],
  },
  {
    id: "non-returnable",
    title: "Non-Returnable Items",
    body: [
      "The following items are not eligible for return:",
      "Opened or used skincare products, products purchased during sale or promotional events, gift cards or complimentary items.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping Charges",
    body: [
      "Shipping charges are non-refundable unless the error was from our side.",
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className={`rr-accordion__item ${isOpen ? "is-open" : ""}`}>
      <h2 className="rr-accordion__header">
        <button
          type="button"
          className="rr-accordion__button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`rr-panel-${item.id}`}
        >
          {item.title}
          <span className="rr-accordion__toggle" aria-hidden="true" />
        </button>
      </h2>
      <div
        id={`rr-panel-${item.id}`}
        className="rr-accordion__panel"
        role="region"
        hidden={!isOpen}
      >
        <div className="rr-accordion__body">
          {item.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReturnRefundPolicy() {
  const [openIndex, setOpenIndex] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", message: "", save: false });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hook up to your API / email service here.
    setSubmitted(true);
  };

  return (
    <div className="rr-page">
      {/* ---------------- Banner ---------------- */}
      <div className="rr-banner">
        <div className="rr-container">
          <div className="rr-banner__entry">
            <h1>Return &amp; Refund Policy</h1>
            <nav aria-label="Breadcrumb" className="rr-breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">◆</span>
              <span>Return &amp; Refund Policy</span>
            </nav>
            <svg
              className="rr-banner__chevron"
              width="35"
              height="35"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9.5 13L18.25 21.75L27 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ---------------- Content ---------------- */}
      <section className="rr-content">
        <div className="rr-container rr-content__grid">
          {/* Left: intro + accordion */}
          <div className="rr-policy">
            <p className="rr-policy__intro">
              Welcome to Chantallow. By accessing or purchasing from our website, you agree to the
              following Terms &amp; Conditions. Please read them carefully before using our
              services.
            </p>

            <div className="rr-accordion">
              {POLICY_ITEMS.map((item, i) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                />
              ))}
            </div>
          </div>

          {/* Right: contact form */}
          <div className="rr-contact">
            <h3 className="rr-contact__title">Ask Differently.</h3>
            <p className="rr-contact__text">
              Your Email Address will Not Be published, required fields are Marked*
            </p>

            {submitted ? (
              <p className="rr-contact__success">
                Thank you — your message has been sent. We&rsquo;ll get back to you soon.
              </p>
            ) : (
              <form className="rr-form" onSubmit={handleSubmit}>
                <div className="rr-form__group">
                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name*"
                    aria-label="Name"
                  />
                </div>
                <div className="rr-form__group">
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address*"
                    aria-label="Email Address"
                  />
                </div>
                <div className="rr-form__group">
                  <textarea
                    required
                    rows={4}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Message*"
                    aria-label="Message"
                  />
                </div>
                <label className="rr-form__check">
                  <input
                    type="checkbox"
                    name="save"
                    checked={form.save}
                    onChange={handleChange}
                  />
                  <span>Save My Name, Email, This Browser for The Next Time i Message.</span>
                </label>
                <button type="submit" className="rr-btn rr-btn--outline">
                  SUBMIT
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}