import React from "react";
import "./ThankYouPage.css"; // Create a separate CSS file for styling

const ThankYouPage = () => {
    return (
        <div className="thank-you-container">
            <header className="site-header">
                <h1 className="site-header__title">THANK YOU!</h1>
            </header>

            <div className="main-content">
            <i className="fa-solid fa-check fa-fade large-icon"></i>
                <p className="main-content__body">
                    Thanks for ordering food from our Cafe. It means a lot to us, just like you do! We really appreciate you giving us a moment of your time today at our cafe.
                </p>
                <p>You can close this window.</p>
                <p>Scan the QR code again to order.</p>
            </div>

            <footer className="site-footer">
                <p className="site-footer__fineprint"><i className="fa-regular fa-copyright"></i> Copyright ©2014 | All Rights Reserved</p>
            </footer>

            <script>
                {localStorage.clear()}
            </script>
        </div>
    );
};

export default ThankYouPage;
