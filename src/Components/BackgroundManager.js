import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API, Method } from "../config/Init.js";

const BACKGROUND_INTERVAL = 10000;

export default function BackgroundManager() {
        const location = useLocation();

        const [images, setImages] = useState([]);
        const [darkMode, setDarkMode] = useState(false);

        const lastIndexRef = useRef(-1);

        const normalizeImageUrl = (value) => {
                if (typeof value !== "string") return "";
                const trimmed = value.trim();
                if (!trimmed) return "";

                return trimmed.replace(
                        /\.(jpg|jpeg|png|webp|gif)\.\1$/i,
                        ".$1"
                );
        };

        const sanitizeImageList = (list) => {
                if (!Array.isArray(list)) return [];
                return list
                        .map(normalizeImageUrl)
                        .filter((url) => /^https?:\/\//i.test(url));
        };

        const parseBackgroundImages = (raw) => {
                if (!raw) return [];

                try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) return sanitizeImageList(parsed);
                        if (typeof parsed === "string") {
                                const reparsed = JSON.parse(parsed);
                                return Array.isArray(reparsed) ? sanitizeImageList(reparsed) : [];
                        }
                        return [];
                } catch (err) {
                        console.error("Invalid background image data", err);
                        return [];
                }
        };

        const getBackgroundImages = () => {
                return parseBackgroundImages(localStorage.getItem("backgroundimgs"));
        };

        const extractImagesFromResponse = (response) => {
                if (!response) return [];
                if (Array.isArray(response)) return sanitizeImageList(response);
                if (Array.isArray(response.data)) {
                        const urls = response.data.map((img) =>
                                typeof img === "string" ? img : img?.url
                        );
                        return sanitizeImageList(urls);
                }
                return [];
        };

        const applyThemeFromCookie = () => {
                const admindata = Method.getCookie("admindata");
                const theme = Number(JSON.parse(admindata)?.darkmodeaccess) || 0;
                setDarkMode(theme);
        };

        useEffect(() => {
                const loadBackgrounds = async () => {
                        const storedImages = getBackgroundImages();

                        if (storedImages.length) {
                                setImages(storedImages);
                                return;
                        }

                        const response = await API.fetchBackground();
                        const fetchedImages = extractImagesFromResponse(response);

                        if (fetchedImages.length) {
                                localStorage.setItem(
                                        "backgroundimgs",
                                        JSON.stringify(fetchedImages)
                                );
                                setImages(fetchedImages);
                        }
                };

                applyThemeFromCookie();
                loadBackgrounds();
        }, []);

        useEffect(() => {
                const handleBackgroundUpdate = () => {
                        applyThemeFromCookie();
                        const imgs = getBackgroundImages();
                        lastIndexRef.current = -1;
                        setImages(imgs);
                };

                window.addEventListener("themeChanged", handleBackgroundUpdate);

                return () =>
                        window.removeEventListener("themeChanged", handleBackgroundUpdate);
        }, []);

        useEffect(() => {
                const canLoadImage = (url) =>
                        new Promise((resolve) => {
                                const img = new Image();
                                img.onload = () => resolve(true);
                                img.onerror = () => resolve(false);
                                img.src = url;
                        });

                if (darkMode === 1) {
                        document.body.style.backgroundImage = "none";
                        document.body.style.backgroundColor = "#1e1e1e";
                        return;
                }

                if (!images.length) return;

                const updateBackground = async () => {
                        let randomIndex;

                        do {
                                randomIndex = Math.floor(Math.random() * images.length);
                        } while (
                                randomIndex === lastIndexRef.current &&
                                images.length > 1
                        );

                        lastIndexRef.current = randomIndex;

                        const selectedUrl = images[randomIndex];
                        const isValid = await canLoadImage(selectedUrl);
                        if (!isValid) {
                                const validImages = images.filter((url) => url !== selectedUrl);
                                localStorage.setItem(
                                        "backgroundimgs",
                                        JSON.stringify(validImages)
                                );
                                setImages(validImages);
                                return;
                        }

                        document.body.style.backgroundImage = `url('${selectedUrl}')`;
                        document.body.style.backgroundSize = "cover";
                        document.body.style.backgroundPosition = "center";
                        document.body.style.backgroundRepeat = "no-repeat";
                        document.body.style.backgroundAttachment = "fixed";
                        document.body.style.backgroundBlendMode = "normal";
                        document.body.style.backgroundColor = "#1e1e1e";
                };

                updateBackground();
                const interval = setInterval(updateBackground, BACKGROUND_INTERVAL);

                return () => clearInterval(interval);
        }, [images, darkMode, location.pathname]);

        return null;
}
