import NoOrderFound from "../assets/NoOrderFound.png";
import MoonlightCafeLogoSquare from "../assets/MoonlightCafeLogoSquare-47d9a8.png";
import MoonlightCafeLogo from "../assets/MoonlightCafeLogo-47d9a8.png";
import MoonlightCafeText from "../assets/MoonlightCafeText.png";
import MenuFeatured from "../assets/MenuFeatured.png";
import OrderListImg from "../assets/OrderList.png";
import PageNotFound from "../assets/PageNotFound.png";
import NoDataFound from "../assets/NoDataFound.png";
import ThankYou from "../assets/ThankYou.png";
import GoogleLogo from "../assets/GoogleLogo.png";
class Config {
        constructor() {
                // this.backendurl = "http://192.168.1.4:8080/moonlightcafe/v1/";
                this.menuFeaturedImg = MenuFeatured;
                this.accesskey = "Moonlight_Cafe_A4C9D2F1-5F21-A5E7-4C8B-C1D9B6F0A277";
                this.issuer = "web";
                this.backendurl = "https://api-moonlightcafe.onrender.com/moonlightcafe/v1/";
                this.upiId = "jainilam75-1@okhdfcbank";
                this.allowtax = 1;
                this.taxdetails = {
                        dineintax: 5,
                        takeawaytax: 10
                };

                this.razorpay_key_id = "rzp_test_TPybdBbHfGkwpj";

                this.moonlightcafelogo = MoonlightCafeLogo;
                this.moonlightcafetext = MoonlightCafeText;
                this.orderlistimag = OrderListImg;
                this.moonlightcafelogosquare = MoonlightCafeLogoSquare;
                this.notfoundimg = PageNotFound;
                this.pagenotfoundimg = this.notfoundimg;
                this.thankyouimg = ThankYou;
                this.googleLogo = GoogleLogo;
                this.ordernotfoundimg = NoOrderFound;
                this.nodatafoundimg = NoDataFound;

                // Preload all images so they don't load half-half when first used
                const imagesToPreload = [
                        this.menuFeaturedImg,
                        this.moonlightcafelogo,
                        this.moonlightcafetext,
                        this.orderlistimag,
                        this.moonlightcafelogosquare,
                        this.notfoundimg,
                        this.thankyouimg,
                        this.googleLogo,
                        this.ordernotfoundimg,
                        this.nodatafoundimg
                ];
                imagesToPreload.forEach(src => {
                        if (src) {
                                const img = new Image();
                                img.src = src;
                        }
                });
        }
}

export default Config;
