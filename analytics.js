/* ==================================================
SMARTBAZAAR PRO 2
FEATURE: ANALYTICS SYSTEM
FILE: analytics.js

PURPOSE:
Central Analytics Controller

IMPORTANT:
This file uses the EXISTING SmartBazaar Pro 2
Firebase / Order / Product / Customer / Seller /
Payment architecture.

DO NOT CREATE A NEW DATABASE ARCHITECTURE HERE.

All source-specific modules are marked below.
================================================== */

/* ==================================================
ANALYTICS MODULE
SOURCE FILE: firebase-orders.js
FEATURE: FIREBASE ORDER DATA
================================================== */

import {
    getCustomerOrders,
    getSellerOrdersFromFirebase,
    normalizeFirebaseOrder
} from "./firebase-orders.js";

"use strict";


/* ==================================================
======================================================
ANALYTICS SYSTEM — GLOBAL STATE
======================================================
================================================== */

const AnalyticsState = {

    /* ----------------------------------------------
       CURRENT ANALYTICS PERIOD
    ---------------------------------------------- */

    period: "today",

    /* ----------------------------------------------
       CURRENT SALES CHART PERIOD
       7 / 30 / 90 DAYS
    ---------------------------------------------- */

    chartPeriod: 7,

    /* ----------------------------------------------
       RAW DATA CONTAINERS
    ---------------------------------------------- */

    orders: [],
    products: [],
    customers: [],
    sellers: [],
    categories: [],
    payments: [],
    deals: [],
    wishlist: [],

    /* ----------------------------------------------
       LOADING STATE
    ---------------------------------------------- */

    loading: false,

    /* ----------------------------------------------
       LAST REFRESH TIME
    ---------------------------------------------- */

    lastUpdated: null

};


/* ==================================================
======================================================
SOURCE MODULE #01
FILE: firebase-config.js
FEATURE: FIREBASE CONNECTION
======================================================
================================================== */

/*
   PURPOSE:

   Analytics کو SmartBazaar Pro 2 کے موجودہ Firebase
   configuration سے connect کیا جائے گا۔

   یہاں موجودہ:

   - Firebase App
   - Firebase Database
   - Firebase Auth

   configuration استعمال کی جائے گی۔

   ---------------------------------------------------

   IMPORTANT:

   ابھی یہاں کوئی نیا Firebase initialize نہیں کرنا۔

   جب آپ مجھے firebase-config.js دیں گے،
   تو اسی فائل کے اصل exports / imports کے مطابق
   یہاں code لگایا جائے گا۔

   ---------------------------------------------------

   INSERT LOCATION:

   اسی section میں Firebase configuration
   import / connection code آئے گا.
*/


/* ==================================================
======================================================
SOURCE MODULE #02
FILE: firebase-orders.js
FEATURE: ORDER DATA
======================================================
================================================== */

/*
   PURPOSE:

   Existing Firebase Orders System سے اصل orders
   حاصل کیے جائیں گے۔

   Analytics کو یہاں سے:

   - Order ID
   - Order Date
   - Order Amount
   - Order Status
   - Customer ID
   - Seller ID
   - Payment Method
   - Payment Status

   وغیرہ ملیں گے۔

   ---------------------------------------------------

   IMPORTANT:

   Firebase path یا field names ابھی فرض نہیں کیے گئے۔

   جب firebase-orders.js ملے گی،
   تو اسی کے مطابق یہ module مکمل کیا جائے گا.
*/


/* ==================================================
ANALYTICS MODULE
SOURCE FILE: firebase-orders.js
FEATURE: LOAD ORDER DATA

IMPORTANT:
Analytics uses the EXISTING Firebase Orders system.
Database path and order fields come from
firebase-orders.js.
================================================== */

async function loadAnalyticsOrders() {

    /*
       ------------------------------------------------
       IMPORTANT ARCHITECTURE NOTE
       ------------------------------------------------

       firebase-orders.js currently exposes:

       getCustomerOrders()
       getSellerOrdersFromFirebase()

       Both functions require a logged-in user.

       Therefore this Analytics module will NOT
       create another Firebase orders architecture.

       ------------------------------------------------
    */


    /*
       TEMPORARY CENTRAL ORDER LOAD

       The complete Admin Analytics order-access
       strategy will be finalized after we inspect
       the existing admin/auth Firebase architecture.

       For now, we preserve the existing service.
    */

    try {

        /*
           Existing Firebase Order Service
        */

        const customerOrders =
            await getCustomerOrders();


        /*
           Normalize using the EXISTING normalizer.
        */

        AnalyticsState.orders =
            customerOrders
                .map(order =>
                    normalizeFirebaseOrder(order)
                )
                .filter(Boolean);


    } catch (error) {

        console.error(
            "Analytics: Unable to load Firebase orders.",
            error
        );

        AnalyticsState.orders = [];

        throw error;

    }

}

/* ==================================================
======================================================
SOURCE MODULE #03
FILE: order-service.js
FEATURE: ORDER SERVICE
======================================================
================================================== */

/*
   PURPOSE:

   Existing Order Service کی مدد سے orders کی
   processing / normalization کی جائے گی۔

   یہاں سے Analytics کو compatible order records
   ملیں گے۔

   TODO:

   order-service.js ملنے کے بعد implementation.
*/


function normalizeAnalyticsOrders(orders) {

    /*
       Existing order-service.js کے مطابق
       normalization یہاں ہوگی.
    */

    return Array.isArray(orders) ? orders : [];

}


/* ==================================================
======================================================
SOURCE MODULE #04
FILE: order-status.js
FEATURE: ORDER STATUS ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Existing Order Status System کے اصل status names
   استعمال کیے جائیں گے۔

   Analytics میں:

   - Pending
   - Processing
   - Shipped
   - Delivered
   - Cancelled
   - Returned

   کے counts یہاں سے تیار ہوں گے۔

   TODO:

   order-status.js ملنے کے بعد اصل status mapping.
*/


function calculateOrderStatuses(orders) {

    const result = {

        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0

    };

    return result;

}


/* ==================================================
======================================================
SOURCE MODULE #05
FILE: products.js
FEATURE: PRODUCT ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Existing Products System سے:

   - Product ID
   - Product Name
   - Price
   - Stock
   - Seller ID
   - Category
   - Views
   - Sales

   وغیرہ حاصل کیے جائیں گے۔

   TODO:

   products.js ملنے کے بعد اصل data loader.
*/


async function loadAnalyticsProducts() {

    /*
       SOURCE:
       products.js
    */

    AnalyticsState.products = [];

}


/* ==================================================
======================================================
SOURCE MODULE #06
FILE: product-details.js
FEATURE: PRODUCT VIEWS
======================================================
================================================== */

/*
   PURPOSE:

   Most Viewed Products کے لیے existing
   product-details.js کا view system استعمال ہوگا۔

   IMPORTANT:

   نیا views counter نہیں بنایا جائے گا۔

   Existing product view field / system استعمال ہوگا۔

   TODO:
   product-details.js کے مطابق implementation.
*/


function calculateMostViewedProducts(products) {

    return [];

}


/* ==================================================
======================================================
SOURCE MODULE #07
FILE: product-editor.js
FEATURE: SELLER / PRODUCT OWNERSHIP
======================================================
================================================== */

/*
   PURPOSE:

   Existing Product Editor architecture کے مطابق:

   sellerId
   createdBy

   وغیرہ سے seller/product relationship سمجھا جائے گا۔

   یہ Top Sellers اور Seller Analytics کے لیے
   استعمال ہوگا۔

   TODO:
   product-editor.js کے اصل structure کے مطابق
   implementation.
*/


function resolveProductSeller(product) {

    return {

        sellerId: null,
        createdBy: null

    };

}


/* ==================================================
======================================================
SOURCE MODULE #08
FILE: account.js
FEATURE: CUSTOMER ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Existing Account / Customer system سے:

   - Customer ID
   - Registration Date
   - Last Activity
   - Orders

   وغیرہ استعمال کیے جائیں گے۔

   Analytics:

   - Total Customers
   - New Customers
   - Active Customers
   - Returning Customers

   TODO:
   account.js ملنے کے بعد implementation.
*/


async function loadAnalyticsCustomers() {

    /*
       SOURCE:
       account.js
    */

    AnalyticsState.customers = [];

}


/* ==================================================
======================================================
SOURCE MODULE #09
FILE: admin-panel.js
FEATURE: ADMIN ACCESS / DATA ACCESS
======================================================
================================================== */

/*
   PURPOSE:

   Existing Admin Panel کے authentication / access
   architecture کو respect کیا جائے گا۔

   Analytics کوئی الگ admin authentication system
   نہیں بنائے گا۔

   TODO:
   admin-panel.js کے موجودہ access system کے مطابق
   integration.
*/


function verifyAnalyticsAccess() {

    /*
       Existing admin authentication system یہاں
       استعمال ہوگا.
    */

    return true;

}


/* ==================================================
======================================================
SOURCE MODULE #10
FILES:
firebase-payment.js
payment-flow-service.js
payment-history.js
payment-methods.js
payment-status.js
FEATURE: PAYMENT ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Existing payment architecture سے:

   - COD
   - JazzCash
   - EasyPaisa
   - Other

   کے:

   - Orders
   - Revenue
   - Status

   حاصل کیے جائیں گے۔

   IMPORTANT:

   Payment system کا نیا version نہیں بنایا جائے گا۔

   TODO:
   موجودہ payment files کے مطابق integration.
*/


function calculatePaymentAnalytics(orders) {

    const result = {

        cod: {
            orders: 0,
            revenue: 0
        },

        jazzcash: {
            orders: 0,
            revenue: 0
        },

        easypaisa: {
            orders: 0,
            revenue: 0
        },

        other: {
            orders: 0,
            revenue: 0
        }

    };

    return result;

}


/* ==================================================
======================================================
SOURCE MODULE #11
FILES:
jazzcash-config.js
jazzcash-create-payment.js
jazzcash-payment.js
jazzcash-verify-payment.js

FEATURE: JAZZCASH ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   JazzCash کے existing payment records / status
   کو Analytics کے ساتھ connect کرنا۔

   IMPORTANT:

   یہاں JazzCash API دوبارہ نہیں چلائی جائے گی۔

   Analytics صرف existing payment/order data
   پڑھنے کے لیے استعمال کرے گی۔

   TODO:
   Existing JazzCash architecture کے مطابق.
*/


function loadJazzCashAnalytics() {

    /*
       Existing JazzCash system سے data لیا جائے گا.
    */

}


/* ==================================================
======================================================
SOURCE MODULE #12
FILE: category.js
FEATURE: CATEGORY ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Existing Categories سے:

   - Category ID
   - Category Name
   - Product Count
   - Sales
   - Revenue

   calculate کیے جائیں گے۔

   TODO:
   category.js ملنے کے بعد implementation.
*/


async function loadAnalyticsCategories() {

    /*
       SOURCE:
       category.js
    */

    AnalyticsState.categories = [];

}


/* ==================================================
======================================================
SOURCE MODULE #13
FILE: deals.js
FEATURE: DEALS ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Existing Deals System کے ساتھ Analytics
   integration۔

   TODO:
   deals.js کے موجودہ structure کے مطابق.
*/


async function loadAnalyticsDeals() {

    AnalyticsState.deals = [];

}


/* ==================================================
======================================================
SOURCE MODULE #14
FILE: wishlist.js
FEATURE: WISHLIST ANALYTICS
======================================================
================================================== */

/*
   PURPOSE:

   Wishlist activity کو Analytics میں استعمال کرنا۔

   Future metrics:

   - Wishlist products
   - Wishlist activity
   - Product interest

   TODO:
   wishlist.js کے موجودہ structure کے مطابق.
*/


async function loadAnalyticsWishlist() {

    AnalyticsState.wishlist = [];

}


/* ==================================================
======================================================
ANALYTICS — PERIOD FILTER
======================================================
================================================== */


function getPeriodRange(period) {

    const now = new Date();

    let start = new Date(now);
    let end = new Date(now);

    end.setHours(23, 59, 59, 999);


    switch (period) {

        case "today":

            start.setHours(0, 0, 0, 0);

            break;


        case "yesterday":

            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);

            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);

            break;


        case "week":

            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);

            break;


        case "month":

            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            break;


        case "year":

            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);

            break;


        case "all":

            start = new Date(0);

            break;

    }


    return {
        start,
        end
    };

}


/* ==================================================
ANALYTICS — DATE FILTER
================================================== */


function isDateInRange(dateValue, range) {

    if (!dateValue) return false;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return false;
    }

    return (
        date >= range.start &&
        date <= range.end
    );

}


/* ==================================================
ANALYTICS — FILTER ORDERS
================================================== */


function getFilteredOrders() {

    const range =
        getPeriodRange(AnalyticsState.period);

    return AnalyticsState.orders.filter(order => {

        /*
           TODO:

           Existing order date field یہاں لگایا جائے گا۔

           Source:
           firebase-orders.js / order-service.js
        */

        return false;

    });

}


/* ==================================================
ANALYTICS — BUSINESS OVERVIEW
==================================================
Calculates:

- Total Revenue
- Total Orders
- Average Order Value
================================================== */


function calculateOverview(orders) {

    let revenue = 0;

    orders.forEach(order => {

        /*
           TODO:

           Existing order amount field یہاں لگایا جائے گا۔

           Source:
           firebase-orders.js
        */

    });


    const totalOrders = orders.length;

    const averageOrderValue =
        totalOrders > 0
            ? revenue / totalOrders
            : 0;


    return {

        revenue,
        totalOrders,
        averageOrderValue

    };

}


/* ==================================================
ANALYTICS — BEST SELLING PRODUCTS
================================================== */


function calculateBestSellingProducts(products) {

    /*
       TODO:

       Existing product/order sales structure کے مطابق
       best selling products calculate کیے جائیں گے.

       Source:
       products.js
       firebase-orders.js
    */

    return [];

}


/* ==================================================
ANALYTICS — LOW STOCK PRODUCTS
================================================== */


function calculateLowStockProducts(products) {

    /*
       TODO:

       Existing stock field کے مطابق calculation ہوگی.

       Source:
       products.js
    */

    return [];

}


/* ==================================================
ANALYTICS — TOP SELLERS
================================================== */


function calculateTopSellers(products, orders) {

    /*
       TODO:

       sellerId کے مطابق:

       - Orders
       - Sales
       - Revenue

       calculate کیے جائیں گے۔

       Source:
       product-editor.js
       products.js
       firebase-orders.js
       account.js
    */

    return [];

}


/* ==================================================
ANALYTICS — CATEGORY PERFORMANCE
================================================== */


function calculateCategoryAnalytics(products, orders) {

    /*
       TODO:

       Category-wise:

       - Products
       - Sales
       - Revenue

       calculate کیے جائیں گے۔

       Source:
       category.js
       products.js
       firebase-orders.js
    */

    return [];

}


/* ==================================================
ANALYTICS — CUSTOMER ANALYTICS
================================================== */


function calculateCustomerAnalytics(customers, orders) {

    /*
       TODO:

       Calculate:

       - New Customers
       - Active Customers
       - Returning Customers
       - Total Customers

       Source:
       account.js
       firebase-orders.js
    */

    return {

        newCustomers: 0,
        activeCustomers: 0,
        returningCustomers: 0,
        totalCustomers: customers.length

    };

}


/* ==================================================
ANALYTICS — SALES CHART
================================================== */


function generateSalesChart(orders, days) {

    /*
       TODO:

       Existing orders کے dates اور amounts سے
       real sales chart تیار ہوگا۔

       days:
       7 / 30 / 90

       Source:
       firebase-orders.js
    */

    return [];

}


/* ==================================================
======================================================
UI UPDATE
======================================================
================================================== */


function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent = value;

}


/* ==================================================
FORMAT CURRENCY
================================================== */


function formatCurrency(value) {

    const amount =
        Number(value) || 0;

    return (
        "Rs. " +
        amount.toLocaleString("en-PK", {
            maximumFractionDigits: 0
        })
    );

}


/* ==================================================
UPDATE OVERVIEW UI
================================================== */


function renderOverview(data) {

    updateElement(
        "totalRevenue",
        formatCurrency(data.revenue)
    );


    updateElement(
        "totalOrders",
        data.totalOrders
    );


    updateElement(
        "averageOrderValue",
        formatCurrency(data.averageOrderValue)
    );

}


/* ==================================================
UPDATE ORDER STATUS UI
================================================== */


function renderOrderStatuses(statuses) {

    updateElement(
        "pendingOrders",
        statuses.pending
    );

    updateElement(
        "processingOrders",
        statuses.processing
    );

    updateElement(
        "shippedOrders",
        statuses.shipped
    );

    updateElement(
        "deliveredOrders",
        statuses.delivered
    );

    updateElement(
        "cancelledOrders",
        statuses.cancelled
    );

    updateElement(
        "returnedOrders",
        statuses.returned
    );

}


/* ==================================================
UPDATE PAYMENT UI
================================================== */


function renderPaymentAnalytics(data) {

    updateElement(
        "codOrders",
        `${data.cod.orders} Orders`
    );

    updateElement(
        "codRevenue",
        formatCurrency(data.cod.revenue)
    );


    updateElement(
        "jazzcashOrders",
        `${data.jazzcash.orders} Orders`
    );

    updateElement(
        "jazzcashRevenue",
        formatCurrency(data.jazzcash.revenue)
    );


    updateElement(
        "easypaisaOrders",
        `${data.easypaisa.orders} Orders`
    );

    updateElement(
        "easypaisaRevenue",
        formatCurrency(data.easypaisa.revenue)
    );


    updateElement(
        "otherPaymentOrders",
        `${data.other.orders} Orders`
    );

    updateElement(
        "otherPaymentRevenue",
        formatCurrency(data.other.revenue)
    );

}


/* ==================================================
CUSTOMER UI
================================================== */


function renderCustomerAnalytics(data) {

    updateElement(
        "newCustomers",
        data.newCustomers
    );

    updateElement(
        "activeCustomers",
        data.activeCustomers
    );

    updateElement(
        "returningCustomers",
        data.returningCustomers
    );

    updateElement(
        "customerTotalBottom",
        data.totalCustomers
    );

    updateElement(
        "totalCustomers",
        data.totalCustomers
    );

}


/* ==================================================
PRODUCT LIST RENDERER
================================================== */


function renderAnalyticsList(
    elementId,
    items,
    emptyText = "No data available"
) {

    const container =
        document.getElementById(elementId);

    if (!container) return;


    if (!Array.isArray(items) || items.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                ${emptyText}
            </div>
        `;

        return;

    }


    container.innerHTML =
        items.map(item => {

            /*
               Actual product rendering یہاں آئے گی
               جب products.js کا structure معلوم ہوگا۔
            */

            return `
                <div class="analytics-item">
                    <strong>
                        ${item.name || "Product"}
                    </strong>
                </div>
            `;

        }).join("");

}


/* ==================================================
MAIN ANALYTICS CALCULATION
================================================== */


async function calculateAnalytics() {

    const orders =
        getFilteredOrders();


    const overview =
        calculateOverview(orders);


    const statuses =
        calculateOrderStatuses(orders);


    const payments =
        calculatePaymentAnalytics(orders);


    const bestSelling =
        calculateBestSellingProducts(
            AnalyticsState.products
        );


    const mostViewed =
        calculateMostViewedProducts(
            AnalyticsState.products
        );


    const lowStock =
        calculateLowStockProducts(
            AnalyticsState.products
        );


    const topSellers =
        calculateTopSellers(
            AnalyticsState.products,
            orders
        );


    const categories =
        calculateCategoryAnalytics(
            AnalyticsState.products,
            orders
        );


    const customers =
        calculateCustomerAnalytics(
            AnalyticsState.customers,
            orders
        );


    /* ----------------------------------------------
       RENDER
    ---------------------------------------------- */

    renderOverview(overview);

    renderOrderStatuses(statuses);

    renderPaymentAnalytics(payments);

    renderCustomerAnalytics(customers);


    renderAnalyticsList(
        "bestSellingProducts",
        bestSelling,
        "No best selling products"
    );


    renderAnalyticsList(
        "mostViewedProducts",
        mostViewed,
        "No viewed products"
    );


    renderAnalyticsList(
        "lowStockProducts",
        lowStock,
        "No low stock products"
    );


    renderAnalyticsList(
        "topSellers",
        topSellers,
        "No seller data available"
    );


    renderAnalyticsList(
        "categoryAnalytics",
        categories,
        "No category data available"
    );


    generateSalesChart(
        orders,
        AnalyticsState.chartPeriod
    );

}


/* ==================================================
DATA LOADING CONTROLLER
================================================== */


async function loadAllAnalyticsData() {

    try {

        AnalyticsState.loading = true;


        /*
         ==================================================
         DATA SOURCES
         ==================================================

         IMPORTANT:

         نیچے تمام existing systems ایک ایک کر کے
         connect کیے جائیں گے۔

         ابھی کوئی فرضی Firebase path استعمال نہیں ہوگا۔
         */


        await loadAnalyticsOrders();

        await loadAnalyticsProducts();

        await loadAnalyticsCustomers();

        await loadAnalyticsCategories();

        await loadAnalyticsDeals();

        await loadAnalyticsWishlist();


        /*
         --------------------------------------------------
         بعد میں ضرورت کے مطابق:

         loadJazzCashAnalytics();

         وغیرہ یہاں connect ہوں گے۔
         --------------------------------------------------
         */


        AnalyticsState.lastUpdated =
            new Date();


        await calculateAnalytics();


    } catch (error) {

        console.error(
            "Analytics loading error:",
            error
        );

    } finally {

        AnalyticsState.loading = false;

    }

}


/* ==================================================
LOADING SCREEN
================================================== */


function setAnalyticsLoading(show) {

    const loadingScreen =
        document.getElementById(
            "analyticsLoading"
        );

    if (!loadingScreen) return;


    if (show) {

        loadingScreen.classList.remove(
            "hidden"
        );

    } else {

        loadingScreen.classList.add(
            "hidden"
        );

    }

}


/* ==================================================
REFRESH ANALYTICS
================================================== */


async function refreshAnalytics() {

    setAnalyticsLoading(true);


    try {

        await loadAllAnalyticsData();

    } catch (error) {

        console.error(
            "Analytics refresh failed:",
            error
        );

    } finally {

        setAnalyticsLoading(false);

    }

}


/* ==================================================
PERIOD BUTTONS
================================================== */


function initializePeriodButtons() {

    const buttons =
        document.querySelectorAll(
            ".period-btn"
        );


    const selectedPeriodText =
        document.getElementById(
            "selectedPeriodText"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                AnalyticsState.period =
                    button.dataset.period ||
                    "today";


                if (selectedPeriodText) {

                    selectedPeriodText.textContent =
                        button.textContent.trim();

                }


                await calculateAnalytics();

            }
        );

    });

}


/* ==================================================
CHART PERIOD BUTTONS
================================================== */


function initializeChartButtons() {

    const buttons =
        document.querySelectorAll(
            ".chart-period-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                AnalyticsState.chartPeriod =
                    Number(
                        button.dataset.chartPeriod
                    ) || 7;


                const orders =
                    getFilteredOrders();


                generateSalesChart(
                    orders,
                    AnalyticsState.chartPeriod
                );

            }
        );

    });

}


/* ==================================================
INITIALIZATION
================================================== */


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "SmartBazaar Pro 2 Analytics initialized."
        );


        initializePeriodButtons();

        initializeChartButtons();


        const refreshButton =
            document.getElementById(
                "analyticsRefreshBtn"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refreshAnalytics
            );

        }


        /*
         ==================================================
         INITIAL DATA LOAD
         ==================================================
         */

        await refreshAnalytics();

    }
);
