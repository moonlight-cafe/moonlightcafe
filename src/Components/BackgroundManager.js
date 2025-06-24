import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const laptopImages = [
        'https://images.wallpaperscraft.com/image/single/burger_hamburger_buns_116170_1280x720.jpg',
        'https://images.wallpaperscraft.com/image/single/pizza_vegetables_sauce_82102_1280x720.jpg',
        'https://images.wallpaperscraft.com/image/single/coffee_book_windowsill_130911_1600x900.jpg',
        'https://images.wallpaperscraft.com/image/single/coffee_cappuccino_cup_120501_1280x720.jpg',
        'https://images.wallpaperscraft.com/image/single/pizza_pastry_appetizing_104513_1280x720.jpg'
];
const tabletImages = [...laptopImages];
const mobileImages = [
        'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=2127&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const getImageSet = () => {
        const width = window.innerWidth;
        if (width <= 480) return mobileImages;
        if (width <= 768) return tabletImages;
        return laptopImages;
};

export default function BackgroundManager() {
        const location = useLocation();

        useEffect(() => {
                let images = getImageSet();
                let index = 0;

                const updateBackground = () => {
                        document.body.style.backgroundImage = `url('${images[index]}')`;
                        document.body.style.backgroundSize = 'cover';
                        document.body.style.backgroundPosition = 'center';
                        document.body.style.backgroundRepeat = 'no-repeat';
                        document.body.style.backgroundAttachment = 'fixed';
                        document.body.style.transition = 'background-image 1s ease-in-out';
                        index = (index + 1) % images.length;
                };

                updateBackground();
                const interval = setInterval(updateBackground, 10000);

                const handleResize = () => {
                        images = getImageSet();
                        index = 0;
                        updateBackground();
                };

                window.addEventListener('resize', handleResize);

                return () => {
                        clearInterval(interval);
                        window.removeEventListener('resize', handleResize);
                        document.body.style.backgroundImage = '';
                };
        }, [location.pathname]);

        return null;
}
