import React from "react";
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
import AddToCart from "../pages/ShopList/AddToCart";
import CheckOut from "../pages/ShopList/CheckOut";
// import Register from "../components/Register";
import PrivacyPolicy from "../pages/Privacy/PrivacyPolicy";
import TermsConditionsPage from "../pages/Terms&Conditions/Terms&Conditions";
import ReturnRefundPolicy from "../pages/ReturnandRefundPolicy/Return&RefundPolicy";
import FurkindPetTallow from "../pages/Home/FurkindPetTallow";

import AdminLogin from "../admin/AdminLogin";
import AdminLayout from "../admin/AdminLayout";
import AdminProducts from "../admin/AdminProducts";
import AdminProductForm from "../admin/AdminProductForm";
import AdminProductDetail from "../admin/AdminProductDetail";
import AdminUsers from "../admin/AdminUsers";

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

        <Route path="/blog" element={<BlogCategory />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
        <Route path="/furkind-pet-tallow" element={<FurkindPetTallow />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
        <Route path="/contactus" element={<ContactUs />} />

        {/* Auth — one login page for both roles; admins are sent on to /admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUpSection />} />
        {/* Headers across the site link to /registration */}
        <Route path="/registration" element={<Navigate to="/login" replace />} />
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Admin panel — admin role only (AdminLayout checks the role) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm mode="create" />} />
          <Route path="products/:id" element={<AdminProductDetail />} />
          <Route path="products/:id/edit" element={<AdminProductForm mode="edit" />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;