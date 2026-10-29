import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AddToCart.css";
import cartBanner from "../../assets/background/bg1.jpg";
import SiteFooter from "../../components/SiteFooter";
import { useShop } from "../../context/ShopContext";
import { formatPrice } from "../../data/products";
import Header from "../../components/Header";

/**
 * Cart + Favourites page (dynamic)
 *   /cart      -> cart tab
 *   /wishlist  -> favourites tab
 * Both read from the shared ShopContext.
 */

// ---- Icons ----
const Sparkle = () => (
  <svg className="sc-sparkle" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M6 0c.35 3.05 2.95 5.65 6 6-3.05.35-5.65 2.95-6 6-.35-3.05-2.95-5.65-6-6 3.05-.35 5.65-2.95 6-6Z" fill="currentColor" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M9.43 10.25 9.93 15.25M14.57 10.25 14.07 15.25M4.5 6h15M10 3h4a1.5 1.5 0 0 1 1.5 1.5V6h-7V4.5A1.5 1.5 0 0 1 10 3ZM5.5 6l.9 12.02A2.5 2.5 0 0 0 8.89 20.5h6.22a2.5 2.5 0 0 0 2.49-2.48L18.5 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShippingIcon = () => (
  <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M35.1582 7.73438C36.3226 7.73438 37.2676 8.67937 37.2676 9.84375C37.2676 10.2319 37.5826 10.5469 37.9707 10.5469C38.3588 10.5469 38.6738 10.2319 38.6738 9.84375C38.6738 7.90313 37.0988 6.32812 35.1582 6.32812C34.7701 6.32812 34.4551 6.64312 34.4551 7.03125C34.4551 7.41937 34.7701 7.73438 35.1582 7.73438Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M27.3004 35.8594H26.721C25.5559 35.8594 24.6116 36.8037 24.6116 37.9688V40.7813C24.6116 41.9464 25.5559 42.8907 26.721 42.8907H29.5335C30.0735 42.8907 30.5664 42.6875 30.9398 42.3535C31.3131 42.6875 31.806 42.8907 32.346 42.8907H40.7835C41.9486 42.8907 42.8929 41.9464 42.8929 40.7813V32.3438C42.8929 31.1787 41.9486 30.2344 40.7835 30.2344H32.346C31.1809 30.2344 30.2366 31.1787 30.2366 32.3438V35.9797C30.0166 35.9016 29.7803 35.8594 29.5335 35.8594H28.8972L24.3002 27.3214L33.0491 18.5724V28.1251C33.0491 28.5132 33.3641 28.8282 33.7523 28.8282C34.1404 28.8282 34.4554 28.5132 34.4554 28.1251V27.5928L37.353 24.6945C38.1763 23.8719 38.1763 22.5345 37.353 21.7119C36.5577 20.9159 35.283 20.8892 34.4554 21.631V17.1662L40.0762 11.5454C40.96 10.6615 41.5619 9.53654 41.8073 8.3117C42.0041 7.32522 42.2559 6.06803 42.4654 5.01897C42.6039 4.32709 42.3873 3.61201 41.8888 3.1135C41.3903 2.61498 40.6752 2.39842 39.9834 2.53694C38.9343 2.74647 37.6771 2.99818 36.6906 3.19506C35.4658 3.44045 34.3408 4.04232 33.4569 4.92615L27.8362 10.5469H23.0198C23.7616 9.71936 23.7348 8.44459 22.9389 7.64935C22.1162 6.82599 20.7789 6.82599 19.9562 7.64935L17.058 10.5469H14.9338C15.6756 9.71936 15.6489 8.44459 14.853 7.64935C14.0303 6.82599 12.693 6.82599 11.8703 7.64935L8.97202 10.5469H4.22101C3.25492 10.5469 2.41187 11.2037 2.17562 12.1409C1.93937 13.0775 2.37039 14.0555 3.22117 14.5133L16.6424 21.7407L10.9612 27.4219H4.22101C3.2732 27.4219 2.44141 28.0547 2.18828 28.9681C1.93516 29.8822 2.32257 30.8525 3.13538 31.3397L6.11452 33.1271C5.30241 34.4665 4.64007 35.896 4.14155 37.3908L3.89827 38.1214L3.3618 38.6579C2.84782 39.1719 2.50539 39.8328 2.38235 40.5493C2.26492 41.2341 2.12148 42.0687 2.12148 42.0687C2.08281 42.2937 2.15593 42.5237 2.31765 42.6847C2.47867 42.8464 2.70859 42.9195 2.93359 42.8808L4.45303 42.62C5.16952 42.4969 5.83046 42.1545 6.34444 41.6405L6.88093 41.1047L7.61218 40.8608C9.10702 40.3622 10.5365 39.6999 11.8752 38.8885L13.6626 41.8669C14.1498 42.6797 15.1201 43.0672 16.0342 42.814C16.9476 42.5609 17.5804 41.7291 17.5804 40.7813V34.0412L23.2616 28.3599L27.3004 35.8594ZM38.6741 31.6407V32.9063C38.6741 33.3169 38.511 33.71 38.2213 34.0004C37.9309 34.2901 37.5372 34.4532 37.1273 34.4532H36.0023C35.5924 34.4532 35.1986 34.2901 34.9082 34.0004C34.6185 33.71 34.4554 33.3169 34.4554 32.9063V31.6407H32.346C31.9579 31.6407 31.6429 31.9557 31.6429 32.3438V40.7813C31.6429 41.1694 31.9579 41.4844 32.346 41.4844H40.7835C41.1716 41.4844 41.4866 41.1694 41.4866 40.7813V32.3438C41.4866 31.9557 41.1716 31.6407 40.7835 31.6407H38.6741ZM26.721 37.2657H29.5335C29.9216 37.2657 30.2366 37.5807 30.2366 37.9688V40.7813C30.2366 41.1694 29.9216 41.4844 29.5335 41.4844H26.721C26.3329 41.4844 26.0179 41.1694 26.0179 40.7813V37.9688C26.0179 37.5807 26.3329 37.2657 26.721 37.2657ZM16.1741 35.4474L15.8556 35.7659C14.9894 36.6322 14.0514 37.419 13.0537 38.1193L14.8684 41.1434C15.0309 41.4141 15.3543 41.5435 15.6587 41.4591C15.9632 41.3747 16.1741 41.097 16.1741 40.7813V35.4474ZM4.21539 41.2341L3.67609 41.3262L3.76819 40.7869C3.84202 40.3566 4.04733 39.9608 4.356 39.6521L9.3489 34.6592C9.62312 34.385 10.0689 34.385 10.3431 34.6592C10.6173 34.9334 10.6173 35.3792 10.3431 35.6534L5.35022 40.6463C5.04155 40.955 4.6457 41.1603 4.21539 41.2341ZM9.32077 38.6649C11.3732 37.6995 13.2491 36.3833 14.8614 34.771L39.0819 10.5512C39.7689 9.86349 40.2372 8.98881 40.4277 8.03608L41.0866 4.74334C41.133 4.51272 41.0605 4.27436 40.8946 4.10772C40.728 3.94178 40.4896 3.86936 40.259 3.91576L36.9663 4.57459C36.0135 4.76514 35.1388 5.23342 34.4512 5.92037L22.5873 17.7842C22.3131 18.0584 21.8673 18.0584 21.5931 17.7842C21.3189 17.51 21.3189 17.0642 21.5931 16.79L26.4299 11.9532H4.22101C3.89898 11.9532 3.61773 12.1719 3.53898 12.4847C3.46023 12.7969 3.60437 13.1225 3.88773 13.2751L17.6809 20.7022L19.6047 18.7784C19.8789 18.5042 20.3247 18.5042 20.5989 18.7784C20.8731 19.0526 20.8731 19.4984 20.5989 19.7726L10.2313 30.1402C8.61906 31.7525 7.3035 33.6284 6.33811 35.6815L8.35468 33.665C9.17734 32.8416 10.5147 32.8416 11.3373 33.665C12.1607 34.4876 12.1607 35.825 11.3373 36.6476L9.32077 38.6649ZM37.2679 31.6407V32.9063C37.2679 32.9436 37.2531 32.9794 37.2264 33.0062C37.2004 33.0322 37.1645 33.0469 37.1273 33.0469H36.0023C35.965 33.0469 35.9291 33.0322 35.9031 33.0062C35.8764 32.9794 35.8616 32.9436 35.8616 32.9063V31.6407H37.2679ZM9.55492 28.8282H4.22101C3.90531 28.8282 3.62758 29.0391 3.54321 29.3436C3.45883 29.648 3.58819 29.9715 3.85889 30.1339L6.88374 31.9487C7.58264 30.9516 8.37015 30.013 9.23711 29.146L9.55492 28.8282ZM34.4554 25.6037V23.6152L35.3645 22.7061C35.6387 22.4319 36.0845 22.4319 36.3587 22.7061C36.633 22.9803 36.633 23.4261 36.3587 23.7003L34.4554 25.6037ZM12.9496 10.5469H10.9612L12.8645 8.64357C13.1387 8.36936 13.5845 8.36936 13.8587 8.64357C14.133 8.91779 14.133 9.36358 13.8587 9.63779L12.9496 10.5469ZM21.0355 10.5469H19.0471L20.9505 8.64357C21.2247 8.36936 21.6705 8.36936 21.9447 8.64357C22.2189 8.91779 22.2189 9.36358 21.9447 9.63779L21.0355 10.5469Z" fill="currentColor" />
  </svg>
);

const EnjoyProductIcon = () => (
  <svg width="34" height="34" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 4.5 39 13.5v18L22.5 40.5 6 31.5v-18L22.5 4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6 13.5 22.5 22.5 39 13.5M22.5 22.5V40.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="30" cy="30" r="6.5" fill="var(--sc-bg, #eaf3ec)" stroke="currentColor" strokeWidth="1.4" />
    <path d="m27.3 30 1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="m8.5 12.5 2.3 2.3L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const tabLinkStyle = () => ({
  color: "inherit",
  textDecoration: "none",
});

export default function AddToCart() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = location.pathname.startsWith("/wishlist") ? "wishlist" : "cart";

  const {
    cartItems,
    wishlistItems,
    subtotal,
    updateQty,
    removeFromCart,
    removeFromWishlist,
    moveToCart,
    showToast,
  } = useShop();

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const applyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    setCouponMessage(`"${couponCode}" applied.`);
  };

  const savings = cartItems.length ? subtotal * 0.08 : 0;
  const total = subtotal - savings;

  return (
    <div className="sc-page ac-page">
      <Header />

      {/* Banner — the breadcrumb doubles as Cart / Wish List tabs */}
      <div className="sc-banner" style={{ "--sc-banner-img": `url(${cartBanner})` }}>
        <div className="sc-banner__inner">
          <h1>{tab === "cart" ? "Cart" : "Wish List"}</h1>
          <nav className="sc-breadcrumb" aria-label="Cart and wish list">
            <Link to="/cart" style={tabLinkStyle(tab === "cart")} aria-current={tab === "cart" ? "page" : undefined}>
              Cart
            </Link>
            <span className="sc-breadcrumb__sep">
              <Sparkle />
            </span>
            <Link to="/wishlist" style={tabLinkStyle(tab === "wishlist")} aria-current={tab === "wishlist" ? "page" : undefined}>
              Wish List
            </Link>
          </nav>
        </div>
      </div>

      <section className="sc-content">
        <div className="sc-content__grid">
          <div className="sc-cart-col">
            {tab === "cart" ? (
              <>
                <div className="sc-table-wrap">
                  <table className="sc-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th aria-label="Remove" />
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((line) => {
                        const { product } = line;
                        return (
                          <tr key={line.key}>
                            <td className="sc-td-img">
                              <Link to={`/product/${product.slug}`}>
                                <img src={product.cardImage || product.gallery[0]} alt={product.displayName || product.name} />
                              </Link>
                            </td>
                            <td className="sc-td-name">
                              <Link to={`/product/${product.slug}`} className="sc-item-title" style={{ color: "inherit", textDecoration: "none" }}>
                                {product.displayName || product.name}
                              </Link>
                              <ul className="sc-item-attrs">
                                <li>Size: {line.size}</li>
                                {product.attributes.map((attr) => (
                                  <li key={attr}>{attr}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="sc-td-price">{formatPrice(product.price)}</td>
                            <td className="sc-td-qty">
                              <div className="sc-quantity">
                                <button type="button" onClick={() => updateQty(line.key, -1)} aria-label={`Decrease quantity of ${product.name}`}>
                                  &minus;
                                </button>
                                <input type="text" value={line.qty} readOnly aria-label={`Quantity of ${product.name}`} />
                                <button type="button" onClick={() => updateQty(line.key, 1)} aria-label={`Increase quantity of ${product.name}`}>
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="sc-td-subtotal">{formatPrice(product.price * line.qty)}</td>
                            <td className="sc-td-remove">
                              <button
                                type="button"
                                className="sc-remove-btn"
                                onClick={() => removeFromCart(line.key)}
                                aria-label={`Remove ${product.name} from cart`}
                              >
                                <TrashIcon />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {cartItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="sc-empty-row">
                            Your cart is empty. <Link to="/">Continue shopping</Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="sc-cart-actions">
                  <form className="sc-coupon" onSubmit={applyCoupon}>
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="submit">Apply Coupon</button>
                  </form>
                  <button
                    type="button"
                    className="sc-update-cart-btn"
                    onClick={() => showToast && showToast("Cart updated")}
                  >
                    Update Cart
                  </button>
                  {couponMessage && <p className="sc-coupon-msg">{couponMessage}</p>}
                </div>
              </>
            ) : (
              <div className="sc-table-wrap">
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Action</th>
                      <th aria-label="Remove" />
                    </tr>
                  </thead>
                  <tbody>
                    {wishlistItems.map((product) => (
                      <tr key={product.id}>
                        <td className="sc-td-img">
                          <Link to={`/product/${product.slug}`}>
                            <img src={product.cardImage || product.gallery[0]} alt={product.displayName || product.name} />
                          </Link>
                        </td>
                        <td className="sc-td-name">
                          <Link to={`/product/${product.slug}`} className="sc-item-title" style={{ color: "inherit", textDecoration: "none" }}>
                            {product.displayName || product.name}
                          </Link>
                          <ul className="sc-item-attrs">
                            <li>{product.subtitle}</li>
                          </ul>
                        </td>
                        <td className="sc-td-price">{formatPrice(product.price)}</td>
                        <td>
                          <button type="button" className="sc-update-cart-btn" onClick={() => moveToCart(product.id)}>
                            Move To Cart
                          </button>
                        </td>
                        <td className="sc-td-remove">
                          <button
                            type="button"
                            className="sc-remove-btn"
                            onClick={() => removeFromWishlist(product.id)}
                            aria-label={`Remove ${product.name} from wish list`}
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {wishlistItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="sc-empty-row">
                          Your wish list is empty. Tap the heart on any product to save it here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="sc-summary-col">
            <h4 className="sc-summary-title">Cart Total</h4>
            <div className="sc-summary-card">
              <button type="button" className="sc-bank-offer">Bank Offer 0% Cashback</button>

              <div className="sc-perk">
                <div className="sc-perk__icon"><ShippingIcon /></div>
                <div>
                  <span className="sc-perk__eyebrow">Free</span>
                  <h6 className="sc-perk__title">Shipping</h6>
                </div>
              </div>

              <div className="sc-perk">
                <div className="sc-perk__icon"><EnjoyProductIcon /></div>
                <div>
                  <h6 className="sc-perk__title">Enjoy The Product</h6>
                  <p className="sc-perk__desc">Lorem Ipsum is simply dummy text of the printing and typesetting.</p>
                </div>
              </div>

              <p className="sc-save-line">
                <CheckIcon />
                <span>You will save {formatPrice(savings)} on this order</span>
              </p>

              <div className="sc-total-row">
                <span>Total Amount</span>
                <span className="sc-total-amount">{formatPrice(total)}</span>
              </div>

              <button
                type="button"
                className="sc-place-order-btn"
                disabled={cartItems.length === 0}
                onClick={() => navigate("/checkout")}
              >
                Place Order
              </button>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}