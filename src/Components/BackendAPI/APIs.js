import _Config from "../../Config.js";
import axios from "axios";
import _Methods from "../../Methods.js";

const Config = new _Config();
const method = new _Methods();

axios.interceptors.request.use(
        (config) => {
                let authData = method.getCookie("authdata");
                if (typeof authData === "string") {
                        try { authData = JSON.parse(authData); }
                        catch { authData = {}; }
                }
                if (authData?.token) config.headers.token = `Bearer ${authData.token}`;
                if (authData?.uid) config.headers.uid = authData.uid;
                if (authData?.uniqueid) config.headers.unqkey = authData.uniqueid;
                if (authData?.name) config.headers.username = authData.name;

                return config;
        },
        (error) => Promise.reject(error)
);

// 🔄 Auto Update Cookie + Logout on 401
axios.interceptors.response.use(
        (response) => response,
        (error) => {
                if (error.response && error.response.status === 401) {
                        localStorage.clear();
                        sessionStorage.clear();

                        document.cookie.split(";").forEach(cookie => {
                                const name = cookie.split("=")[0].trim();
                                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                        });
                        window.location.href = "/login";
                }
                return Promise.reject(error);
        }
);

// -------------------- SAFE METHODS --------------------
export default class APIs {
        async safePost(url, body = {}, headers = {}) {
                try {
                        const response = await axios.post(`${Config.backendurl}${url}`, body, { headers });
                        if (response.data.status === 200 && response.headers.token) {
                                const authCookie = {
                                        token: response.headers.token,
                                        uid: response.headers.uid,
                                        uniqueid: response.headers.unqkey,
                                };
                                console.log("🚀 ~ APIs.js:66 ~ APIs ~ safePost ~ authCookie>>", authCookie);
                                method.setCookie("authdata", authCookie);
                        }
                        return { ...response.data, __headers: response.headers };
                } catch (error) {
                        if (error.response) return error.response.data;
                        return { status: 500, message: "Network Connection Error" };
                }
        }

        // 🗑️ SAFE DELETE
        async safeDelete(url, data = {}) {
                try {
                        const response = await axios.delete(`${Config.backendurl}${url}`, { data });
                        return response.data;
                } catch (error) {
                        if (error.response) return error.response.data;
                        return { status: 500, message: "Network Connection Error" };
                }
        }

        // 🔑 AUTH
        async GetAccessToken(email) {

                document.cookie.split(";").forEach(cookie => {
                        const name = cookie.split("=")[0].trim();
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                });

                const unqkey = method.generateRandomString(25);
                const unqid = method.generateuuid();
                const mainKey = Config.accesskey;
                const id = method.generateRandomNumber(4);
                const key = method.secureHash(mainKey, unqkey, unqid, id);
                const headers = { key, unqkey, unqid, issuer: Config.issuer, code: email, id };
                const result = await this.safePost("cust/getaccesstoken", {}, headers);
                return result;
        }

        // -------------------- AUTH --------------------
        async Register(name, email, number, password, confirmPassword) {
                return this.safePost("register", { name, email, number, password, confirmPassword });
        }

        async Login(email, password) {
                const result = await this.safePost("login", { email, password });
                if (result.status === 200) {
                        method.setCookie("customerdata", result);
                }
                return result;
        }

        async GoogleLogin(name, email, number) {
                const result = await this.safePost("google/login", { name, email, number });
                if (result.status === 200) {
                        method.setCookie("customerdata", result);
                }
                return result;
        }

        async PasswordUpdate(email, password, cnfpassword) {
                const result = await this.safePost("change/forgot/password", { email, password, cnfpassword });
                if (result.status === 200 && result.token) {
                        localStorage.setItem("token", result.token);
                        method.setCookie("customerdata", result);
                }
                return result;
        }

        async AdminOrderPayment() {
                try {
                        const response = await axios.post(`${Config.backendurl}list/orders`, {});
                        return response.data
                } catch (error) {
                        return {
                                status: 500,
                                message: "Network Connection Error"
                        }
                }
        }

        async CustomerChangePassword(email, oldpassword, newpassword) {
                return this.safePost("customer/change/password", { email, oldpassword, newpassword });
        }

        // -------------------- CUSTOMER --------------------
        async FetchCustomerDetails(customerid) {
                return this.safePost("customer/details", { _id: customerid });
        }

        async UpdateCustomerDetails(_id, name, email, number) {
                const response = await this.safePost("customer/update", { _id, name, email, number });
                if (response && response.status === 200) {
                        let cookiedata = method.getCookie("customerdata");

                        cookiedata.name = name;
                        cookiedata.email = email;
                        cookiedata.number = number;

                        method.setCookie("customerdata", cookiedata);
                }
                return response;
        }

        // -------------------- OTP --------------------
        async SendOTP(email) {
                return this.safePost("send/otp", { email });
        }

        async VerifyOTP(email, otp) {
                return this.safePost("verify/otp", { email, otp });
        }

        async AdminPaymentVerify(orderId, customerid, url) {
                try {
                        const response = await axios.post(`${Config.backendurl}admin/payments/received`, { _id: orderId, customerid: customerid, url: url, status: 2 });
                        return response.data
                } catch (error) {
                        return {
                                status: 500,
                                message: "Network Connection Error"
                        }
                }
        }

        async VerifyTokenOTP(token, email) {
                return this.safePost("verify/otp/token", { token, email });
        }

        // -------------------- TABLE / TAKEAWAY --------------------
        async TakeAway(_id, name, email, contact) {
                return this.safePost("takeawayurl", { _id, name, email, contact });
        }

        async FreeTables() {
                return this.safePost("free/tables");
        }

        async SelectTable(_id, customerid, customername, tableno, redirecturl) {
                const response = await this.safePost("table/select", { _id, customerid, customername, tableno, redirecturl });

                if (response && response.status === 200) {
                        method.setCookie("selectedTable", { id: _id, table_no: tableno, redirecturl: redirecturl });
                }
                return response;
        }

        // -------------------- CART --------------------
        async ViewCart(customerid, servicetype) {
                return this.safePost("viewcart", { customerid: customerid, servicetype: servicetype });
        }

        async AddtoCart(cartData) {
                return this.safePost("addtocart", cartData);
        }

        // -------------------- FAVORITES --------------------
        async FetchFavItems(customerid) {
                return this.safePost("favorites/list", { customerid });
        }

        async AddFavItems(customerid, foodid, foodcode, foodname) {
                return this.safePost("favorites/add", { customerid, foodid, foodcode, foodname });
        }

        async RemoveFavItems(customerid, foodid, foodname) {
                return this.safeDelete("favorites/remove", { customerid, foodid, foodname });
        }

        // -------------------- FOOD / CATEGORY --------------------
        async FetchCategories(pageno = 1, pagelimit = 99999999, sort = { _id: -1 }, projection = { name: 1, code: 1 }, filter = { isactive: 1 }, searchtext = "") {
                return this.safePost("category/list", {
                        paginationinfo: { pageno, pagelimit, sort, projection, filter },
                        searchtext,
                });
        }

        async FetchFoodItems() {
                return this.safePost("fooditems", { isactive: 1 });
        }

        // -------------------- ORDERS --------------------
        async FetchPastOrders({ customerid, servicetype }) {
                console.log("🚀 ~ APIs.js:237 ~ APIs ~ FetchPastOrders ~ customerid, servicetype>>", customerid, servicetype);

                return this.safePost("view/previous/orders", { customerid, servicetype });
        }

        // -------------------- BILLING --------------------
        async DiningBillingListing(customerid, servicetype, orderid) {
                return this.safePost("dinein/billing/listing", { customerid, servicetype, orderid });
        }

        async DiningConfirmBilling(payload) {
                return this.safePost("dinein/billing", payload);
        }

        async UpdatePaymentStatus(_id, status) {
                return this.safePost("dinein/billing/payment", { _id, paymentmethod: status });
        }

        async CheckAdminPaymentReceivedStatus(orderId) {
                const response = await this.safePost("dinein/check/admin/status", { _id: orderId });

                if (response && response.status === 200) {
                        method.deleteCookie("selectedTable")
                }

                return response;
        }

        async FetchAdminStatus(_id) {
                return this.safePost("dinein/admin/status", { _id });
        }

        // -------------------- STATIC CONTENT --------------------
        async FetchAboutUsData() {
                return this.safePost("aboutus", {});
        }

        async FetchTagLine(prompt) {
                return this.safePost("food/tagline", { prompt });
        }

        async Services() {
                return this.safePost("services", {});
        }

        async CustomerSupportAdd(name, message, email, number) {
                return this.safePost("add/contactus", { name, message, email, number });
        }
        
        async CustomerRatingAdd(payload){
                return this.safePost("rating/add", payload);
        }
        
        async VerifyOrder(payload){
                return this.safePost("order/verify", payload);
        }

        fetchBackground() {
                return this.safePost(`background/list`, {});
        }
}
