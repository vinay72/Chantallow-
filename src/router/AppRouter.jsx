import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AboutUs from "../pages/AboutUs/AboutUs";
import Home from "../pages/Home/Home";
import ShopCart from "../pages/Home/ShopCart";
import ShopSection from "../pages/ShopList/ShopList";
import BlogCategory from "../pages/BlogCategory/BlogCategory";
import ContactUs from "../pages/ContactUs/ContactUs";
import Login from "../pages/Login/Login";
import SignUpSection from "../pages/SignUp/SignUp";
import ProductDetail from "../pages/ShopList/ProductDetail";
import ComboDetail from "../pages/Combo/ComboDetail";
import Faq from "../pages/Faq/Faq";
import BlogPost from "../pages/BlogPost/BlogPost";
import AddToCart from "../pages/ShopList/AddToCart";
import CheckOut from "../pages/ShopList/CheckOut";
// import Register from "../components/Register";
import PrivacyPolicy from "../pages/Privacy/PrivacyPolicy";
import TermsConditionsPage from "../pages/Terms&Conditions/Terms&Conditions";
import ReturnRefundPolicy from "../pages/ReturnandRefundPolicy/Return&RefundPolicy";
import FurkindPetTallow from "../pages/Home/FurkindPetTallow";
import ProtectedRoute from "../components/ProtectedRoute";

// My Account (User Panel)
import AccountOrders from "../pages/Account/AccountOrders";
import AccountOrderDetails from "../pages/Account/AccountOrderDetails";
import AccountDownloads from "../pages/Account/AccountDownloads";
import AccountReturnRequest from "../pages/Account/AccountReturnRequest";
import AccountProfile from "../pages/Account/AccountProfile";
import AccountAddress from "../pages/Account/AccountAddress";
import AccountPaymentMethods from "../pages/Account/AccountPaymentMethods";
import AccountReview from "../pages/Account/AccountReview";

import AdminLogin from "../admin/AdminLogin";
import AdminLayout from "../admin/AdminLayout";
import AdminProducts from "../admin/AdminProducts";
import AdminProductForm from "../admin/AdminProductForm";
import AdminProductDetail from "../admin/AdminProductDetail";
import AdminUsers from "../admin/AdminUsers";
import AdminUserDetail from "../admin/AdminUserDetail";
import AdminBlog from "../admin/AdminBlog";
import AdminOrders from "../admin/AdminOrders";
import AdminOrderDetail from "../admin/AdminOrderDetail";
import AdminReturns from "../admin/AdminReturns";
import AdminHome from "../admin/AdminHome";
import AdminCombos from "../admin/AdminCombos";
import AdminComboForm from "../admin/AdminComboForm";
import AdminComboDetail from "../admin/AdminComboDetail";

// Loaded on demand so shoppers never download the charting library.
const AdminDashboard = lazy(() => import("../admin/AdminDashboard"));
// FAQs bring in the rich text editor + Word import, so they load on demand too.
const AdminFaqs = lazy(() => import("../admin/AdminFaqs"));
const AdminBlogForm = lazy(() => import("../admin/AdminBlogForm"));
const loadingEditor = <div className="empty-state">Loading editor…</div>;

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/shopcart" element={<ShopCart />} />
        <Route path="/shop-list" element={<ShopSection />} />

        {/* Cart & wishlist (same page, two tabs) */}
        <Route path="/shop-list/addtocart" element={<AddToCart />} />
        <Route path="/cart" element={<AddToCart />} />
        <Route path="/wishlist" element={<AddToCart />} />

        {/* Check out */}
        <Route path="/checkout" element={<CheckOut />} />

        {/* Dynamic product detail — e.g. /product/malachite-fusion */}
        <Route path="/product/:slug" element={<ProductDetail />} />
        {/* Old style also works — e.g. /shop-list/1 or /shop-list/malachite-fusion */}
        <Route path="/shop-list/:slug" element={<ProductDetail />} />

        {/* Combo products from Admin → Home → Combo Products */}
        <Route path="/combo/:id" element={<ComboDetail />} />

        {/* My Account (User Panel) — role "user" only; admins are sent to /admin */}
        <Route path="/account" element={<Navigate to="/account/orders" replace />} />
        <Route path="/my-account" element={<Navigate to="/account/orders" replace />} />
        <Route path="/account/orders" element={<ProtectedRoute role="user"><AccountOrders /></ProtectedRoute>} />
        <Route path="/account/orders/:orderId" element={<ProtectedRoute role="user"><AccountOrderDetails /></ProtectedRoute>} />
        <Route path="/account/downloads" element={<ProtectedRoute role="user"><AccountDownloads /></ProtectedRoute>} />
        <Route path="/account/return-request" element={<ProtectedRoute role="user"><AccountReturnRequest /></ProtectedRoute>} />
        <Route path="/account/profile" element={<ProtectedRoute role="user"><AccountProfile /></ProtectedRoute>} />
        <Route path="/account/address" element={<ProtectedRoute role="user"><AccountAddress /></ProtectedRoute>} />
        <Route path="/account/payment-methods" element={<ProtectedRoute role="user"><AccountPaymentMethods /></ProtectedRoute>} />
        <Route path="/account/review" element={<ProtectedRoute role="user"><AccountReview /></ProtectedRoute>} />

        <Route path="/blog" element={<BlogCategory />} />
        {/* posts from Admin → Blog */}
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
        <Route path="/furkind-pet-tallow" element={<FurkindPetTallow />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
        <Route path="/contactus" element={<ContactUs />} />

        {/* FAQs from Admin → Home → FAQs */}
        <Route path="/faq" element={<Faq />} />
        <Route path="/faqs" element={<Navigate to="/faq" replace />} />

        {/* Auth — one login page for both roles; admins are sent on to /admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUpSection />} />
        {/* Headers across the site link to /registration */}
        <Route path="/registration" element={<Navigate to="/login" replace />} />
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Admin panel — admin role only (AdminLayout checks the role) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<div className="empty-state">Loading dashboard…</div>}><AdminDashboard /></Suspense>} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm mode="create" />} />
          <Route path="products/:id" element={<AdminProductDetail />} />
          <Route path="products/:id/edit" element={<AdminProductForm mode="edit" />} />
          {/* Home sub-menu: new launches, combo products, FAQs */}
          <Route path="home" element={<Navigate to="launches" replace />} />
          {/* key: switching between the two remounts the page with fresh state */}
          <Route path="home/launches" element={<AdminHome key="new_launches" section="new_launches" />} />
          <Route path="home/best-sellers" element={<AdminHome key="best_sellers" section="best_sellers" />} />
          <Route path="home/featured" element={<AdminHome key="featured" section="featured" />} />
          <Route path="home/tattoo" element={<AdminHome key="tattoo" section="tattoo" />} />
          <Route path="home/combos" element={<AdminCombos />} />
          <Route path="home/combos/new" element={<AdminComboForm mode="create" />} />
          <Route path="home/combos/:id" element={<AdminComboDetail />} />
          <Route path="home/combos/:id/edit" element={<AdminComboForm mode="edit" />} />
          <Route path="home/faqs" element={<Suspense fallback={<div className="empty-state">Loading FAQs…</div>}><AdminFaqs /></Suspense>} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderId" element={<AdminOrderDetail />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/new" element={<Suspense fallback={loadingEditor}><AdminBlogForm key="new" mode="create" /></Suspense>} />
          <Route path="blog/:id/edit" element={<Suspense fallback={loadingEditor}><AdminBlogForm mode="edit" /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;