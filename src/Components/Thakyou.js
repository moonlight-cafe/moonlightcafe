import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useEffect, useState } from "react";
import "./ThankYouPage.css";
import { useNavigate, useParams } from "react-router-dom";

const Config = SharedConfig;
const Method = SharedMethod;
const API = SharedAPI;
const thankyouimg = Config.thankyouimg;

const ThankYouPage = () => {
    const navigate = useNavigate();
    const { orderid } = useParams();

    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);       // selected rating
    const [hoverRating, setHoverRating] = useState(0); // hover preview
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(true);

    const loginStatus = Method.checkLoginStatus();

    if (loginStatus.status !== 200) {
        navigate('/login')
    }
    const customer = loginStatus.status === 200 ? loginStatus.data : {};

    const verifyOrder = async () => {
        try {
            const payload = {
                _id: orderid,
                verifyrateing: true
            };

            const res = await API.VerifyOrder(payload);

            if (res?.status === 200) {
                setShowRating(true);
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error(error);
            navigate("/", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    // Open rating modal on first load
    useEffect(() => {
        setShowRating(true);
        verifyOrder();
    }, []);

    const submitRating = () => {
        const loginStatus = Method.checkLoginStatus();

        if (loginStatus.status !== 200) {
            console.warn("User not logged in");
            setShowRating(false);
            return;
        }

        const payload = {
            rating,
            review,
            customername: customer.name || "",
            customeremail: customer.email || "",
            customerid: customer._id || null,
            orderid: orderid || null
        };

        API.CustomerRatingAdd(payload);

        console.log("Rating Submitted:", payload);
        setShowRating(false);
    };

    const renderStars = () => {
        const totalStars = 5;
        const displayRating = hoverRating || rating;

        return (
            <div
                className="star-rating interactive"
                onMouseLeave={() => setHoverRating(0)}
            >
                {Array.from({ length: totalStars }).map((_, index) => {
                    const starValue = index + 1;

                    let starClass = "empty";
                    if (displayRating >= starValue) {
                        starClass = "full";
                    } else if (displayRating >= starValue - 0.5) {
                        starClass = "half";
                    }

                    return (
                        <span
                            key={index}
                            className={`material-symbols-outlined ms-icon-fill star ${starClass}`}
                            onMouseMove={(e) => {
                                const { left, width } =
                                    e.currentTarget.getBoundingClientRect();
                                const isHalf = e.clientX - left < width / 2;
                                setHoverRating(isHalf ? starValue - 0.5 : starValue);
                            }}
                            onClick={(e) => {
                                const { left, width } =
                                    e.currentTarget.getBoundingClientRect();
                                const isHalf = e.clientX - left < width / 2;
                                setRating(isHalf ? starValue - 0.5 : starValue);
                            }}
                        >
                            kid_star
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {showRating && (
                <div className="rating-overlay user-not-select">
                    <div className="rating-modal redesigned">
                        <h3 className="rating-title">How was your experience?</h3>
                        {renderStars()}
                        {/* <div className="rating-value">
                            {(hoverRating || rating || 0).toFixed(1)} / 5
                        </div> */}

                        <textarea
                            placeholder="What did you like or dislike?"
                            value={review}
                            className="common-input-text"
                            onChange={(e) => setReview(e.target.value)}
                        />

                        <div className="mt-20">
                            <button
                                className="main-btn plr-40 mr-20"
                                onClick={() => setShowRating(false)}
                            >
                                Skip
                            </button>
                            <button
                                className="main-btn plr-20 ml-20"
                                disabled={!rating}
                                onClick={submitRating}
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* ✅ Thank You Content */}
            <div className="common-box-comtainer user-not-select">
                <div className="thankyou-box">
                    <div className="thankyouiimg">
                        <img
                            src={thankyouimg}
                            alt="Thank You"
                            className="thankyou-image"
                        />
                    </div>

                    <div className="thankyoutext">
                        <h2 className="thankyou-heading main-color fs-40 mtb-10">Thank You!</h2>
                        <hr className="main-color mr-20 ml-20"/>
                        <p className="thankyou-text main-color">
                            Thank you for ordering from{" "}
                            <strong>Moonlight Café</strong>! We truly appreciate
                            your support.
                        </p>
                        <p className="thankyou-text main-color">
                            You can now close this window, or scan the QR code
                            again to place another order.
                        </p>
                        <button
                            className="main-btn mt-20"
                            onClick={() => navigate("/home")}
                        >
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThankYouPage;
