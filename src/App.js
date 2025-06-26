import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import BackgroundManager from './Components/BackgroundManager.js';
import Home from './Components/Home.js';
import Dinein from './Components/Dinein.js';
import Service from './Components/Service.js';
import ViewMenu from './Components/ViewMenu.js';
import Login from './Components/Login.js';
import VerifyOTP from './Components/VerifyOTP.js';
import ResetPassword from './Components/ResetPassword.js';
import ForgetPassword from './Components/ForgetPassword.js';
import Register from './Components/Register.js';
import UserOrderMenu from './Components/UserOrderMenu.js';
import ContectUs from "./Components/ContectUs.js";
import ViewCart from './Components/ViewCart.js';
import OrderHistory from './Components/OrderHistory.js';
import TakeAwayViewCart from './Components/TakeAwayViewCart.js';
// import UserOrderMenuTakeAway from './Components/UserOrderMenuTakeAway.js';
import Payment from './Components/Payment.js';
import Thakyou from './Components/Thakyou.js';
import AboutUs from './Components/Aboutus.js';
import Delevery from './Components/Delevery.js';
import UserProfile from './Components/UserProfile.js';
import LogOut from './Components/LogOut.js';
import NotFoundPage from './Components/NotFoundPage.js';

function App() {
  return (
    <Router>
      <BackgroundManager />
      <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Service />} />
        <Route path='/aboutus' element={<AboutUs />} />
        <Route path='/contact_us' element={<ContectUs />} />
        <Route path="/view-menu" element={<ViewMenu />} />
        {/* HOME PAGE */}

        {/* USER LOGIN PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/verify/otp" element={<VerifyOTP />} />
        <Route path="/reset/password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user/profile/:_id" element={<UserProfile />} />
        <Route path="/user/logout/:_id" element={<LogOut />} />
        {/* USER LOGIN PAGES */}

        {/* Dine In Flow */}
        <Route path="/dine-in/select-table" element={<Dinein />} />
        <Route path="/dine-in/menu/:tableNo" element={<UserOrderMenu />} />
        <Route path="/view-cart/:tableNo" element={<ViewCart />} />
        <Route path="/order/history/:tableNo" element={<OrderHistory />} />
        {/* Dine In Flow */}

        {/* Take Away Flow */}
        {/* <Route path='/take-away/menu/:randomString' element={<UserOrderMenuTakeAway />} /> */}
        <Route path='/take-away/menu/:randomString' element={<Delevery />} />
        <Route path="/take-away/view-cart/:billno" element={<TakeAwayViewCart />} />
        {/* Take Away Flow */}

        {/* Complete Order Pages */}
        <Route path="/payment_page" element={<Payment />} />
        <Route path='/thank_you' element={<Thakyou />} />
        <Route path='/delevery' element={<Delevery />} />
        {/* Complete Order Pages */}

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
}

export default App;