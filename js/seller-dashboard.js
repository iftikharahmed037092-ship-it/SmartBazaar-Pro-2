/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER DASHBOARD
FEATURE: SELLER AUTHENTICATION
FEATURE: SELLER PROFILE
FEATURE: SELLER PRODUCTS
FEATURE: SELLER ORDERS
FEATURE: SELLER SALES
FEATURE: SELLER EARNINGS
FEATURE: SELLER NOTIFICATIONS
FEATURE: SELLER NAVIGATION
FEATURE: SELLER MOBILE MENU
FEATURE: SELLER LOGOUT
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORTS
==================================================*/

import {
    database,
    auth
} from "../firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    ref,
    get,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: GLOBAL STATE
==================================================*/

let currentUser = null;

let currentProfile = {};

let sellerProducts = [];

let sellerOrders = [];

let sellerNotifications = [];

let productsListener = null;


/*==================================================
FEATURE: DOM HELPER
==================================================*/

function $(id) {

    return document.getElementById(id);

}


/*==================================================
FEATURE: SAFE HTML
==================================================*/

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
FEATURE: FORMAT MONEY
==================================================*/

function formatMoney(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-PK",
        {
            maximumFractionDigits: 2
        }
    );

}


/*==================================================
FEATURE: FORMAT PRICE
==================================================*/

function formatPrice(value) {

    return `Rs. ${formatMoney(value)}`;

}


/*==================================================
FEATURE: FORMAT DATE
==================================================*/

function formatDate(value) {

    if (!value) {

        return "Date unavailable";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleDateString(
        "en-PK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/*==================================================
FEATURE: INITIAL LETTER
==================================================*/

function getInitial(name) {

    if (!name) {

        return "S";

    }


    const clean =
        String(name).trim();


    if (!clean) {

        return "S";

    }


    return clean
        .charAt(0)
        .toUpperCase();

}


/*==================================================
FEATURE: ADMIN CHECK
==================================================*/

function isAdmin(user) {

    if (!user?.email) {

        return false;

    }


    return (
        user.email
            .trim()
            .toLowerCase() ===
        ADMIN_EMAIL
            .trim()
            .toLowerCase()
    );

}


/*==================================================
FEATURE: AUTHENTICATION
==================================================*/

function setupAuthentication() {

    onAuthStateChanged(
        auth,
        async user => {

            if (!user) {

                currentUser = null;

                window.location.href =
                    "./login.html";

                return;

            }


            /*
            Admin should use Admin Panel.
            */

            if (isAdmin(user)) {

                window.location.href =
                    "./admin-panel.html";

                return;

            }


            currentUser = user;


            try {

                await loadSellerDashboard();

            } catch (error) {

                console.error(
                    "Seller dashboard loading error:",
                    error
                );

                showDashboardError(
                    "Some dashboard data could not be loaded. Please check your Firebase Database rules."
                );

            }

        }
    );

}


/*==================================================
FEATURE: LOAD DASHBOARD
==================================================*/

async function loadSellerDashboard() {

    showDashboardLoading();


    await loadProfile();

    await Promise.all([
        loadOrders(),
        loadNotifications()
    ]);


    /*
    Products use real-time listener.
    */

    loadProducts();


    updateDashboardStatistics();

    renderRecentOrders();

    renderOrders();

    renderNotifications();

    updateStoreInformation();

    showDashboardContent();

}


/*==================================================
FEATURE: DASHBOARD LOADING
==================================================*/

function showDashboardLoading() {

    const loading =
        $("sellerDashboardLoading");


    if (loading) {

        loading.style.display =
            "flex";

    }

}


/*==================================================
FEATURE: DASHBOARD CONTENT
==================================================*/

function showDashboardContent() {

    const loading =
        $("sellerDashboardLoading");


    if (loading) {

        loading.style.display =
            "none";

    }

}


/*==================================================
FEATURE: DASHBOARD ERROR
==================================================*/

function showDashboardError(message) {

    const loading =
        $("sellerDashboardLoading");


    if (loading) {

        loading.style.display =
            "none";

    }


    console.error(
        message
    );

}


/*==================================================
FEATURE: LOAD PROFILE
==================================================*/

async function loadProfile() {

    if (!currentUser) {

        return;

    }


    currentProfile = {

        uid:
            currentUser.uid,

        fullName:
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "SmartBazaar Seller",

        email:
            currentUser.email || "",

        phone: "",

        city: "",

        photoURL:
            currentUser.photoURL || ""

    };


    try {

        const userRef =
            ref(
                database,
                `users/${currentUser.uid}`
            );


        const snapshot =
            await get(userRef);


        if (snapshot.exists()) {

            const data =
                snapshot.val();


            currentProfile = {

                ...currentProfile,

                ...data

            };

        }

    } catch (error) {

        console.warn(
            "Seller profile load error:",
            error
        );

    }


    updateProfileUI();

}


/*==================================================
FEATURE: UPDATE PROFILE UI
==================================================*/

function updateProfileUI() {

    const name =
        currentProfile.fullName ||
        currentUser?.displayName ||
        "SmartBazaar Seller";


    const email =
        currentProfile.email ||
        currentUser?.email ||
        "";


    const avatar =
        currentProfile.photoURL ||
        currentUser?.photoURL ||
        "";


    const headerName =
        $("sellerDashboardProfileName");


    const headerAvatar =
        $("sellerDashboardProfileAvatar");


    const sidebarName =
        $("sellerDashboardSidebarName");


    const sidebarAvatar =
        $("sellerDashboardSidebarAvatar");


    if (headerName) {

        headerName.textContent =
            name;

    }


    if (sidebarName) {

        sidebarName.textContent =
            name;

    }


    setAvatar(
        headerAvatar,
        avatar,
        name
    );


    setAvatar(
        sidebarAvatar,
        avatar,
        name
    );


    /*
    Optional elements if present.
    */

    const emailElements =
        document.querySelectorAll(
            "[data-seller-email]"
        );


    emailElements.forEach(
        element => {

            element.textContent =
                email;

        }
    );

}


/*==================================================
FEATURE: SET AVATAR
==================================================*/

function setAvatar(
    element,
    imageUrl,
    name
) {

    if (!element) {

        return;

    }


    if (imageUrl) {

        /*
        Works with img elements.
        */

        if (
            element.tagName === "IMG"
        ) {

            element.src =
                imageUrl;

            element.alt =
                name;

            element.style.display =
                "";

            return;

        }


        /*
        Works with div/avatar containers.
        */

        element.style.backgroundImage =
            `url("${imageUrl}")`;

        element.classList.add(
            "has-image"
        );


        element.textContent =
            "";

        return;

    }


    /*
    No image.
    */

    if (
        element.tagName === "IMG"
    ) {

        element.removeAttribute(
            "src"
        );

        element.alt =
            name;

        /*
        Keep image element available.
        CSS may already provide fallback.
        */

    } else {

        element.style.backgroundImage =
            "";

        element.classList.remove(
            "has-image"
        );

        element.textContent =
            getInitial(name);

    }

}


/*==================================================
FEATURE: LOAD PRODUCTS
==================================================*/

function loadProducts() {

    if (!currentUser) {

        return;

    }


    if (productsListener) {

        productsListener();

        productsListener =
            null;

    }


    const productsRef =
        ref(
            database,
            "products"
        );


    productsListener =
        onValue(
            productsRef,
            snapshot => {

                const data =
                    snapshot.val() || {};


                sellerProducts =
                    Object.entries(data)
                        .map(
                            ([firebaseKey, product]) => {

                                return {

                                    ...(product || {}),

                                    _firebaseKey:
                                        firebaseKey,

                                    productId:
                                        product?.productId ||
                                        firebaseKey

                                };

                            }
                        )
                        .filter(
                            product => {

                                return (
                                    product.sellerId ===
                                    currentUser.uid ||

                                    product.createdBy ===
                                    currentUser.uid
                                );

                            }
                        )
                        .sort(
                            (a, b) => {

                                return (
                                    Number(
                                        b.createdAt || 0
                                    ) -
                                    Number(
                                        a.createdAt || 0
                                    )
                                );

                            }
                        );


                renderProducts();

                updateProductStatistics();

                updateDashboardStatistics();

            },
            error => {

                console.error(
                    "Seller products error:",
                    error
                );


                sellerProducts = [];

                renderProducts();

                updateProductStatistics();

            }
        );

}


/*==================================================
FEATURE: PRODUCT STATISTICS
==================================================*/

function updateProductStatistics() {

    const total =
        sellerProducts.length;


    const published =
        sellerProducts.filter(
            product =>
                product.published !== false
        ).length;


    const outOfStock =
        sellerProducts.filter(
            product => {

                const stock =
                    Number(product.stock);


                return (
                    Number.isFinite(stock) &&
                    stock <= 0
                );

            }
        ).length;


    const discountProducts =
        sellerProducts.filter(
            product => {

                const discount =
                    Number(
                        product.discount
                    );


                const price =
                    Number(
                        product.price
                    );


                const oldPrice =
                    Number(
                        product.oldPrice
                    );


                return (
                    discount > 0 ||

                    (
                        Number.isFinite(oldPrice) &&
                        Number.isFinite(price) &&
                        oldPrice > price
                    )
                );

            }
        ).length;


    const totalStock =
        sellerProducts.reduce(
            (sum, product) => {

                const stock =
                    Number(
                        product.stock
                    );


                return (
                    sum +
                    (
                        Number.isFinite(stock)
                            ? stock
                            : 0
                    )
                );

            },
            0
        );


    setText(
        "sellerDashboardTotalProducts",
        total
    );


    setText(
        "sellerDashboardPublishedProducts",
        published
    );


    setText(
        "sellerDashboardOutOfStockProducts",
        outOfStock
    );


    setText(
        "sellerDashboardDiscountProducts",
        discountProducts
    );


    setText(
        "sellerDashboardTotalStock",
        totalStock
    );


    setText(
        "sellerDashboardProductsBadge",
        total
    );

}


/*==================================================
FEATURE: RENDER PRODUCTS
==================================================*/

function renderProducts() {

    const container =
        $("sellerDashboardProductsList");


    const loading =
        $("sellerDashboardProductsLoading");


    if (!container) {

        return;

    }


    if (loading) {

        loading.style.display =
            "none";

    }


    const searchInput =
        $("sellerDashboardProductSearch");


    const filterSelect =
        $("sellerDashboardProductFilter");


    const search =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const filter =
        filterSelect?.value ||
        "all";


    let products =
        [...sellerProducts];


    /*
    Search.
    */

    if (search) {

        products =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ""
                        )
                        .toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        )
                        .toLowerCase();


                    const productId =
                        String(
                            product.productId || ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(search) ||
                        category.includes(search) ||
                        productId.includes(search)
                    );

                }
            );

    }


    /*
    Filter.
    */

    if (filter === "published") {

        products =
            products.filter(
                product =>
                    product.published !== false
            );

    }


    if (filter === "unpublished") {

        products =
            products.filter(
                product =>
                    product.published === false
            );

    }


    if (filter === "stock") {

        products =
            products.filter(
                product => {

                    const stock =
                        Number(product.stock);


                    return (
                        Number.isFinite(stock) &&
                        stock > 0
                    );

                }
            );

    }


    if (filter === "out-of-stock") {

        products =
            products.filter(
                product => {

                    const stock =
                        Number(product.stock);


                    return (
                        Number.isFinite(stock) &&
                        stock <= 0
                    );

                }
            );

    }


    if (filter === "discount") {

        products =
            products.filter(
                product => {

                    const discount =
                        Number(
                            product.discount
                        );


                    const price =
                        Number(
                            product.price
                        );


                    const oldPrice =
                        Number(
                            product.oldPrice
                        );


                    return (
                        discount > 0 ||
                        (
                            Number.isFinite(oldPrice) &&
                            Number.isFinite(price) &&
                            oldPrice > price
                        )
                    );

                }
            );

    }


    if (products.length === 0) {

        container.innerHTML = `

            <div class="seller-dashboard-empty">

                <div class="seller-dashboard-empty-icon">
                    <i class="fa-solid fa-box-open"></i>
                </div>

                <h3>
                    ${
                        sellerProducts.length
                            ? "No Products Found"
                            : "No Products Yet"
                    }
                </h3>

                <p>
                    ${
                        sellerProducts.length
                            ? "Try changing your search or filter."
                            : "Add your first product to start selling."
                    }
                </p>

                ${
                    !sellerProducts.length
                        ? `
                            <button
                                type="button"
                                class="seller-dashboard-primary-button"
                                data-action="add-product"
                            >
                                <i class="fa-solid fa-plus"></i>
                                Add Product
                            </button>
                        `
                        : ""
                }

            </div>

        `;


        bindDynamicActions();

        return;

    }


    container.innerHTML =
        products
            .map(
                product =>
                    productCardHTML(product)
            )
            .join("");


    bindDynamicActions();

}


/*==================================================
FEATURE: PRODUCT CARD
==================================================*/

function productCardHTML(product) {

    const name =
        product.name ||
        "Unnamed Product";


    const image =
        product.image ||
        (
            Array.isArray(
                product.images
            )
                ? product.images[0]
                : ""
        );


    const price =
        Number(
            product.price || 0
        );


    const oldPrice =
        Number(
            product.oldPrice || 0
        );


    const discount =
        Number(
            product.discount || 0
        );


    const stock =
        Number(
            product.stock
        );


    const stockValid =
        Number.isFinite(stock);


    const published =
        product.published !== false;


    const category =
        product.category ||
        "Uncategorized";


    const productId =
        product.productId ||
        product._firebaseKey ||
        "";


    let stockClass =
        "available";


    let stockText =
        stockValid
            ? String(stock)
            : "N/A";


    if (
        stockValid &&
        stock <= 0
    ) {

        stockClass =
            "out-of-stock";

        stockText =
            "Out of Stock";

    } else if (
        stockValid &&
        stock <=
        Number(
            product.lowStockLimit || 0
        )
    ) {

        stockClass =
            "low-stock";

        stockText =
            `${stock} Low`;

    }


    const discountVisible =
        discount > 0 ||
        (
            oldPrice > price &&
            oldPrice > 0
        );


    return `

        <article
            class="seller-dashboard-product-card"
            data-product-id="${escapeHtml(productId)}"
        >

            <div class="seller-dashboard-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(name)}"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="seller-dashboard-product-no-image">
                                <i class="fa-solid fa-image"></i>
                            </div>
                        `
                }

            </div>


            <div class="seller-dashboard-product-content">

                <div class="seller-dashboard-product-top">

                    <span class="seller-dashboard-product-category">
                        ${escapeHtml(category)}
                    </span>

                    <span class="
                        seller-dashboard-product-published
                        ${
                            published
                                ? "published"
                                : "unpublished"
                        }
                    ">
                        ${
                            published
                                ? "Published"
                                : "Unpublished"
                        }
                    </span>

                </div>


                <h3 class="seller-dashboard-product-name">
                    ${escapeHtml(name)}
                </h3>


                <div class="seller-dashboard-product-price">

                    <strong>
                        ${formatPrice(price)}
                    </strong>

                    ${
                        oldPrice > price
                            ? `
                                <del>
                                    ${formatPrice(oldPrice)}
                                </del>
                            `
                            : ""
                    }

                    ${
                        discountVisible
                            ? `
                                <span class="seller-dashboard-product-discount">
                                    ${
                                        discount > 0
                                            ? `${formatMoney(discount)}% OFF`
                                            : "Sale"
                                    }
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="seller-dashboard-product-meta">

                    <span class="${stockClass}">

                        <i class="fa-solid fa-box"></i>

                        ${
                            stockValid
                                ? `Stock: ${escapeHtml(stockText)}`
                                : "Stock: N/A"
                        }

                    </span>


                    <span>

                        <i class="fa-solid fa-fingerprint"></i>

                        ${escapeHtml(productId)}

                    </span>

                </div>


                <div class="seller-dashboard-product-actions">

                    <button
                        type="button"
                        class="seller-dashboard-secondary-button"
                        data-action="view-product"
                        data-product-id="${escapeHtml(productId)}"
                    >

                        <i class="fa-solid fa-eye"></i>

                        View

                    </button>

                </div>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: PRODUCT SEARCH/FILTER
==================================================*/

function setupProductControls() {

    const search =
        $("sellerDashboardProductSearch");


    const filter =
        $("sellerDashboardProductFilter");


    if (search) {

        search.addEventListener(
            "input",
            () => {

                renderProducts();

            }
        );

    }


    if (filter) {

        filter.addEventListener(
            "change",
            () => {

                renderProducts();

            }
        );

    }

}


/*==================================================
FEATURE: DYNAMIC PRODUCT ACTIONS
==================================================*/

function bindDynamicActions() {

    document
        .querySelectorAll(
            '[data-action="add-product"]'
        )
        .forEach(
            button => {

                if (
                    button.dataset.bound
                ) {

                    return;

                }


                button.dataset.bound =
                    "true";


                button.addEventListener(
                    "click",
                    () => {

                        openProductEditor();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            '[data-action="view-product"]'
        )
        .forEach(
            button => {

                if (
                    button.dataset.bound
                ) {

                    return;

                }


                button.dataset.bound =
                    "true";


                button.addEventListener(
                    "click",
                    () => {

                        const productId =
                            button.dataset.productId;


                        if (!productId) {

                            return;

                        }


                        window.location.href =
                            `./product-details.html?id=${encodeURIComponent(productId)}`;

                    }
                );

            }
        );

}


/*==================================================
FEATURE: OPEN PRODUCT EDITOR
==================================================*/

function openProductEditor() {

    window.location.href =
        "./product-editor.html?source=account";

}


/*==================================================
FEATURE: LOAD ORDERS
==================================================*/

async function loadOrders() {

    sellerOrders = [];


    if (!currentUser) {

        return;

    }


    try {

        const ordersRef =
            ref(
                database,
                "orders"
            );


        const snapshot =
            await get(ordersRef);


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.val();


        sellerOrders =
            Object.entries(data)
                .map(
                    ([firebaseKey, order]) => {

                        return {

                            ...(order || {}),

                            _firebaseKey:
                                firebaseKey

                        };

                    }
                )
                .filter(
                    order =>
                        order.sellerId ===
                        currentUser.uid
                )
                .sort(
                    (a, b) => {

                        return (
                            Number(
                                b.createdAt || 0
                            ) -
                            Number(
                                a.createdAt || 0
                            )
                        );

                    }
                );

    } catch (error) {

        console.error(
            "Seller orders error:",
            error
        );

        sellerOrders = [];

    }

}


/*==================================================
FEATURE: PAID ORDERS
==================================================*/

function getPaidSellerOrders() {

    return sellerOrders.filter(
        order =>
            String(
                order.paymentStatus || ""
            )
            .toLowerCase() ===
            "paid"
    );

}


/*==================================================
FEATURE: SALES CALCULATIONS
==================================================*/

function calculateSellerFinance() {

    const paidOrders =
        getPaidSellerOrders();


    const sales =
        paidOrders.reduce(
            (sum, order) => {

                const subtotal =
                    Number(
                        order.subtotal
                    );


                /*
                Use subtotal when available.
                This avoids counting delivery
                charges as product sales.
                */

                if (
                    Number.isFinite(
                        subtotal
                    )
                ) {

                    return (
                        sum +
                        subtotal
                    );

                }


                /*
                Fallback to total only when
                subtotal is not present.
                */

                const total =
                    Number(
                        order.total || 0
                    );


                return (
                    sum +
                    (
                        Number.isFinite(total)
                            ? total
                            : 0
                    )
                );

            },
            0
        );


    const commission =
        paidOrders.reduce(
            (sum, order) => {

                const amount =
                    Number(
                        order.commissionAmount
                    );


                return (
                    sum +
                    (
                        Number.isFinite(amount)
                            ? amount
                            : 0
                    )
                );

            },
            0
        );


    const earnings =
        paidOrders.reduce(
            (sum, order) => {

                const amount =
                    Number(
                        order.sellerEarning
                    );


                return (
                    sum +
                    (
                        Number.isFinite(amount)
                            ? amount
                            : 0
                    )
                );

            },
            0
        );


    return {

        sales,

        commission,

        earnings,

        paidOrders:
            paidOrders.length

    };

}


/*==================================================
FEATURE: DASHBOARD STATISTICS
==================================================*/

function updateDashboardStatistics() {

    const finance =
        calculateSellerFinance();


    setText(
        "sellerDashboardTotalOrders",
        sellerOrders.length
    );


    setText(
        "sellerDashboardTotalSales",
        formatPrice(
            finance.sales
        )
    );


    setText(
        "sellerDashboardTotalEarnings",
        formatPrice(
            finance.earnings
        )
    );


    setText(
        "sellerDashboardFinanceSales",
        formatPrice(
            finance.sales
        )
    );


    setText(
        "sellerDashboardFinanceCommission",
        formatPrice(
            finance.commission
        )
    );


    setText(
        "sellerDashboardFinanceEarnings",
        formatPrice(
            finance.earnings
        )
    );


    setText(
        "sellerDashboardOrdersBadge",
        sellerOrders.length
    );

}


/*==================================================
FEATURE: RENDER RECENT ORDERS
==================================================*/

function renderRecentOrders() {

    const container =
        $("sellerDashboardRecentOrders");


    const empty =
        $("sellerDashboardRecentOrdersEmpty");


    if (!container) {

        return;

    }


    const recent =
        sellerOrders.slice(
            0,
            5
        );


    if (recent.length === 0) {

        container.innerHTML =
            "";


        if (empty) {

            empty.style.display =
                "block";

        }


        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    container.innerHTML =
        recent
            .map(
                order =>
                    recentOrderHTML(order)
            )
            .join("");

}


/*==================================================
FEATURE: RECENT ORDER HTML
==================================================*/

function recentOrderHTML(order) {

    const orderId =
        order.orderId ||
        order._firebaseKey ||
        "Order";


    const productName =
        order.productName ||
        "Product";


    const quantity =
        Number(
            order.quantity || 1
        );


    const total =
        Number(
            order.total || 0
        );


    const status =
        normalizeStatus(
            order.status
        );


    return `

        <div class="seller-dashboard-recent-order">

            <div class="seller-dashboard-recent-order-icon">

                <i class="fa-solid fa-box"></i>

            </div>


            <div class="seller-dashboard-recent-order-info">

                <strong>
                    ${escapeHtml(orderId)}
                </strong>

                <span>
                    ${escapeHtml(productName)}
                </span>

                <small>
                    Qty: ${quantity}
                </small>

            </div>


            <div class="seller-dashboard-recent-order-right">

                <strong>
                    ${formatPrice(total)}
                </strong>

                <span class="
                    seller-dashboard-status
                    status-${escapeHtml(status)}
                ">
                    ${escapeHtml(capitalize(status))}
                </span>

            </div>

        </div>

    `;

}


/*==================================================
FEATURE: RENDER ALL ORDERS
==================================================*/

function renderOrders() {

    const container =
        $("sellerDashboardOrdersList");


    if (!container) {

        return;

    }


    if (sellerOrders.length === 0) {

        container.innerHTML = `

            <div class="seller-dashboard-empty">

                <div class="seller-dashboard-empty-icon">
                    <i class="fa-solid fa-box-open"></i>
                </div>

                <h3>
                    No Orders Yet
                </h3>

                <p>
                    Orders for your products will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        sellerOrders
            .map(
                order =>
                    sellerOrderHTML(order)
            )
            .join("");

}


/*==================================================
FEATURE: SELLER ORDER HTML
==================================================*/

function sellerOrderHTML(order) {

    const orderId =
        order.orderId ||
        order._firebaseKey ||
        "Order";


    const productName =
        order.productName ||
        "Product";


    const quantity =
        Number(
            order.quantity || 1
        );


    const total =
        Number(
            order.total || 0
        );


    const subtotal =
        Number(
            order.subtotal || 0
        );


    const paymentStatus =
        String(
            order.paymentStatus ||
            "pending"
        );


    const status =
        normalizeStatus(
            order.status
        );


    const date =
        formatDate(
            order.createdAt
        );


    return `

        <article
            class="seller-dashboard-order-card"
            data-order-id="${escapeHtml(orderId)}"
        >

            <div class="seller-dashboard-order-main">

                <div class="seller-dashboard-order-header">

                    <strong>
                        ${escapeHtml(orderId)}
                    </strong>

                    <span class="
                        seller-dashboard-status
                        status-${escapeHtml(status)}
                    ">
                        ${escapeHtml(capitalize(status))}
                    </span>

                </div>


                <h3>
                    ${escapeHtml(productName)}
                </h3>


                <div class="seller-dashboard-order-meta">

                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${escapeHtml(date)}
                    </span>

                    <span>
                        <i class="fa-solid fa-box"></i>
                        Qty: ${quantity}
                    </span>

                    <span>
                        <i class="fa-solid fa-credit-card"></i>
                        ${escapeHtml(paymentStatus)}
                    </span>

                </div>

            </div>


            <div class="seller-dashboard-order-finance">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatPrice(subtotal)}
                </strong>


                <small>
                    Total: ${formatPrice(total)}
                </small>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: LOAD NOTIFICATIONS
==================================================*/

async function loadNotifications() {

    sellerNotifications = [];


    if (!currentUser) {

        return;

    }


    try {

        const notificationRef =
            ref(
                database,
                `users/${currentUser.uid}/notifications`
            );


        const snapshot =
            await get(
                notificationRef
            );


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.val();


        sellerNotifications =
            Object.entries(data)
                .map(
                    ([firebaseKey, notification]) => {

                        return {

                            ...(notification || {}),

                            _firebaseKey:
                                firebaseKey

                        };

                    }
                )
                .sort(
                    (a, b) => {

                        return (
                            Number(
                                b.createdAt ||
                                b.timestamp ||
                                0
                            ) -
                            Number(
                                a.createdAt ||
                                a.timestamp ||
                                0
                            )
                        );

                    }
                );

    } catch (error) {

        console.warn(
            "Seller notification load error:",
            error
        );

        sellerNotifications = [];

    }

}


/*==================================================
FEATURE: RENDER NOTIFICATIONS
==================================================*/

function renderNotifications() {

    const container =
        $("sellerDashboardNotificationsList");


    if (!container) {

        return;

    }


    if (
        sellerNotifications.length === 0
    ) {

        container.innerHTML = `

            <div class="seller-dashboard-empty">

                <div class="seller-dashboard-empty-icon">
                    <i class="fa-regular fa-bell"></i>
                </div>

                <h3>
                    No Notifications
                </h3>

                <p>
                    Your SmartBazaar account notifications will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        sellerNotifications
            .map(
                notification =>
                    notificationHTML(
                        notification
                    )
            )
            .join("");

}


/*==================================================
FEATURE: NOTIFICATION HTML
==================================================*/

function notificationHTML(
    notification
) {

    const title =
        notification.title ||
        "SmartBazaar Update";


    const message =
        notification.message ||
        notification.text ||
        "";


    const date =
        formatDate(
            notification.createdAt ||
            notification.timestamp
        );


    /*
    The existing account system uses
    read === false for unread.
    */

    const unread =
        notification.read === false;


    return `

        <article class="
            seller-dashboard-notification
            ${unread ? "unread" : ""}
        ">

            <div class="seller-dashboard-notification-icon">

                <i class="fa-regular fa-bell"></i>

            </div>


            <div class="seller-dashboard-notification-content">

                <strong>
                    ${escapeHtml(title)}
                </strong>

                <p>
                    ${escapeHtml(message)}
                </p>

                <small>
                    ${escapeHtml(date)}
                </small>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: NOTIFICATION BADGE
==================================================*/

function updateNotificationBadge() {

    /*
    Only use the existing read field.
    */

    const unread =
        sellerNotifications.filter(
            notification =>
                notification.read === false
        ).length;


    setText(
        "sellerDashboardNotificationBadge",
        unread
    );


    const badge =
        $("sellerDashboardNotificationBadge");


    if (badge) {

        badge.style.display =
            unread > 0
                ? ""
                : "none";

    }


    setText(
        "sellerDashboardMessagesBadge",
        0
    );


    const messagesBadge =
        $("sellerDashboardMessagesBadge");


    if (messagesBadge) {

        messagesBadge.style.display =
            "none";

    }

}


/*==================================================
FEATURE: STORE INFORMATION
==================================================*/

function updateStoreInformation() {

    const name =
        currentProfile.fullName ||
        currentUser?.displayName ||
        "Your Store";


    setText(
        "sellerDashboardStoreName",
        name
    );


    const viewStore =
        $("sellerDashboardViewStore");


    if (viewStore && currentUser) {

        viewStore.href =
            `./seller-store.html?sellerId=${encodeURIComponent(currentUser.uid)}`;

    }

}


/*==================================================
FEATURE: NAVIGATION
==================================================*/

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            "[data-section]"
        );


    navItems.forEach(
        item => {

            /*
            Only use dashboard navigation items.
            */

            if (
                !item.closest(
                    "#sellerDashboardSidebar"
                ) &&
                !item.hasAttribute(
                    "data-section-link"
                )
            ) {

                return;

            }


            if (
                item.dataset.bound
            ) {

                return;

            }


            item.dataset.bound =
                "true";


            item.addEventListener(
                "click",
                event => {

                    /*
                    Prevent normal link navigation
                    for dashboard section controls.
                    */

                    if (
                        item.tagName === "A" &&
                        item.dataset.section
                    ) {

                        event.preventDefault();

                    }


                    const section =
                        item.dataset.section;


                    if (!section) {

                        return;

                    }


                    openDashboardSection(
                        section
                    );

                }
            );

        }
    );


    /*
    Generic data-section-link controls.
    */

    document
        .querySelectorAll(
            "[data-section-link]"
        )
        .forEach(
            item => {

                if (
                    item.dataset.bound
                ) {

                    return;

                }


                item.dataset.bound =
                    "true";


                item.addEventListener(
                    "click",
                    event => {

                        if (
                            item.tagName === "A"
                        ) {

                            event.preventDefault();

                        }


                        openDashboardSection(
                            item.dataset.sectionLink
                        );

                    }
                );

            }
        );


    /*
    Initial section.
    */

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();


    const valid =
        getValidDashboardSections();


    if (
        hash &&
        valid.includes(hash)
    ) {

        openDashboardSection(
            hash,
            false
        );

    } else {

        openDashboardSection(
            "overview",
            false
        );

    }

}


/*==================================================
FEATURE: VALID DASHBOARD SECTIONS
==================================================*/

function getValidDashboardSections() {

    return [

        "overview",
        "products",
        "orders",
        "sales",
        "earnings",
        "withdrawals",
        "store",
        "messages",
        "notifications",
        "settings"

    ];

}


/*==================================================
FEATURE: OPEN DASHBOARD SECTION
==================================================*/

function openDashboardSection
