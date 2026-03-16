import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './Components/Home';
import Service from './Components/Service';
import ViewMenu from './Components/ViewMenu';
import AboutUs from './Components/Aboutus';
import ContectUs from './Components/ContectUs';

import Login from './Components/Login';
import VerifyOTP from './Components/VerifyOTP';
import ResetPassword from './Components/ResetPassword';
import ChangePassword from './Components/ChangePassword';
import Register from './Components/Register';
import UserProfile from './Components/UserProfile';
import LogOut from './Components/LogOut';

import DineinSelectTable from './Components/DineinSelectTable';
import UserOrderMenu from './Components/UserOrderMenu';
import ViewCart from './Components/ViewCart';
import OrderHistory from './Components/OrderHistory';
import DineInBilling from './Components/DineInBilling';

import TakeAwayOrderMenu from './Components/TakeAwayOrderMenu';
import TakeAwayViewCart from './Components/TakeAwayViewCart';
import TakeAwayOrderHistory from './Components/TakeAwayOrderHistory';
import TakeAwayBilling from './Components/TakeAwayBilling';

import Thakyou from './Components/Thakyou';
import Delevery from './Components/Delevery';
import Reservation from './Components/Reservation';

import NotFoundPage from './Components/NotFoundPage';

const AppRoutes = () => {
        return (
                <Routes>

                        {/* HOME */}
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/services" element={<Service />} />
                        <Route path="/aboutus" element={<AboutUs />} />
                        <Route path="/contactus" element={<ContectUs />} />
                        <Route path="/view-menu" element={<ViewMenu />} />

                        {/* AUTH */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/verify/otp" element={<VerifyOTP />} />
                        <Route path="/reset/password" element={<ResetPassword />} />
                        <Route path="/change/password" element={<ChangePassword />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/user/profile/:_id" element={<UserProfile />} />
                        <Route path="/user/logout/:_id" element={<LogOut />} />

                        {/* DINE IN */}
                        <Route path="/dine-in/select-table" element={<DineinSelectTable />} />
                        <Route path="/dine-in/menu/:tableno" element={<UserOrderMenu />} />
                        <Route path="/view-cart/:tableno" element={<ViewCart />} />
                        <Route path="/order/history/:tableno" element={<OrderHistory />} />
                        <Route path="/dine-in/billing/:orderid" element={<DineInBilling />} />

                        {/* TAKE AWAY */}
                        <Route path="/take-away/menu/:randomString" element={<TakeAwayOrderMenu />} />
                        <Route path="/take-away/view-cart/:randomString" element={<TakeAwayViewCart />} />
                        <Route path="/take-away/order/history/:randomString" element={<TakeAwayOrderHistory />} />
                        <Route path="/take-away/billing/:orderid" element={<TakeAwayBilling />} />

                        {/* ORDER */}
                        <Route path="/thank_you/:orderid" element={<Thakyou />} />
                        <Route path="/delevery" element={<Delevery />} />
                        <Route path="/reservation" element={<Reservation />} />

                        {/* 404 */}
                        <Route path="*" element={<NotFoundPage />} />

                </Routes>
        );
};

export default AppRoutes;