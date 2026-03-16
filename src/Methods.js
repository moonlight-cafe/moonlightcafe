import "./Methods.css";
import _Config from "./Config.js";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Config = new _Config();
const cafeurl = Config.moonlightcafelogo;

class Methods {
    // AOS
    initAOS() {
        AOS.init({
            duration: 1000,
            offset: 100,
            once: true,
            easing: 'ease-in-out',
        });
    }

    refreshAOS() {
        AOS.refresh();
    }

    generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    generateRandomNumber(length) {
        const characters = '0123456789`';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    generateuuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    secureHash(mainKey, unqkey, unqid, id) {
        const combined = mainKey + unqkey + unqid;
        let hash = id;
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) + hash) + combined.charCodeAt(i);
        }
        return (hash >>> 0).toString(16) + unqkey.slice(0, 10);
    }

    // Cookie Set
    setCookie(name, value, durationInMinutes = 120) {
        const expires = new Date();
        expires.setTime(expires.getTime() + durationInMinutes * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;
    }

    // Cookie Get
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            try {
                const cookieValue = decodeURIComponent(parts.pop().split(';').shift());
                try {
                    return JSON.parse(cookieValue);
                } catch {
                    return cookieValue;
                }
            } catch (e) {
                console.error("Cookie parsing failed", e);
                return null;
            }
        }
        return null;
    }

    // Cookie Delete
    deleteCookie(name) {
        try {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } catch (e) {
            console.error("Error deleting cookie:", e);
        }
    }

    getServiceType(type = 1) {
        if (type === 1) {
            return "Dine in"
        } else if (type === 2) {
            return "Take Away"
        } else if (type === 3) {
            return "Reservation"
        } else {
            return "Invalid Service"
        }
    }

    // Login & Table Check
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

    formatDate(dateString) {                       // 01-Jan-2025
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Format Date
    formatReadableDate(dateString) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
    }

    // Loader
    showLoader() {
        return (
            <img
                src={cafeurl}
                alt="Loading Animation"
                className="loading-image"
            />
        );
    }

    // Popup
    showPopup(setPopup, popupTimerRef, message, type = "error", duration = 5000) {
        const uniqueKey = Date.now();
        setPopup({ message, type, visible: true, key: uniqueKey });
        if (popupTimerRef?.current) clearTimeout(popupTimerRef.current);
        popupTimerRef.current = setTimeout(() => {
            setPopup((prev) => ({ ...prev, visible: false }));
        }, duration);
    }

    hidePopup(setPopup, popupTimerRef) {
        if (popupTimerRef?.current) clearTimeout(popupTimerRef.current);

        setPopup((prev) => ({ ...prev, visible: false }));
    }

    renderPopup(popup, onClose) {
        const getIcon = () => {
            switch (popup.type) {
                case "success": return "check_circle";
                case "error": return "error";
                case "info": return "info";
                default: return "notifications";
            }
        };

        return (
            popup.visible && (
                <div className={`user-not-select popup ${popup.type}`} key={popup.key}>
                    <span className="material-symbols-outlined popup-icon">
                        {getIcon()}
                    </span>
                    <div style={{ flex: 1 }}>{popup.message}</div>
                    <span
                        className="material-symbols-outlined close-icon"
                        onClick={onClose}
                    >close</span>
                    <div className="popup-progress"></div>
                </div>
            )
        );
    }

    toggleSidebar(isSidebarOpenSetter, value = null) {
        isSidebarOpenSetter((prev) => (value !== null ? value : !prev));
    }

    // Others
    toggleState(setter, value = null) {
        setter((prev) => (value !== null ? value : !prev));
    }

    tooltip(text, element, position = "top") {     //   Can be "top", "bottom", "left", "right"
        return (
            <div className={`tooltip-wrapper ${position}`}>
                {element}
                <span className="tooltip-box">{text}</span>
            </div>
        );
    }
}

export default Methods;
