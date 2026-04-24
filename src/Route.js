import React, { lazy, useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Method } from "./config/Init.js";

const Home = lazy(() => import("./Components/Home"));
const Service = lazy(() => import("./Components/Service"));
const ViewMenu = lazy(() => import("./Components/ViewMenu"));
const AboutUs = lazy(() => import("./Components/Aboutus"));
const ContectUs = lazy(() => import("./Components/ContectUs"));
const Login = lazy(() => import("./Components/Login"));
const VerifyOTP = lazy(() => import("./Components/VerifyOTP"));
const ResetPassword = lazy(() => import("./Components/ResetPassword"));
const Register = lazy(() => import("./Components/Register"));
const UserProfile = lazy(() => import("./Components/UserProfile"));
const LogOut = lazy(() => import("./Components/LogOut"));
const DineinSelectTable = lazy(() => import("./Components/DineinSelectTable"));
const UserOrderMenu = lazy(() => import("./Components/UserOrderMenu"));
const ViewCart = lazy(() => import("./Components/ViewCart"));
const OrderHistory = lazy(() => import("./Components/OrderHistory"));
const DineInBilling = lazy(() => import("./Components/DineInBilling"));
const TakeAwayOrderMenu = lazy(() => import("./Components/TakeAwayOrderMenu"));
const TakeAwayViewCart = lazy(() => import("./Components/TakeAwayViewCart"));
const TakeAwayOrderHistory = lazy(() => import("./Components/TakeAwayOrderHistory"));
const TakeAwayBilling = lazy(() => import("./Components/TakeAwayBilling"));
const Thakyou = lazy(() => import("./Components/Thakyou"));
const OrderDetails = lazy(() => import("./Components/OrderDetails"));
const Delevery = lazy(() => import("./Components/Delevery"));
const Reservation = lazy(() => import("./Components/Reservation"));
const NotFoundPage = lazy(() => import("./Components/NotFoundPage"));

const buildRequestedPath = (location) =>
        `${location.pathname || "/"}${location.search || ""}${location.hash || ""}`;

function LoginRedirect() {
        const location = useLocation();

        useEffect(() => {
                Method.rememberRedirectAfterLogin(buildRequestedPath(location));
        }, [location]);

        return <Navigate to="/login" replace />;
}

function GuestOnlyRoute() {
        const isLoggedIn = Method.checkLoginStatus().status === 200;
        return isLoggedIn ? <Navigate to={Method.getRedirectAfterLogin("/home")} replace /> : <Outlet />;
}

function CustomerProtectedRoute() {
        const isLoggedIn = Method.checkLoginStatus().status === 200;
        return isLoggedIn ? <Outlet /> : <LoginRedirect />;
}

function TableProtectedRoute() {
        const isLoggedIn = Method.checkLoginStatus().status === 200;
        if (!isLoggedIn) return <LoginRedirect />;

        const hasSelectedTable = Method.checkSelectedTable().status === 200;
        return hasSelectedTable ? <Outlet /> : <Navigate to="/dine-in/select-table" replace />;
}

const AppRoutes = () => {
        return (
                <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/services" element={<Service />} />
                        <Route path="/aboutus" element={<AboutUs />} />
                        <Route path="/contactus" element={<ContectUs />} />
                        <Route path="/view-menu" element={<ViewMenu />} />
                        <Route path="/verify/otp" element={<VerifyOTP />} />
                        <Route path="/reset/password" element={<ResetPassword />} />
                        <Route path="/delevery" element={<Delevery />} />
                        <Route path="/reservation" element={<Reservation />} />

                        <Route element={<GuestOnlyRoute />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                        </Route>

                        <Route element={<CustomerProtectedRoute />}>
                                <Route path="/user/profile/:_id" element={<UserProfile />} />
                                <Route path="/user/logout/:_id" element={<LogOut />} />
                                <Route path="/dine-in/select-table" element={<DineinSelectTable />} />
                                <Route path="/take-away/menu/:randomString" element={<TakeAwayOrderMenu />} />
                                <Route path="/take-away/view-cart/:randomString" element={<TakeAwayViewCart />} />
                                <Route path="/take-away/order/summery/:randomString" element={<TakeAwayOrderHistory />} />
                                <Route path="/take-away/order/history/:randomString" element={<TakeAwayOrderHistory />} />
                                <Route path="/take-away/billing/:orderid" element={<TakeAwayBilling />} />
                                <Route path="/dine-in/billing/:orderid" element={<DineInBilling />} />
                                <Route path="/orderdetails/:orderid" element={<OrderDetails />} />
                                <Route path="/thank_you/:orderid" element={<Thakyou />} />
                        </Route>

                        <Route element={<TableProtectedRoute />}>
                                <Route path="/dine-in/menu/:tableno" element={<UserOrderMenu />} />
                                <Route path="/view-cart/:tableno" element={<ViewCart />} />
                                <Route path="/order/summery/:tableno" element={<OrderHistory />} />
                                <Route path="/order/history/:tableno" element={<OrderHistory />} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                </Routes>
        );
};

export default AppRoutes;
