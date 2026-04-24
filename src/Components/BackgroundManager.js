import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Method, API } from "../config/Init.js";
import "./BackgroundManager.css";

const BACKGROUND_INTERVAL = 10000;
const TRANSITION_DURATION = 1200;
const ANIMATIONS = ["fade", "slide-left", "slide-right", "zoom", "blur"];

export default function BackgroundManager() {
	const location = useLocation();

	const [images, setImages] = useState([]);
	const [darkMode, setDarkMode] = useState(0);
	const [currentImage, setCurrentImage] = useState("");
	const [nextImage, setNextImage] = useState("");
	const [activeAnimation, setActiveAnimation] = useState("fade");

	const lastIndexRef = useRef(-1);
	const intervalRef = useRef(null);
	const transitionRef = useRef(null);
	const isTransitioningRef = useRef(false);

	const getBackgroundImages = () => {
		try {
			const raw = Method.getCookie("backgroundimgs");
			if (!raw) return [];

			// Handle already parsed array
			if (Array.isArray(raw)) return raw;

			// Handle stringified array or double stringified
			const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (Array.isArray(parsed)) return parsed;
			
			if (typeof parsed === "string") {
				const reparsed = JSON.parse(parsed);
				return Array.isArray(reparsed) ? reparsed : [];
			}
			return [];
		} catch (err) {
			console.error("Invalid background image cookie", err);
			return [];
		}
	};

	const fetchAndSetBackgrounds = async () => {
		try {
			const res = await API.fetchBackground();
			if (res.status === 200 && res.data) {
				const activeUrls = res.data
					.filter(img => img.status === 1)
					.map(img => img.url);
				
				if (activeUrls.length > 0) {
					Method.setCookie("backgroundimgs", activeUrls, 30);
					setImages(activeUrls);
					return activeUrls;
				}
			}
		} catch (err) {
			console.error("Failed to fetch background images:", err);
		}
		return [];
	};

	const applyThemeFromCookie = () => {
		const rawData = Method.getCookie("customerdata");
		let data = rawData;
		if (typeof rawData === "string") {
			try { data = JSON.parse(rawData); } catch (e) { data = null; }
		}
		const theme = Number(data?.darkmodeaccess) || 0;
		setDarkMode(theme);
	};

	const clearTimers = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		if (transitionRef.current) {
			clearTimeout(transitionRef.current);
			transitionRef.current = null;
		}
		isTransitioningRef.current = false;
	};

	useEffect(() => {
		applyThemeFromCookie();
		const imgs = getBackgroundImages();
		if (imgs.length > 0) {
			setImages(imgs);
		} else {
			fetchAndSetBackgrounds();
		}
	}, []);

	useEffect(() => {
		const handleBackgroundUpdate = () => {
			applyThemeFromCookie();
			const imgs = getBackgroundImages();
			lastIndexRef.current = -1;
			if (imgs.length > 0) {
				setImages(imgs);
			} else {
				fetchAndSetBackgrounds();
			}
		};

		window.addEventListener("themeChanged", handleBackgroundUpdate);
		return () => window.removeEventListener("themeChanged", handleBackgroundUpdate);
	}, []);

	useEffect(() => {
		clearTimers();

		if (darkMode === 1) {
			document.body.style.backgroundImage = "none";
			document.body.style.backgroundColor = "#1e1e1e";
			setCurrentImage("");
			setNextImage("");
			lastIndexRef.current = -1;
			return;
		}

		document.body.style.backgroundImage = "none";
		document.body.style.backgroundColor = "#1e1e1efa";

		if (!images.length) {
			setCurrentImage("");
			setNextImage("");
			lastIndexRef.current = -1;
			return;
		}

		if (!currentImage || !images.includes(currentImage)) {
			const firstIndex = Math.floor(Math.random() * images.length);
			lastIndexRef.current = firstIndex;
			setCurrentImage(images[firstIndex]);
		}

		const pickNextIndex = () => {
			let randomIndex;
			do {
				randomIndex = Math.floor(Math.random() * images.length);
			} while (randomIndex === lastIndexRef.current && images.length > 1);
			return randomIndex;
		};

		const pickAnimation = () => ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];

		const updateBackground = () => {
			if (isTransitioningRef.current || !images.length) return;

			const randomIndex = pickNextIndex();
			const next = images[randomIndex];
			const animation = pickAnimation();

			lastIndexRef.current = randomIndex;
			isTransitioningRef.current = true;
			setActiveAnimation(animation);
			setNextImage(next);

			transitionRef.current = setTimeout(() => {
				setCurrentImage(next);
				setNextImage("");
				isTransitioningRef.current = false;
			}, TRANSITION_DURATION);
		};

		intervalRef.current = setInterval(updateBackground, BACKGROUND_INTERVAL);
		return () => clearTimers();
	}, [images, darkMode, location.pathname, currentImage]);

	const animationClass = nextImage ? `anim-${activeAnimation}` : "";

	return (
		<div className={`bg-manager ${darkMode === 1 ? "hidden" : ""} ${animationClass}`}>
			<div
				className="bg-layer current"
				style={{ backgroundImage: currentImage ? `url('${currentImage}')` : "none" }}
			/>
			<div
				className="bg-layer next"
				style={{ backgroundImage: nextImage ? `url('${nextImage}')` : "none" }}
			/>
		</div>
	);
}
