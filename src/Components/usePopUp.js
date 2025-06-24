import { useState, useRef } from "react";

export default function usePopup(timeout = 5000) {
        const [popup, setPopup] = useState({ visible: false, message: "", type: "success" });
        const popupTimer = useRef(null);

        const showPopup = (message, type = "error") => {
                setPopup({ visible: true, message, type });
                if (popupTimer.current) clearTimeout(popupTimer.current);
                popupTimer.current = setTimeout(() => {
                        setPopup((prev) => ({ ...prev, visible: false }));
                }, timeout);
        };

        const hidePopup = () => setPopup((prev) => ({ ...prev, visible: false }));

        return { popup, showPopup, hidePopup };
}
