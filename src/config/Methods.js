import "../Methods.css";
import AOS from "aos";
import "aos/dist/aos.css";
import ConfigClass from "./Config.js";

const Config = new ConfigClass();
const cafeurl = Config.moonlightcafelogo;

class Methods {
        initAOS() {
                AOS.init({
                        duration: 1000,
                        offset: 100,
                        once: true,
                        easing: "ease-in-out",
                });
        }

        refreshAOS() {
                AOS.refresh();
        }

        generateRandomString(length) {
                const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`";
                let result = "";
                const charactersLength = characters.length;

                for (let index = 0; index < length; index += 1) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                return result;
        }

        generateRandomNumber(length) {
                const characters = "0123456789`";
                let result = "";
                const charactersLength = characters.length;

                for (let index = 0; index < length; index += 1) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                return result;
        }

        formatDateTime = (date) => {
                const day = String(date.getDate()).padStart(2, "0");
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                let hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, "0");
                const seconds = String(date.getSeconds()).padStart(2, "0");
                const ampm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12 || 12;
                return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
        }

        getInitials(name) {
                if (!name) return "";
                const parts = name.trim().split(" ");
                if (parts.length === 1) {
                        return parts[0][0].toUpperCase();
                } else {
                        return (parts[0][0] + parts[1][0]).toUpperCase();
                }
        }

        generateuuid() {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
                        const random = (Math.random() * 16) | 0;
                        const value = char === "x" ? random : (random & 0x3) | 0x8;
                        return value.toString(16);
                });
        }

        secureHash(mainKey, unqkey, unqid, id) {
                const combined = mainKey + unqkey + unqid;
                let hash = id;

                for (let index = 0; index < combined.length; index += 1) {
                        hash = ((hash << 5) + hash) + combined.charCodeAt(index);
                }

                return (hash >>> 0).toString(16) + unqkey.slice(0, 10);
        }

        setCookie(name, value, durationInMinutes = 120) {
                const expires = new Date();
                expires.setTime(expires.getTime() + durationInMinutes * 60 * 1000);
                document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;
        }

        getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);

                if (parts.length === 2) {
                        try {
                                const cookieValue = decodeURIComponent(parts.pop().split(";").shift());

                                try {
                                        return JSON.parse(cookieValue);
                                } catch {
                                        return cookieValue;
                                }
                        } catch (error) {
                                console.error("Cookie parsing failed", error);
                                return null;
                        }
                }

                return null;
        }

        deleteCookie(name) {
                try {
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                } catch (error) {
                        console.error("Error deleting cookie:", error);
                }
        }

        normalizePath(pathname = "") {
                const normalizedPath = String(pathname || "").trim();
                if (!normalizedPath) return "/";

                const withLeadingSlash = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
                return withLeadingSlash.split(/[?#]/)[0] || "/";
        }

        isGuestOnlyPath(pathname = "") {
                const guestOnlyPaths = new Set([
                        "/login",
                        "/register",
                        "/verify/otp",
                        "/reset/password",
                ]);

                return guestOnlyPaths.has(this.normalizePath(pathname));
        }

        rememberRedirectAfterLogin(pathname = "") {
                const redirectPath = String(pathname || "").trim();
                if (!redirectPath || this.isGuestOnlyPath(redirectPath)) return;

                try {
                        localStorage.setItem("redirectAfterLogin", redirectPath);
                } catch (error) {
                        console.error("Unable to store redirect path", error);
                }
        }

        getRedirectAfterLogin(defaultPath = "/home") {
                try {
                        const redirectPath = localStorage.getItem("redirectAfterLogin");
                        if (!redirectPath || this.isGuestOnlyPath(redirectPath)) {
                                return defaultPath;
                        }

                        return redirectPath;
                } catch (error) {
                        console.error("Unable to read redirect path", error);
                        return defaultPath;
                }
        }

        clearRedirectAfterLogin() {
                try {
                        localStorage.removeItem("redirectAfterLogin");
                } catch (error) {
                        console.error("Unable to clear redirect path", error);
                }
        }

        getServiceType(type = 1) {
                if (type === 1) {
                        return "Dine in";
                }

                if (type === 2) {
                        return "Take Away";
                }

                if (type === 3) {
                        return "Reservation";
                }

                return "Invalid Service";
        }

        checkLoginStatus() {
                const userData = this.getCookie("customerdata");
                if (!userData || !userData.email) {
                        return { status: 400, data: {} };
                }

                return { status: 200, data: userData };
        }

        checkSelectedTable() {
                const tableData = this.getCookie("selectedTable");
                if (!tableData || !tableData.id) {
                        return { status: 400, data: {} };
                }

                return { status: 200, data: tableData };
        }

        checkTakeAway() {
                const takeawayData = this.getCookie("takeaway");
                if (!takeawayData || !takeawayData.redirecturl) {
                        return { status: 400, data: {} };
                }

                return { status: 200, data: takeawayData };
        }

        formatDate(dateString) {
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, "0");
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
        }

        formatReadableDate(dateString) {
                const options = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                };

                const date = new Date(dateString);
                return date.toLocaleString("en-US", options);
        }

        showLoader() {
                return (
                        <div className="loader-center">
                                <img
                                        src={cafeurl}
                                        alt="Loading Animation"
                                        className="loading-image"
                                />
                        </div>
                );
        }

        showPopup(setPopup, popupTimerRef, message, type = "error", duration = 5000) {
                const uniqueKey = Date.now();
                setPopup({ message, type, visible: true, key: uniqueKey });

                if (popupTimerRef?.current) {
                        clearTimeout(popupTimerRef.current);
                }

                popupTimerRef.current = setTimeout(() => {
                        setPopup((prev) => ({ ...prev, visible: false }));
                }, duration);
        }

        hidePopup(setPopup, popupTimerRef) {
                if (popupTimerRef?.current) {
                        clearTimeout(popupTimerRef.current);
                }

                setPopup((prev) => ({ ...prev, visible: false }));
        }

        renderPopup(popup, onClose) {
                const getIcon = () => {
                        switch (popup.type) {
                                case "success":
                                        return "check_circle";
                                case "error":
                                        return "error";
                                case "info":
                                        return "info";
                                default:
                                        return "notifications";
                        }
                };

                return popup.visible ? (
                        <div className={`user-not-select popup ${popup.type}`} key={popup.key}>
                                <span className="material-symbols-outlined popup-icon">
                                        {getIcon()}
                                </span>
                                <div style={{ flex: 1 }}>{popup.message}</div>
                                <span
                                        className="material-symbols-outlined close-icon"
                                        onClick={onClose}
                                >
                                        close
                                </span>
                                <div className="popup-progress"></div>
                        </div>
                ) : null;
        }

        toggleSidebar(setter, value = null) {
                setter((prev) => (value !== null ? value : !prev));
        }

        toggleState(setter, value = null) {
                setter((prev) => (value !== null ? value : !prev));
        }

        renderDateCard(dateString) {
                const date = new Date(dateString);

                const day = date.getDate();
                const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();

                return (
                        <div className="common-date-card">
                                <div className="day">{day}</div>
                                <div className="month">{month}</div>
                                <div className="divider"></div>
                                <div className="year">{year}</div>
                        </div>
                );
        }

        renderStars = (rating = 0) => {
                const totalStars = 5;

                return (
                        <div className="star-rating">
                                {Array.from({ length: totalStars }).map((_, index) => {
                                        const starValue = index + 1;

                                        let starClass = "empty";
                                        if (rating >= starValue) {
                                                starClass = "full";
                                        } else if (rating >= starValue - 0.5) {
                                                starClass = "half";
                                        }

                                        return (
                                                <span key={index} className={`material-symbols-outlined ms-icon-fill star ${starClass}`}>
                                                        kid_star
                                                </span>
                                        );
                                })}
                        </div>
                );
        };

        noDataFound(image = Config.nodatafoundimg) {
                return (
                        <nav className="loader-container">
                                <img
                                        src={image}
                                        alt="No data Found"
                                        className="notfound-image m-0"
                                />
                        </nav>
                );
        }

        tooltip(text, element, position = "top") {
                return (
                        <div className={`tooltip-wrapper ${position}`}>
                                {element}
                                <span className="tooltip-box">{text}</span>
                        </div>
                );
        }
}

export default Methods;
