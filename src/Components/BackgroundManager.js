import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const laptopImages = [
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309185/tempfolder/uq9dmqht667m88g8gvig.jpg',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309994/tempfolder/x0izghl5bxzhbwuqpqrd.jpg',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751310017/tempfolder/hf5oyixtu9s9yelov11a.jpg',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309109/tempfolder/jrgfmischvl9y7ujap3h.jpg',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309062/tempfolder/si2fr7ewwcbx8izpqxzn.jpg',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308992/tempfolder/o2ujfpm43jmfoqd6v8dv.jpg',
        "https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308718/tempfolder/pixmemhmyodipczyvmce.jpg",
        "https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308763/tempfolder/a1ahxfkzmmpvowlhkidu.jpg",
        "https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308813/tempfolder/bmv5x0xg7pcakgvvokvc.jpg",
        "https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308856/tempfolder/qfuknyw63es4ympb1m1v.jpg",
        "https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308916/tempfolder/lgeek3q8qljiymfhaj25.jpg",
];

const tabletImages = [...laptopImages];

const mobileImages = [
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751308943/tempfolder/fet2hqdc6fjbd6kz7yza.avif',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309242/tempfolder/np5hsu4r97dvoswwhlc2.webp',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309292/tempfolder/u9f3jrtskuzneudjwecu.webp',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309328/tempfolder/qisu7kohcxzyu6vuerzd.avif',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309397/tempfolder/ehr0h1umcbmhg9yyuunr.jpg',
        'https://res.cloudinary.com/dqdv99ydb/image/upload/v1751309439/tempfolder/dclvngpe2kkhvltqtgad.jpg'
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
                let lastIndex = -1;

                const updateBackground = () => {
                        let randomIndex;
                        do {
                                randomIndex = Math.floor(Math.random() * images.length);
                        } while (randomIndex === lastIndex && images.length > 1);

                        lastIndex = randomIndex;

                        document.body.style.backgroundImage = `url('${images[randomIndex]}')`;
                        document.body.style.backgroundSize = 'cover';
                        document.body.style.backgroundPosition = 'center';
                        document.body.style.backgroundRepeat = 'no-repeat';
                        document.body.style.backgroundAttachment = 'fixed';
                        document.body.style.transition = 'background-image 1s ease-in-out';
                };

                updateBackground(); // Set initial background
                const interval = setInterval(updateBackground, 10000); // Update every 10s

                const handleResize = () => {
                        images = getImageSet();
                        lastIndex = -1;
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
