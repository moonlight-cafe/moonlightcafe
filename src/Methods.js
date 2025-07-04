import "./Methods.css"
import Navbar from "./Components/Navbar.js"

class Methods {
        getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                        try {
                                return decodeURIComponent(parts.pop().split(';').shift());
                        } catch (e) {
                                console.error("Cookie parsing failed", e);
                                return null;
                        }
                }
                return null;
        }

        checkLoginStatus() {
                const userData = this.getCookie("customerdata");
                if (!userData || !JSON.parse(userData).email) {
                        // window.location.href = "/login";
                        return { status: 400, data: {} };
                }
                return { status: 200, data: JSON.parse(userData) };
        }

        checkSelectedTable() {
                const tableData = this.getCookie("selectedTable");
                if (!tableData || !JSON.parse(tableData).redirecturl) {
                        return { status: 400, data: {} };
                }
                return { status: 200, data: JSON.parse(tableData) };
        }

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

        showLoader() {
                return (
                        // <Navbar />
                        // <div className="cafe-loading-img">
                        <img
                                src="https://res.cloudinary.com/dqdv99ydb/image/upload/v1749141918/tempfolder/gmd4nf2stova0qct7h3o.png"
                                alt="Loading Animation"
                                className="loading-image"
                        />
                        // </div>
                );
        }
}
export default Methods;
