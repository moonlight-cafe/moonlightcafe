import NoOrderFound from "../assets/NoOrderFound.png";
import MoonlightCafeLogoSquare from "../assets/MoonlightCafeLogoSquare-47d9a8.png";
import MoonlightCafeLogo from "../assets/MoonlightCafeLogo-47d9a8.png";
import MoonlightCafeText from "../assets/MoonlightCafeText.png";
import MenuFeatured from "../assets/MenuFeatured.png";
import OrderListImg from "../assets/OrderList.png";
class Config {
        constructor() {
                // this.backendurl = "http://192.168.1.2:8080/moonlightcafe/v1/";
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
                // this.moonlightcafelogo = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1749141918/tempfolder/gmd4nf2stova0qct7h3o.png";
                // this.moonlightcafelogosquare = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1757447223/Monlight_Cafe_Green_qbzvfd.png";
                this.moonlightcafelogo = MoonlightCafeLogo;
                this.moonlightcafetext = MoonlightCafeText;
                this.orderlistimag = OrderListImg;
                this.moonlightcafelogosquare = MoonlightCafeLogoSquare;
                // this.notfoundimg = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1750510132/tempfolder/mj0rmgzbmtkbamsuqa1x.png";
                this.notfoundimg = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1750510202/tempfolder/zrapqrzlygy8yblyjsaa.png";
                this.pagenotfoundimg = this.notfoundimg;
                this.thankyouimg = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1754332972/tempfolder/d7zu3almhglzjmpikmvd.png";
                this.googleLogo = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1754333910/tempfolder/pomisungxxmzk4ebrhpc.png";
                this.ordernotfoundimg = NoOrderFound;
                // this.ordernotfoundimg = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1751911835/tempfolder/iglvseffli1xja5ooupn.png";
                this.nodatafoundimg = "https://res.cloudinary.com/dqdv99ydb/image/upload/v1768720131/ChatGPT_Image_Jan_18_2026_12_37_23_PM_llykwc.png";
        }
}

export default Config;
