import axios from "axios";
import ConfigClass from "./Config.js";
import MethodsClass from "./Methods.js";

const Config = new ConfigClass();
const Method = new MethodsClass();

const clearClientSession = () => {
        localStorage.clear();
        sessionStorage.clear();

        document.cookie.split(";").forEach((cookie) => {
                const name = cookie.split("=")[0].trim();
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
};

axios.interceptors.request.use(
        (config) => {
                let authData = Method.getCookie("authdata");

                if (typeof authData === "string") {
                        try {
                                authData = JSON.parse(authData);
                        } catch {
                                authData = {};
                        }
                }

                if (authData?.token) config.headers.token = `Bearer ${authData.token}`;
                if (authData?.uid) config.headers.uid = authData.uid;
                if (authData?.uniqueid) config.headers.unqkey = authData.uniqueid;
                if (authData?.name) config.headers.username = authData.name;

                if (typeof window !== "undefined") {
                        const path = window.location.pathname || "";
                        config.headers.pagename = path.replace(/^\//, "");
                }

                config.headers.platform = "web";
                return config;
        },
        (error) => Promise.reject(error)
);

axios.interceptors.response.use(
        (response) => response,
        (error) => {
                if (error.response?.status === 401) {
                        clearClientSession();
                        window.location.href = "/login";
                }

                return Promise.reject(error);
        }
);

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

                                Method.setCookie("authdata", authCookie);
                        }

                        return { ...response.data, __headers: response.headers };
                } catch (error) {
                        if (error.response) return error.response.data;
                        return { status: 500, message: "Network Connection Error" };
                }
        }

        async safeDelete(url, data = {}) {
                try {
                        const response = await axios.delete(`${Config.backendurl}${url}`, { data });
                        return response.data;
                } catch (error) {
                        if (error.response) return error.response.data;
                        return { status: 500, message: "Network Connection Error" };
                }
        }

        async GetAccessToken(email) {
                document.cookie.split(";").forEach((cookie) => {
                        const name = cookie.split("=")[0].trim();
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                });

                const unqkey = Method.generateRandomString(25);
                const unqid = Method.generateuuid();
                const id = Method.generateRandomNumber(4);
                const key = Method.secureHash(Config.accesskey, unqkey, unqid, id);
                const headers = { key, unqkey, unqid, issuer: Config.issuer, code: email, id };

                return this.safePost("cust/getaccesstoken", {}, headers);
        }

        Register(name, email, number, password, confirmPassword) {
                return this.safePost("register", { name, email, number, password, confirmPassword });
        }

        async Login(email, password) {
                const result = await this.safePost("login", { email, password });
                if (result.status === 200) {
                        Method.setCookie("customerdata", result);
                }

                return result;
        }

        async GoogleLogin(name, email, number) {
                const result = await this.safePost("google/login", { name, email, number });
                if (result.status === 200) {
                        Method.setCookie("customerdata", result);
                }

                return result;
        }

        async PasswordUpdate(email, password, cnfpassword) {
                const result = await this.safePost("change/forgot/password", { email, password, cnfpassword });
                if (result.status === 200 && result.token) {
                        localStorage.setItem("token", result.token);
                        Method.setCookie("customerdata", result);
                }

                return result;
        }

        async AdminOrderPayment() {
                try {
                        const response = await axios.post(`${Config.backendurl}list/orders`, {});
                        return response.data;
                } catch (error) {
                        return { status: 500, message: "Network Connection Error" };
                }
        }

        CustomerChangePassword(email, oldpassword, newpassword) {
                return this.safePost("customer/change/password", { email, oldpassword, newpassword });
        }

        FetchCustomerDetails(customerid) {
                return this.safePost("customer/details", { _id: customerid });
        }

        async UpdateCustomerDetails(_id, name, email, number) {
                const response = await this.safePost("customer/update", { _id, name, email, number });

                if (response?.status === 200) {
                        const cookieData = Method.getCookie("customerdata");
                        Method.setCookie("customerdata", {
                                ...cookieData,
                                name,
                                email,
                                number,
                        });
                }

                return response;
        }

        SendOTP(email) {
                return this.safePost("send/otp", { email });
        }

        VerifyOTP(email, otp) {
                return this.safePost("verify/otp", { email, otp });
        }

        async AdminPaymentVerify(orderId, customerid, url) {
                try {
                        const response = await axios.post(`${Config.backendurl}admin/payments/received`, {
                                _id: orderId,
                                customerid,
                                url,
                                status: 2,
                        });

                        return response.data;
                } catch (error) {
                        return { status: 500, message: "Network Connection Error" };
                }
        }

        VerifyTokenOTP(token, email) {
                return this.safePost("verify/otp/token", { token, email });
        }

        TakeAway(_id, name, email, contact) {
                return this.safePost("takeawayurl", { _id, name, email, contact });
        }

        FreeTables() {
                return this.safePost("free/tables");
        }

        async SelectTable(_id, customerid, customername, tableno, redirecturl) {
                const response = await this.safePost("table/select", { _id, customerid, customername, tableno, redirecturl });

                if (response?.status === 200) {
                        Method.setCookie("selectedTable", { id: _id, table_no: tableno, redirecturl });
                }

                return response;
        }

        ViewCart(customerid, servicetype) {
                return this.safePost("viewcart", { customerid, servicetype });
        }

        AddtoCart(cartData) {
                return this.safePost("addtocart", cartData);
        }

        FetchFavItems(customerid) {
                return this.safePost("favorites/list", { customerid });
        }

        AddFavItems(customerid, foodid, foodcode, foodname) {
                return this.safePost("favorites/add", { customerid, foodid, foodcode, foodname });
        }

        RemoveFavItems(customerid, foodid, foodname) {
                return this.safeDelete("favorites/remove", { customerid, foodid, foodname });
        }

        FetchCategories(pageno = 1, pagelimit = 99999999, sort = { _id: -1 }, projection = { name: 1, code: 1 }, filter = { isactive: 1 }, searchtext = "") {
                return this.safePost("category/list", {
                        paginationinfo: { pageno, pagelimit, sort, projection, filter },
                        searchtext,
                });
        }

        FetchFoodItems() {
                return this.safePost("fooditems", { isactive: 1 });
        }

        FetchPastOrders({ customerid, servicetype }) {
                return this.safePost("view/previous/orders", { customerid, servicetype });
        }

        DiningBillingListing(customerid, servicetype, orderid) {
                return this.safePost("dinein/billing/listing", { customerid, servicetype, orderid });
        }

        DiningConfirmBilling(payload) {
                return this.safePost("dinein/billing", payload);
        }

        UpdatePaymentStatus(_id, status) {
                return this.safePost("dinein/billing/payment", { _id, paymentmethod: status });
        }

        async CheckAdminPaymentReceivedStatus(orderId) {
                const response = await this.safePost("dinein/check/admin/status", { _id: orderId });

                if (response?.status === 200) {
                        Method.deleteCookie("selectedTable");
                }

                return response;
        }

        FetchAdminStatus(_id) {
                return this.safePost("dinein/admin/status", { _id });
        }

        FetchAboutUsData() {
                return this.safePost("aboutus", {});
        }

        FetchTagLine(prompt) {
                return this.safePost("food/tagline", { prompt });
        }

        Services() {
                return this.safePost("services", {});
        }

        CustomerSupportAdd(name, message, email, number) {
                return this.safePost("add/contactus", { name, message, email, number });
        }

        CustomerRatingAdd(payload) {
                return this.safePost("rating/add", payload);
        }

        VerifyOrder(payload) {
                return this.safePost("order/verify", payload);
        }

        fetchBackground() {
                return this.safePost("background/list", {});
        }
}
