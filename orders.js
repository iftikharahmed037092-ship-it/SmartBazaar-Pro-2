/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ADMIN ORDERS SYSTEM
FEATURE: FIREBASE ORDERS
FEATURE: ORDER SEARCH
FEATURE: ORDER FILTER
FEATURE: ORDER STATUS UPDATE
FEATURE: ORDER DETAILS
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {

    getDatabase,
    ref,
    get,
    update

} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE DATABASE
==================================================*/

const db =
    getDatabase(app);


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const ordersLoading =
    document.getElementById(
        "ordersLoading"
    );


const ordersError =
    document.getElementById(
        "ordersError"
    );


const ordersErrorMessage =
    document.getElementById(
        "ordersErrorMessage"
    );


const ordersEmpty =
    document.getElementById(
        "ordersEmpty"
    );


const ordersList =
    document.getElementById(
        "ordersList"
    );


const refreshOrdersButton =
    document.getElementById(
        "refreshOrdersButton"
    );


const retryOrdersButton =
    document.getElementById(
        "retryOrdersButton"
    );


const orderSearchInput =
    document.getElementById(
        "orderSearchInput"
    );


const orderStatusFilter =
    document.getElementById(
        "orderStatusFilter"
    );


const paymentMethodFilter =
    document.getElementById(
        "paymentMethodFilter"
    );


const totalOrdersCount =
    document.getElementById(
        "totalOrdersCount"
    );


const pendingOrdersCount =
    document.getElementById(
        "pendingOrdersCount"
    );


const confirmedOrdersCount =
    document.getElementById(
        "confirmedOrdersCount"
    );


const deliveredOrdersCount =
    document.getElementById(
        "deliveredOrdersCount"
    );


const cancelledOrdersCount =
    document.getElementById(
        "cancelledOrdersCount"
    );


const orderDetailsModal =
    document.getElementById(
        "orderDetailsModal"
    );


const orderModalContent =
    document.getElementById(
        "orderModalContent"
    );


const modalOrderId =
    document.getElementById(
        "modalOrderId"
    );


const closeOrderModal =
    document.getElementById(
        "closeOrderModal"
    );


const closeOrderModalBottom =
    document.getElementById(
        "closeOrderModalBottom"
    );


/*==================================================
FEATURE: ORDER STATE
==================================================*/

let allOrders = [];


/*==================================================
FEATURE: INITIALIZE
==================================================*/

initializeOrders();


/*==================================================
FEATURE: INITIALIZE ORDERS
==================================================*/

async function initializeOrders() {

    setupEvents();

    await loadOrders();

}


/*==================================================
FEATURE: EVENTS
==================================================*/

function setupEvents() {


    /* SEARCH */

    orderSearchInput.addEventListener(
        "input",
        renderOrders
    );


    /* STATUS FILTER */

    orderStatusFilter.addEventListener(
        "change",
        renderOrders
    );


    /* PAYMENT FILTER */

    paymentMethodFilter.addEventListener(
        "change",
        renderOrders
    );


    /* REFRESH */

    refreshOrdersButton.addEventListener(
        "click",
        loadOrders
    );


    /* RETRY */

    retryOrdersButton.addEventListener(
        "click",
        loadOrders
    );


    /* CLOSE MODAL */

    closeOrderModal.addEventListener(
        "click",
        closeOrderDetails
    );


    closeOrderModalBottom.addEventListener(
        "click",
        closeOrderDetails
    );


    /* MODAL OVERLAY */

    orderDetailsModal
        .querySelector(
            ".order-modal-overlay"
        )
        .addEventListener(
            "click",
            closeOrderDetails
        );


    /* ESC KEY */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeOrderDetails();

            }

        }
    );

}


/*==================================================
FEATURE: LOAD ORDERS
==================================================*/

async function loadOrders() {

    setLoadingState();


    try {

        const ordersRef =
            ref(
                db,
                "orders"
            );


        const snapshot =
            await get(
                ordersRef
            );


        if (
            !snapshot.exists()
        ) {

            allOrders = [];

            updateStatistics();

            showEmptyState();

            return;

        }


        const data =
            snapshot.val();


        allOrders =
            Object.entries(
                data
            ).map(
                ([key, order]) => ({

                    firebaseKey:
                        key,

                    ...order

                })
            );


        /*==================================================
        FEATURE: SORT NEWEST FIRST
        ==================================================*/

        allOrders.sort(
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


        updateStatistics();


        renderOrders();


    }

    catch (error) {

        console.error(
            "Orders loading error:",
            error
        );


        showOrdersError(
            getFirebaseErrorMessage(
                error
            )
        );

    }

}


/*==================================================
FEATURE: LOADING STATE
==================================================*/

function setLoadingState() {

    ordersLoading.style.display =
        "block";


    ordersError.style.display =
        "none";


    ordersEmpty.style.display =
        "none";


    ordersList.style.display =
        "none";


    refreshOrdersButton.classList.add(
        "loading"
    );

}


/*==================================================
FEATURE: UPDATE STATISTICS
==================================================*/

function updateStatistics() {

    const total =
        allOrders.length;


    const pending =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "pending"
        ).length;


    const confirmed =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "confirmed"
        ).length;


    const delivered =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "delivered"
        ).length;


    const cancelled =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "cancelled"
        ).length;


    totalOrdersCount.textContent =
        total;


    pendingOrdersCount.textContent =
        pending;


    confirmedOrdersCount.textContent =
        confirmed;


    deliveredOrdersCount.textContent =
        delivered;


    cancelledOrdersCount.textContent =
        cancelled;

}


/*==================================================
FEATURE: RENDER ORDERS
==================================================*/

function renderOrders() {

    const search =
        orderSearchInput.value
            .trim()
            .toLowerCase();


    const statusFilter =
        orderStatusFilter.value;


    const paymentFilter =
        paymentMethodFilter.value;


    const filteredOrders =
        allOrders.filter(
            order => {


                /* SEARCH */

                const searchableText = [

                    order.orderId,

                    order.productName,

                    order.customerName,

                    order.customerPhone,

                    order.customerCity,

                    order.customerAddress,

                    order.sellerName

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (
                    search &&
                    !searchableText.includes(
                        search
                    )
                ) {

                    return false;

                }


                /* STATUS */

                if (
                    statusFilter !== "all" &&
                    normalizeStatus(
                        order.status
                    ) !== statusFilter
                ) {

                    return false;

                }


                /* PAYMENT */

                if (
                    paymentFilter !== "all" &&
                    normalizePayment(
                        order.paymentMethod
                    ) !== paymentFilter
                ) {

                    return false;

                }


                return true;

            }
        );


    if (
        filteredOrders.length === 0
    ) {

        showEmptyState();

        return;

    }


    ordersLoading.style.display =
        "none";


    ordersError.style.display =
        "none";


    ordersEmpty.style.display =
        "none";


    ordersList.style.display =
        "grid";


    refreshOrdersButton.classList.remove(
        "loading"
    );


    ordersList.innerHTML =
        filteredOrders
            .map(
                createOrderCard
            )
            .join("");


    setupOrderCardEvents();

}


/*==================================================
FEATURE: CREATE ORDER CARD
==================================================*/

function createOrderCard(
    order
) {

    const status =
        normalizeStatus(
            order.status
        );


    const payment =
        normalizePayment(
            order.paymentMethod
        );


    const image =
        getOrderImage(
            order
        );


    const productName =
        escapeHtml(
            order.productName ||
            "Product"
        );


    const customerName =
        escapeHtml(
            order.customerName ||
            "Customer"
        );


    const customerPhone =
        escapeHtml(
            order.customerPhone ||
            "—"
        );


    const city =
        escapeHtml(
            order.customerCity ||
            "—"
        );


    const orderId =
        escapeHtml(
            order.orderId ||
            order.firebaseKey ||
            "—"
        );


    const quantity =
        Number(
            order.quantity || 1
        );


    const total =
        Number(
            order.total || 0
        );


    const category =
        escapeHtml(
            order.productCategory ||
            "Product"
        );


    const date =
        formatDate(
            order.createdAt
        );


    const statusIcon =
        getStatusIcon(
            status
        );


    return `

        <article
            class="order-card"
            data-order-key="${escapeHtml(order.firebaseKey)}"
        >


            <!--==================================================
            ORDER TOP
            ==================================================-->

            <div class="order-card-top">

                <div class="order-id-area">

                    <div class="order-id-icon">

                        <i class="fa-solid fa-receipt"></i>

                    </div>

                    <div>

                        <span>
                            ORDER ID
                        </span>

                        <strong>
                            ${orderId}
                        </strong>

                    </div>

                </div>


                <span
                    class="order-status status-${status}"
                >

                    <i class="fa-solid ${statusIcon}"></i>

                    ${capitalize(status)}

                </span>

            </div>



            <!--==================================================
            ORDER BODY
            ==================================================-->

            <div class="order-card-body">


                <!-- PRODUCT -->

                <div class="order-product">

                    <div class="order-product-image">

                        ${
                            image
                            ?
                            `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${productName}"
                                loading="lazy"
                            >
                            `
                            :
                            `
                            <div
                                style="
                                    width:100%;
                                    height:100%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    color:#9ca3af;
                                "
                            >
                                <i class="fa-solid fa-image"></i>
                            </div>
                            `
                        }

                    </div>


                    <div class="order-product-info">

                        <h3>
                            ${productName}
                        </h3>

                        <p>
                            ${category}
                        </p>

                        <p>
                            Quantity: ${quantity}
                        </p>

                    </div>

                </div>



                <!-- CUSTOMER -->

                <div class="order-info-block">

                    <span class="info-label">
                        Customer
                    </span>

                    <strong>
                        ${customerName}
                    </strong>

                    <small>
                        ${customerPhone}
                    </small>

                </div>



                <!-- DELIVERY -->

                <div class="order-info-block">

                    <span class="info-label">
                        Delivery
                    </span>

                    <strong>
                        ${city}
                    </strong>

                    <small>
                        ${date}
                    </small>

                </div>



                <!-- PAYMENT -->

                <div class="order-info-block">

                    <span class="info-label">
                        Payment
                    </span>

                    <strong>
                        ${formatPayment(payment)}
                    </strong>

                    <small>
                        ${escapeHtml(
                            order.paymentStatus ||
                            "pending"
                        )}
                    </small>

                </div>


            </div>



            <!--==================================================
            ORDER FOOTER
            ==================================================-->

            <div class="order-card-footer">


                <div class="order-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatPrice(total)}
                    </strong>

                </div>


                <div class="order-actions">


                    <select
                        class="status-select"
                        data-action="status"
                        data-order-key="${escapeHtml(order.firebaseKey)}"
                    >

                        ${createStatusOptions(status)}

                    </select>


                    <button
                        type="button"
                        class="view-order-button"
                        data-action="view"
                        data-order-key="${escapeHtml(order.firebaseKey)}"
                    >

                        <i class="fa-solid fa-eye"></i>

                        View Details

                    </button>


                </div>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: STATUS OPTIONS
==================================================*/

function createStatusOptions(
    currentStatus
) {

    const statuses = [

        "pending",

        "confirmed",

        "processing",

        "shipped",

        "delivered",

        "cancelled"

    ];


    return statuses
        .map(
            status => `

                <option
                    value="${status}"
                    ${
                        status === currentStatus
                        ? "selected"
                        : ""
                    }
                >
                    ${capitalize(status)}
                </option>

            `
        )
        .join("");

}


/*==================================================
FEATURE: CARD EVENTS
==================================================*/

function setupOrderCardEvents() {

    const viewButtons =
        document.querySelectorAll(
            '[data-action="view"]'
        );


    const statusSelects =
        document.querySelectorAll(
            '[data-action="status"]'
        );


    viewButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const key =
                        button.dataset.orderKey;


                    openOrderDetails(
                        key
                    );

                }
            );

        }
    );


    statusSelects.forEach(
        select => {

            select.addEventListener(
                "change",
                async () => {

                    const key =
                        select.dataset.orderKey;


                    const status =
                        select.value;


                    await updateOrderStatus(
                        key,
                        status,
                        select
                    );

                }
            );

        }
    );

}


/*==================================================
FEATURE: UPDATE ORDER STATUS
==================================================*/

async function updateOrderStatus(
    firebaseKey,
    newStatus,
    selectElement
) {

    const order =
        allOrders.find(
            item =>
                item.firebaseKey ===
                firebaseKey
        );


    if (!order) {

        return;

    }


    const oldStatus =
        normalizeStatus(
            order.status
        );


    try {

        selectElement.disabled =
            true;


        const orderRef =
            ref(
                db,
                `orders/${firebaseKey}`
            );


        const updates = {

            status:
                newStatus,

            updatedAt:
                Date.now()

        };


        /*
         * Keep deliveryStatus synchronized
         * with the main order status.
         */

        if (
            newStatus === "shipped"
        ) {

            updates.deliveryStatus =
                "shipped";

        }


        if (
            newStatus === "delivered"
        ) {

            updates.deliveryStatus =
                "delivered";

        }


        if (
            newStatus === "cancelled"
        ) {

            updates.deliveryStatus =
                "cancelled";

        }


        await update(
            orderRef,
            updates
        );


        order.status =
            newStatus;


        order.updatedAt =
            updates.updatedAt;


        if (
            updates.deliveryStatus
        ) {

            order.deliveryStatus =
                updates.deliveryStatus;

        }


        updateStatistics();


        renderOrders();


    }

    catch (error) {

        console.error(
            "Order status update error:",
            error
        );


        selectElement.value =
            oldStatus;


        alert(
            getFirebaseErrorMessage(
                error
            )
        );

    }

    finally {

        selectElement.disabled =
            false;

    }

}


/*==================================================
FEATURE: OPEN ORDER DETAILS
==================================================*/

function openOrderDetails(
    firebaseKey
) {

    const order =
        allOrders.find(
            item =>
                item.firebaseKey ===
                firebaseKey
        );


    if (!order) {

        return;

    }


    modalOrderId.textContent =
        order.orderId ||
        firebaseKey;


    const image =
        getOrderImage(
            order
        );


    const status =
        normalizeStatus(
            order.status
        );


    const payment =
        normalizePayment(
            order.paymentMethod
        );


    orderModalContent.innerHTML = `

        <div class="modal-product">

            ${
                image
                ?
                `
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(order.productName || "Product")}"
                >
                `
                :
                `
                <img
                    src=""
                    alt="Product"
                >
                `
            }


            <div>

                <span class="order-status status-${status}">

                    <i class="fa-solid ${getStatusIcon(status)}"></i>

                    ${capitalize(status)}

                </span>

                <h3>
                    ${escapeHtml(
                        order.productName ||
                        "Product"
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        order.productCategory ||
                        "Product"
                    )}
                </p>

            </div>

        </div>



        <div class="modal-info-grid">


            <div class="modal-info-item">

                <span>
                    Customer Name
                </span>

                <strong>
                    ${escapeHtml(
                        order.customerName ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Mobile Number
                </span>

                <strong>
                    ${escapeHtml(
                        order.customerPhone ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    City
                </span>

                <strong>
                    ${escapeHtml(
                        order.customerCity ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Quantity
                </span>

                <strong>
                    ${Number(order.quantity || 1)}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Product Price
                </span>

                <strong>
                    ${formatPrice(
                        Number(order.price || 0)
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Total
                </span>

                <strong>
                    ${formatPrice(
                        Number(order.total || 0)
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Payment Method
                </span>

                <strong>
                    ${formatPayment(payment)}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Payment Status
                </span>

                <strong>
                    ${escapeHtml(
                        order.paymentStatus ||
                        "pending"
                    )}
                </strong>

            </div>


            <div class="modal-info-item modal-info-full">

                <span>
                    Delivery Address
                </span>

                <strong>
                    ${escapeHtml(
                        order.customerAddress ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-info-item modal-info-full">

                <span>
                    Order Note
                </span>

                <strong>
                    ${escapeHtml(
                        order.customerNote ||
                        "No additional note."
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Seller
                </span>

                <strong>
                    ${escapeHtml(
                        order.sellerName ||
                        "Main Admin"
                    )}
                </strong>

            </div>


            <div class="modal-info-item">

                <span>
                    Order Date
                </span>

                <strong>
                    ${formatDate(
                        order.createdAt
                    )}
                </strong>

            </div>


        </div>

    `;


    orderDetailsModal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";

}


/*==================================================
FEATURE: CLOSE ORDER DETAILS
==================================================*/

function closeOrderDetails() {

    orderDetailsModal.style.display =
        "none";


    document.body.style.overflow =
        "";

}


/*==================================================
FEATURE: EMPTY STATE
==================================================*/

function showEmptyState() {

    ordersLoading.style.display =
        "none";


    ordersError.style.display =
        "none";


    ordersList.style.display =
        "none";


    ordersEmpty.style.display =
        "block";


    refreshOrdersButton.classList.remove(
        "loading"
    );

}


/*==================================================
FEATURE: ERROR STATE
==================================================*/

function showOrdersError(
    message
) {

    ordersLoading.style.display =
        "none";


    ordersList.style.display =
        "none";


    ordersEmpty.style.display =
        "none";


    ordersError.style.display =
        "block";


    ordersErrorMessage.textContent =
        message;


    refreshOrdersButton.classList.remove(
        "loading"
    );

}


/*==================================================
FEATURE: IMAGE
==================================================*/

function getOrderImage(
    order
) {

    if (
        typeof order.productImage ===
        "string" &&
        order.productImage.trim()
    ) {

        return order.productImage;

    }


    if (
        typeof order.image ===
        "string" &&
        order.image.trim()
    ) {

        return order.image;

    }


    return "";

}


/*==================================================
FEATURE: STATUS NORMALIZATION
==================================================*/

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "pending"
        )
            .toLowerCase()
            .trim();


    const allowed = [

        "pending",

        "confirmed",

        "processing",

        "shipped",

        "delivered",

        "cancelled"

    ];


    return allowed.includes(value)
        ? value
        : "pending";

}


/*==================================================
FEATURE: PAYMENT NORMALIZATION
==================================================*/

function normalizePayment(
    payment
) {

    const value =
        String(
            payment ||
            "cod"
        )
            .toLowerCase()
            .trim();


    if (
        value === "jazzcash"
    ) {

        return "jazzcash";

    }


    if (
        value === "easypaisa"
    ) {

        return "easypaisa";

    }


    return "cod";

}


/*==================================================
FEATURE: PAYMENT LABEL
==================================================*/

function formatPayment(
    payment
) {

    if (
        payment === "jazzcash"
    ) {

        return "JazzCash";

    }


    if (
        payment === "easypaisa"
    ) {

        return "EasyPaisa";

    }


    return "Cash on Delivery";

}


/*==================================================
FEATURE: STATUS ICON
==================================================*/

function getStatusIcon(
    status
) {

    const icons = {

        pending:
            "fa-clock",

        confirmed:
            "fa-circle-check",

        processing:
            "fa-gears",

        shipped:
            "fa-truck",

        delivered:
            "fa-box-open",

        cancelled:
            "fa-circle-xmark"

    };


    return (
        icons[status] ||
        "fa-clock"
    );

}


/*==================================================
FEATURE: CAPITALIZE
==================================================*/

function capitalize(
    value
) {

    if (!value) {

        return "";

    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/*==================================================
FEATURE: PRICE
==================================================*/

function formatPrice(
    price
) {

    return (
        "Rs. " +
        Number(
            price || 0
        ).toLocaleString(
            "en-PK"
        )
    );

}


/*==================================================
FEATURE: DATE
==================================================*/

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "—";

    }


    const date =
        new Date(
            Number(timestamp)
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleString(
        "en-PK",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/*==================================================
FEATURE: HTML SECURITY
==================================================*/

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/*==================================================
FEATURE: FIREBASE ERROR MESSAGE
==================================================*/

function getFirebaseErrorMessage(
    error
) {

    const code =
        error?.code ||
        "";


    if (
        code.includes(
            "permission-denied"
        )
    ) {

        return (
            "Firebase permission denied. " +
            "Please check your Realtime Database Rules."
        );

    }


    if (
        code.includes(
            "network"
        )
    ) {

        return (
            "Network connection problem. " +
            "Please check your internet connection."
        );

    }


    return (
        error?.message ||
        "Unable to load or update orders."
    );

}
