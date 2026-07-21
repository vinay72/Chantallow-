import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";


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
// import Register from "../components/Register";
import PrivacyPolicy from "../pages/Privacy/PrivacyPolicy";
import TermsConditionsPage from "../pages/Terms&Conditions/Terms&Conditions";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/aboutus" element={<AboutUs />} />
         <Route path="/shop" element={<ShopCart />} />
         <Route path="/shop-list" element={<ShopSection />} />
         <Route path="/shop-list/1" element={<ProductDetail />} />
         <Route path="/shop-list/addtocart" element={<AddToCart  />} />
         <Route path="/blog" element={<BlogCategory />} />
         <Route path="/privacy-policy" element={<PrivacyPolicy />} />
         <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
         <Route path="/contactus" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUpSection />} />
         {/* <Route path="/register" element={<Register />} />    */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;