/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CUSTOMER ACCOUNT SYSTEM
FEATURE: ACCOUNT DASHBOARD
FEATURE: PROFILE MANAGEMENT
FEATURE: ORDERS
FEATURE: WISHLIST
FEATURE: ADDRESSES
FEATURE: NOTIFICATIONS
FEATURE: SECURITY
FEATURE: ACCOUNT SETTINGS
==================================================*/


/*==================================================
FIREBASE IMPORTS
==================================================*/

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    ref,
    get,
    set,
    update,
    push,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/*==================================================
GLOBAL STATE
==================================================*/

let currentUser = null;

let currentUserData = {};

let currentOrders = [];

let currentWishlist = [];

let currentAddresses = [];

let currentNotifications = [];

let currentSettings = {
    orderNotifications: true,
    deliveryNotifications: true,
    promotionalNotifications: false
};


/*==================================================
DOM HELPERS
==================================================*/

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/*==================================================
DOM ELEMENTS
==================================================*/

const accountLoading = $("#accountLoading");

const accountError = $("#accountError");

const accountErrorMessage = $("#accountErrorMessage");

const accountContent = $("#accountContent");

const profileName = $("#profileName");

const profileEmail = $("#profileEmail");

const profileAvatarLetter = $("#profileAvatarLetter");

const totalOrders = $("#totalOrders");

const wishlistCount = $("#wishlistCount");

const addressCount = $("#addressCount");

const notificationCount = $("#notificationCount");

const ordersNavBadge = $("#ordersNavBadge");

const notificationNavBadge = $("#notificationNavBadge");

const accountFullName = $("#accountFullName");

const accountEmail = $("#accountEmail");

const accountPhone = $("#accountPhone");

const accountCity = $("#accountCity");

const recentOrders = $("#recentOrders");

const accountOrdersList = $("#accountOrdersList");

const wishlistProducts = $("#wishlistProducts");

const addressesList = $("#addressesList");

const notificationsList = $("#notificationsList");


/*==================================================
UTILITY: SHOW / HIDE
==================================================*/

function showElement(element) {

    if (!element) return;

    element.style.display = "";

}


function hideElement(element) {

    if (!element) return;

    element.style.display = "none";

}


/*==================================================
UTILITY: ESCAPE HTML
==================================================*/

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
UTILITY: FORMAT DATE
==================================================*/

function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString(
        "en-PK",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/*==================================================
UTILITY: NUMBER
==================================================*/

function safeNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


/*==================================================
UTILITY: TOAST
==================================================*/

function showToast(message, type = "success") {

    let toast = $("#accountToast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "accountToast";

        toast.className = "account-toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.dataset.type = type;

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/*==================================================
FEATURE: ACCOUNT ERROR
==================================================*/

function showAccountError(message) {

    hideElement(accountLoading);

    hideElement(accountContent);

    showElement(accountError);

    if (accountErrorMessage) {

        accountErrorMessage.textContent = message;

    }

}


/*==================================================
FEATURE: ACCOUNT LOADING
==================================================*/

function showAccountLoading() {

    showElement(accountLoading);

    hideElement(accountError);

    hideElement(accountContent);

}


/*==================================================
FEATURE: ACCOUNT READY
==================================================*/

function showAccountContent() {

    hideElement(accountLoading);

    hideElement(accountError);

    showElement(accountContent);

}


/*==================================================
FEATURE: LOAD USER PROFILE
==================================================*/

async function loadUserProfile(user) {

    try {

        const userRef = ref(
            db,
            `users/${user.uid}`
        );

        const snapshot = await get(userRef);

        if (snapshot.exists()) {

            currentUserData = snapshot.val() || {};

        } else {

            currentUserData = {};

        }

        renderUserProfile(user);

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        currentUserData = {};

        renderUserProfile(user);

    }

}


/*==================================================
FEATURE: RENDER USER PROFILE
==================================================*/

function renderUserProfile(user) {

    const name =
        currentUserData.fullName ||
        currentUserData.name ||
        user.displayName ||
        "SmartBazaar User";

    const email =
        user.email ||
        currentUserData.email ||
        "No email";

    if (profileName) {

        profileName.textContent = name;

    }

    if (profileEmail) {

        profileEmail.textContent = email;

    }

    if (profileAvatarLetter) {

        profileAvatarLetter.textContent =
            name.trim().charAt(0).toUpperCase() || "U";

    }

    if (accountFullName) {

        accountFullName.value =
            currentUserData.fullName ||
            currentUserData.name ||
            user.displayName ||
            "";

    }

    if (accountEmail) {

        accountEmail.value = email;

    }

    if (accountPhone) {

        accountPhone.value =
            currentUserData.phone ||
            currentUserData.mobile ||
            "";

    }

    if (accountCity) {

        accountCity.value =
            currentUserData.city ||
            "";

    }

}


/*==================================================
FEATURE: LOAD ORDERS
==================================================*/

async function loadOrders() {

    if (!currentUser) return;

    try {

        /*
        Supported paths:
        users/{uid}/orders
        orders/{uid}
        */

        let orders = [];

        const userOrdersRef = ref(
            db,
            `users/${currentUser.uid}/orders`
        );

        const userOrdersSnapshot =
            await get(userOrdersRef);

        if (userOrdersSnapshot.exists()) {

            const data =
                userOrdersSnapshot.val();

            orders = convertObjectToArray(data);

        } else {

            const ordersRef = ref(
                db,
                `orders/${currentUser.uid}`
            );

            const ordersSnapshot =
                await get(ordersRef);

            if (ordersSnapshot.exists()) {

                orders =
                    convertObjectToArray(
                        ordersSnapshot.val()
                    );

            }

        }

        currentOrders = orders;

        renderOrders();

        updateStatistics();

    } catch (error) {

        console.error(
            "Orders loading error:",
            error
        );

        currentOrders = [];

        renderOrders();

        updateStatistics();

    }

}


/*==================================================
UTILITY: OBJECT TO ARRAY
==================================================*/

function convertObjectToArray(data) {

    if (!data) return [];

    if (Array.isArray(data)) {

        return data
            .filter(Boolean)
            .map((item, index) => ({
                id: item?.id || String(index),
                ...item
            }));

    }

    return Object.entries(data)
        .map(([id, value]) => {

            if (
                value &&
                typeof value === "object"
            ) {

                return {
                    id,
                    ...value
                };

            }

            return {
                id,
                value
            };

        });

}


/*==================================================
FEATURE: RENDER ORDERS
==================================================*/

function renderOrders() {

    if (!accountOrdersList) return;

    if (!currentOrders.length) {

        accountOrdersList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-box-open"></i>

                <h4>
                    No Orders Yet
                </h4>

                <p>
                    Orders you place will appear here.
                </p>

            </div>

        `;

        if (recentOrders) {

            recentOrders.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-box-open"></i>

                    <h4>
                        No Orders Yet
                    </h4>

                    <p>
                        Your recent orders will appear here.
                    </p>

                </div>

            `;

        }

        return;

    }


    const sortedOrders =
        [...currentOrders]
        .sort(
            (a, b) =>
                safeNumber(b.createdAt || b.timestamp) -
                safeNumber(a.createdAt || a.timestamp)
        );


    accountOrdersList.innerHTML =
        sortedOrders
        .map(createOrderCard)
        .join("");


    if (recentOrders) {

        recentOrders.innerHTML =
            sortedOrders
                .slice(0, 5)
                .map(createRecentOrder)
                .join("");

    }

}


/*==================================================
FEATURE: ORDER CARD
==================================================*/

function createOrderCard(order) {

    const orderId =
        order.orderId ||
        order.id ||
        order.orderID ||
        "Order";

    const status =
        String(
            order.status ||
            "pending"
        ).toLowerCase();

    const total =
        order.total ||
        order.grandTotal ||
        order.amount ||
        0;

    const date =
        order.createdAt ||
        order.timestamp ||
        order.date;

    return `

        <article class="account-order-card">

            <div class="order-card-top">

                <div>

                    <span class="order-label">
                        Order ID
                    </span>

                    <strong>
                        ${escapeHTML(orderId)}
                    </strong>

                </div>

                <span class="
                    order-status
                    status-${escapeHTML(status)}
                ">

                    ${escapeHTML(
                        capitalize(status)
                    )}

                </span>

            </div>


            <div class="order-card-info">

                <div>

                    <span>
                        Date
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(date)
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Total
                    </span>

                    <strong>
                        Rs ${escapeHTML(
                            formatMoney(total)
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Items
                    </span>

                    <strong>
                        ${escapeHTML(
                            getOrderItemCount(order)
                        )}
                    </strong>

                </div>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: RECENT ORDER
==================================================*/

function createRecentOrder(order) {

    const orderId =
        order.orderId ||
        order.id ||
        "Order";

    const status =
        String(
            order.status ||
            "pending"
        ).toLowerCase();

    const total =
        order.total ||
        order.grandTotal ||
        order.amount ||
        0;

    return `

        <div class="recent-order-item">

            <div class="recent-order-icon">

                <i class="fa-solid fa-box"></i>

            </div>

            <div class="recent-order-info">

                <strong>
                    ${escapeHTML(orderId)}
                </strong>

                <span>
                    Rs ${escapeHTML(
                        formatMoney(total)
                    )}
                </span>

            </div>

            <span class="
                order-status
                status-${escapeHTML(status)}
            ">

                ${escapeHTML(
                    capitalize(status)
                )}

            </span>

        </div>

    `;

}


/*==================================================
FEATURE: ORDER ITEM COUNT
==================================================*/

function getOrderItemCount(order) {

    if (Array.isArray(order.items)) {

        return order.items.reduce(
            (total, item) =>
                total +
                safeNumber(
                    item.quantity || 1
                ),
            0
        );

    }

    if (
        order.items &&
        typeof order.items === "object"
    ) {

        return Object.values(order.items)
            .reduce(
                (total, item) =>
                    total +
                    safeNumber(
                        item?.quantity || 1
                    ),
                0
            );

    }

    return safeNumber(
        order.quantity || 1
    );

}


/*==================================================
FEATURE: WISHLIST
==================================================*/

async function loadWishlist() {

    if (!currentUser) return;

    try {

        const wishlistRef = ref(
            db,
            `users/${currentUser.uid}/wishlist`
        );

        const snapshot =
            await get(wishlistRef);

        if (snapshot.exists()) {

            currentWishlist =
                convertObjectToArray(
                    snapshot.val()
                );

        } else {

            currentWishlist = [];

        }

        renderWishlist();

        updateStatistics();

    } catch (error) {

        console.error(
            "Wishlist loading error:",
            error
        );

        currentWishlist = [];

        renderWishlist();

        updateStatistics();

    }

}


/*==================================================
FEATURE: RENDER WISHLIST
==================================================*/

function renderWishlist() {

    if (!wishlistProducts) return;

    if (!currentWishlist.length) {

        wishlistProducts.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-heart"></i>

                <h4>
                    Your Wishlist is Empty
                </h4>

                <p>
                    Save products you love and find them here.
                </p>

                <a
                    href="./index.html"
                    class="empty-action-button"
                >
                    Browse Products
                </a>

            </div>

        `;

        return;

    }


    wishlistProducts.innerHTML =
        currentWishlist
        .map(
            product => `

                <article
                    class="wishlist-product-card"
                >

                    ${
                        product.image
                        ? `
                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}"
                            >
                        `
                        : `
                            <div class="wishlist-no-image">
                                <i class="fa-solid fa-image"></i>
                            </div>
                        `
                    }

                    <div>

                        <h4>
                            ${escapeHTML(
                                product.name ||
                                product.title ||
                                "Product"
                            )}
                        </h4>

                        <strong>
                            Rs ${escapeHTML(
                                formatMoney(
                                    product.price || 0
                                )
                            )}
                        </strong>

                    </div>

                    <button
                        type="button"
                        class="remove-wishlist-button"
                        data-wishlist-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </article>

            `
        )
        .join("");

}


/*==================================================
FEATURE: REMOVE WISHLIST
==================================================*/

async function removeWishlistItem(id) {

    if (!currentUser || !id) return;

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/wishlist/${id}`
            )
        );

        currentWishlist =
            currentWishlist.filter(
                item => item.id !== id
            );

        renderWishlist();

        updateStatistics();

        showToast(
            "Product removed from wishlist."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to remove wishlist item.",
            "error"
        );

    }

}


/*==================================================
FEATURE: LOAD ADDRESSES
==================================================*/

async function loadAddresses() {

    if (!currentUser) return;

    try {

        const addressRef = ref(
            db,
            `users/${currentUser.uid}/addresses`
        );

        const snapshot =
            await get(addressRef);

        if (snapshot.exists()) {

            currentAddresses =
                convertObjectToArray(
                    snapshot.val()
                );

        } else {

            currentAddresses = [];

        }

        renderAddresses();

        updateStatistics();

    } catch (error) {

        console.error(
            "Address loading error:",
            error
        );

        currentAddresses = [];

        renderAddresses();

        updateStatistics();

    }

}


/*==================================================
FEATURE: RENDER ADDRESSES
==================================================*/

function renderAddresses() {

    if (!addressesList) return;

    if (!currentAddresses.length) {

        addressesList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-location-dot"></i>

                <h4>
                    No Saved Addresses
                </h4>

                <p>
                    Add an address for faster checkout.
                </p>

            </div>

        `;

        return;

    }


    addressesList.innerHTML =
        currentAddresses
        .map(
            address => `

                <article
                    class="address-card"
                >

                    <div class="address-card-header">

                        <div>

                            <span class="address-type">

                                <i class="fa-solid fa-location-dot"></i>

                                ${escapeHTML(
                                    address.title ||
                                    "Address"
                                )}

                            </span>

                            ${
                                address.default
                                ? `
                                    <span class="default-address-badge">
                                        Default
                                    </span>
                                `
                                : ""
                            }

                        </div>

                        <button
                            type="button"
                            class="delete-address-button"
                            data-address-id="${escapeHTML(
                                address.id
                            )}"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>


                    <div class="address-details">

                        <strong>
                            ${escapeHTML(
                                address.name || ""
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                address.phone || ""
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                address.city || ""
                            )}
                        </span>

                        <p>
                            ${escapeHTML(
                                address.complete ||
                                address.address ||
                                ""
                            )}
                        </p>

                    </div>

                </article>

            `
        )
        .join("");

}


/*==================================================
FEATURE: SAVE ADDRESS
==================================================*/

async function saveAddress(event) {

    event.preventDefault();

    if (!currentUser) return;


    const title =
        $("#addressTitle")?.value || "Home";

    const name =
        $("#addressName")?.value.trim();

    const phone =
        $("#addressPhone")?.value.trim();

    const city =
        $("#addressCity")?.value.trim();

    const complete =
        $("#addressComplete")?.value.trim();

    const isDefault =
        $("#addressDefault")?.checked || false;


    if (!name || !phone || !city || !complete) {

        showToast(
            "Please fill all required address fields.",
            "error"
        );

        return;

    }


    try {

        const addressesRef = ref(
            db,
            `users/${currentUser.uid}/addresses`
        );

        if (isDefault) {

            const snapshot =
                await get(addressesRef);

            if (snapshot.exists()) {

                const existing =
                    convertObjectToArray(
                        snapshot.val()
                    );

                for (const address of existing) {

                    await update(
                        ref(
                            db,
                            `users/${currentUser.uid}/addresses/${address.id}`
                        ),
                        {
                            default: false
                        }
                    );

                }

            }

        }


        const newAddressRef =
            push(addressesRef);

        await set(
            newAddressRef,
            {
                title,
                name,
                phone,
                city,
                complete,
                default: isDefault,
                createdAt: Date.now()
            }
        );


        closeAddressModal();

        event.target.reset();

        await loadAddresses();

        showToast(
            "Address saved successfully."
        );

    } catch (error) {

        console.error(
            "Address save error:",
            error
        );

        showToast(
            "Unable to save address.",
            "error"
        );

    }

}


/*==================================================
FEATURE: DELETE ADDRESS
==================================================*/

async function deleteAddress(id) {

    if (!currentUser || !id) return;

    const confirmed =
        window.confirm(
            "Delete this saved address?"
        );

    if (!confirmed) return;

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/addresses/${id}`
            )
        );

        currentAddresses =
            currentAddresses.filter(
                address => address.id !== id
            );

        renderAddresses();

        updateStatistics();

        showToast(
            "Address deleted."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to delete address.",
            "error"
        );

    }

}


/*==================================================
FEATURE: LOAD NOTIFICATIONS
==================================================*/

async function loadNotifications() {

    if (!currentUser) return;

    try {

        const notificationsRef = ref(
            db,
            `users/${currentUser.uid}/notifications`
        );

        const snapshot =
            await get(notificationsRef);

        if (snapshot.exists()) {

            currentNotifications =
                convertObjectToArray(
                    snapshot.val()
                );

        } else {

            currentNotifications = [];

        }

        renderNotifications();

        updateStatistics();

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

        currentNotifications = [];

        renderNotifications();

        updateStatistics();

    }

}


/*==================================================
FEATURE: RENDER NOTIFICATIONS
==================================================*/

function renderNotifications() {

    if (!notificationsList) return;

    if (!currentNotifications.length) {

        notificationsList.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-bell"></i>

                <h4>
                    No Notifications
                </h4>

                <p>
                    New account and order updates will appear here.
                </p>

            </div>

        `;

        return;

    }


    const sorted =
        [...currentNotifications]
        .sort(
            (a, b) =>
                safeNumber(
                    b.createdAt || b.timestamp
                ) -
                safeNumber(
                    a.createdAt || a.timestamp
                )
        );


    notificationsList.innerHTML =
        sorted
        .map(
            notification => {

                const read =
                    notification.read === true;

                return `

                    <article class="
                        notification-item
                        ${read ? "read" : "unread"}
                    ">

                        <div class="notification-icon">

                            <i class="fa-regular fa-bell"></i>

                        </div>

                        <div class="notification-content">

                            <strong>
                                ${escapeHTML(
                                    notification.title ||
                                    "SmartBazaar Update"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    notification.message ||
                                    notification.body ||
                                    ""
                                )}
                            </p>

                            <span>
                                ${escapeHTML(
                                    formatDate(
                                        notification.createdAt ||
                                        notification.timestamp
                                    )
                                )}
                            </span>

                        </div>

                    </article>

                `;

            }
        )
        .join("");

}


/*==================================================
FEATURE: MARK NOTIFICATIONS READ
==================================================*/

async function markNotificationsRead() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}/notifications`
                )
            );

        if (!snapshot.exists()) {

            showToast(
                "No notifications to update."
            );

            return;

        }


        const notifications =
            snapshot.val();

        const updates = {};


        Object.keys(notifications)
            .forEach(id => {

                updates[
                    `users/${currentUser.uid}/notifications/${id}/read`
                ] = true;

            });


        await update(
            ref(db),
            updates
        );


        currentNotifications =
            currentNotifications.map(
                item => ({
                    ...item,
                    read: true
                })
            );


        renderNotifications();

        updateStatistics();

        showToast(
            "All notifications marked as read."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to update notifications.",
            "error"
        );

    }

}


/*==================================================
FEATURE: LOAD SETTINGS
==================================================*/

async function loadSettings() {

    if (!currentUser) return;

    try {

        const settingsRef = ref(
            db,
            `users/${currentUser.uid}/settings`
        );

        const snapshot =
            await get(settingsRef);

        if (snapshot.exists()) {

            currentSettings = {
                ...currentSettings,
                ...snapshot.val()
            };

        }

        renderSettings();

    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );

        renderSettings();

    }

}


/*==================================================
FEATURE: RENDER SETTINGS
==================================================*/

function renderSettings() {

    const orderToggle =
        $("#orderNotificationsToggle");

    const deliveryToggle =
        $("#deliveryNotificationsToggle");

    const promotionalToggle =
        $("#promotionalNotificationsToggle");


    if (orderToggle) {

        orderToggle.checked =
            currentSettings.orderNotifications !== false;

    }

    if (deliveryToggle) {

        deliveryToggle.checked =
            currentSettings.deliveryNotifications !== false;

    }

    if (promotionalToggle) {

        promotionalToggle.checked =
            currentSettings.promotionalNotifications === true;

    }

}


/*==================================================
FEATURE: SAVE SETTINGS
==================================================*/

async function saveSettings() {

    if (!currentUser) return;

    const orderNotifications =
        $("#orderNotificationsToggle")?.checked ?? true;

    const deliveryNotifications =
        $("#deliveryNotificationsToggle")?.checked ?? true;

    const promotionalNotifications =
        $("#promotionalNotificationsToggle")?.checked ?? false;


    currentSettings = {
        orderNotifications,
        deliveryNotifications,
        promotionalNotifications
    };


    try {

        await set(
            ref(
                db,
                `users/${currentUser.uid}/settings`
            ),
            currentSettings
        );

        showToast(
            "Account settings saved."
        );

    } catch (error) {

        console.error(
            "Settings save error:",
            error
        );

        showToast(
            "Unable to save settings.",
            "error"
        );

    }

}


/*==================================================
FEATURE: SAVE PROFILE
==================================================*/

async function saveProfile(event) {

    event.preventDefault();

    if (!currentUser) return;


    const fullName =
        accountFullName?.value.trim() || "";

    const phone =
        accountPhone?.value.trim() || "";

    const city =
        accountCity?.value.trim() || "";


    if (!fullName) {

        showToast(
            "Please enter your full name.",
            "error"
        );

        return;

    }


    try {

        await updateProfile(
            currentUser,
            {
                displayName: fullName
            }
        );


        await update(
            ref(
                db,
                `users/${currentUser.uid}`
            ),
            {
                fullName,
                name: fullName,
                phone,
                city,
                email: currentUser.email || "",
                updatedAt: Date.now()
            }
        );


        currentUserData = {
            ...currentUserData,
            fullName,
            name: fullName,
            phone,
            city
        };


        renderUserProfile(
            currentUser
        );


        showToast(
            "Profile updated successfully."
        );

    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );

        showToast(
            "Unable to update profile.",
            "error"
        );

    }

}


/*==================================================
FEATURE: CHANGE PASSWORD
==================================================*/

async function changePassword(event) {

    event.preventDefault();

    if (!currentUser) return;


    const currentPassword =
        $("#currentPassword")?.value || "";

    const newPassword =
        $("#newPassword")?.value || "";

    const confirmPassword =
        $("#confirmPassword")?.value || "";


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showToast(
            "Please fill all password fields.",
            "error"
        );

        return;

    }


    if (newPassword.length < 6) {

        showToast(
            "New password must be at least 6 characters.",
            "error"
        );

        return;

    }


    if (newPassword !== confirmPassword) {

        showToast(
            "New passwords do not match.",
            "error"
        );

        return;

    }


    try {

        const credential =
            EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );


        await reauthenticateWithCredential(
            currentUser,
            credential
        );


        await updatePassword(
            currentUser,
            newPassword
        );


        event.target.reset();

        closePasswordModal();

        showToast(
            "Password changed successfully."
        );

    } catch (error) {

        console.error(
            "Password change error:",
            error
        );


        let message =
            "Unable to change password.";


        if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Current password is incorrect.";

        }

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Current password is incorrect.";

        }


        showToast(
            message,
            "error"
        );

    }

}


/*==================================================
FEATURE: LOGOUT
==================================================*/

function openLogoutModal() {

    const modal =
        $("#logoutModal");

    if (!modal) return;

    modal.style.display = "flex";

    document.body.classList.add(
        "modal-open"
    );

}


function closeLogoutModal() {

    const modal =
        $("#logoutModal");

    if (!modal) return;

    modal.style.display = "none";

    document.body.classList.remove(
        "modal-open"
    );

}


async function performLogout() {

    try {

        await signOut(auth);

        window.location.href =
            "./index.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showToast(
            "Unable to logout.",
            "error"
        );

    }

}


/*==================================================
FEATURE: ADDRESS MODAL
==================================================*/

function openAddressModal() {

    const modal =
        $("#addressModal");

    if (!modal) return;

    modal.style.display = "flex";

    document.body.classList.add(
        "modal-open"
    );

}


function closeAddressModal() {

    const modal =
        $("#addressModal");

    if (!modal) return;

    modal.style.display = "none";

    document.body.classList.remove(
        "modal-open"
    );

}


/*==================================================
FEATURE: PASSWORD MODAL
==================================================*/

function openPasswordModal() {

    const modal =
        $("#passwordModal");

    if (!modal) return;

    modal.style.display = "flex";

    document.body.classList.add(
        "modal-open"
    );

}


function closePasswordModal() {

    const modal =
        $("#passwordModal");

    if (!modal) return;

    modal.style.display = "none";

    document.body.classList.remove(
        "modal-open"
    );

}


/*==================================================
FEATURE: ACCOUNT NAVIGATION
==================================================*/

function openSection(sectionName) {

    if (!sectionName) return;


    $$(".account-nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );

        });


    $$(".account-section")
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.id ===
                `section-${sectionName}`
            );

        });


    const target =
        $(`#section-${sectionName}`);


    if (target) {

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/*==================================================
FEATURE: STATISTICS
==================================================*/

function updateStatistics() {

    const orderCount =
        currentOrders.length;

    const wishCount =
        currentWishlist.length;

    const addressTotal =
        currentAddresses.length;

    const unreadNotifications =
        currentNotifications
        .filter(
            item => item.read !== true
        )
        .length;


    if (totalOrders) {

        totalOrders.textContent =
            orderCount;

    }

    if (wishlistCount) {

        wishlistCount.textContent =
            wishCount;

    }

    if (addressCount) {

        addressCount.textContent =
            addressTotal;

    }

    if (notificationCount) {

        notificationCount.textContent =
            unreadNotifications;

    }

    if (ordersNavBadge) {

        ordersNavBadge.textContent =
            orderCount;

    }

    if (notificationNavBadge) {

        notificationNavBadge.textContent =
            unreadNotifications;

    }

}


/*==================================================
FEATURE: REFRESH ACCOUNT
==================================================*/

async function refreshAccount() {

    if (!currentUser) return;

    showAccountLoading();

    try {

        await loadUserProfile(
            currentUser
        );

        await Promise.all([
            loadOrders(),
            loadWishlist(),
            loadAddresses(),
            loadNotifications(),
            loadSettings()
        ]);

        showAccountContent();

    } catch (error) {

        console.error(
            "Account refresh error:",
            error
        );

        showAccountContent();

    }

}


/*==================================================
UTILITY: CAPITALIZE
==================================================*/

function capitalize(value) {

    if (!value) return "";

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/*==================================================
UTILITY: MONEY
==================================================*/

function formatMoney(value) {

    const number =
        safeNumber(value);

    return number.toLocaleString(
        "en-PK"
    );

}


/*==================================================
EVENT LISTENERS
==================================================*/

function setupEventListeners() {


    /*----------------------------------------------
    ACCOUNT NAVIGATION
    ----------------------------------------------*/

    $$(".account-nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.section
                    );

                }
            );

        });


    /*----------------------------------------------
    QUICK ACTIONS
    ----------------------------------------------*/

    $$(".quick-action-card")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.openSection
                    );

                }
            );

        });


    /*----------------------------------------------
    VIEW ALL
    ----------------------------------------------*/

    $$(".view-all-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection("orders");

                }
            );

        });


    /*----------------------------------------------
    EDIT PROFILE
    ----------------------------------------------*/

    $("#editProfileButton")
        ?.addEventListener(
            "click",
            () => {

                openSection("profile");

            }
        );


    /*----------------------------------------------
    PROFILE FORM
    ----------------------------------------------*/

    $("#profileForm")
        ?.addEventListener(
            "submit",
            saveProfile
        );


    /*----------------------------------------------
    ADD ADDRESS
    ----------------------------------------------*/

    $("#addAddressButton")
        ?.addEventListener(
            "click",
            openAddressModal
        );


    /*----------------------------------------------
    ADDRESS FORM
    ----------------------------------------------*/

    $("#addressForm")
        ?.addEventListener(
            "submit",
            saveAddress
        );


    /*----------------------------------------------
    CLOSE ADDRESS
    ----------------------------------------------*/

    $("#closeAddressModal")
        ?.addEventListener(
            "click",
            closeAddressModal
        );


    $("#cancelAddressButton")
        ?.addEventListener(
            "click",
            closeAddressModal
        );


    /*----------------------------------------------
    PASSWORD
    ----------------------------------------------*/

    $("#changePasswordButton")
        ?.addEventListener(
            "click",
            openPasswordModal
        );


    $("#closePasswordModal")
        ?.addEventListener(
            "click",
            closePasswordModal
        );


    $("#cancelPasswordButton")
        ?.addEventListener(
            "click",
            closePasswordModal
        );


    $("#passwordForm")
        ?.addEventListener(
            "submit",
            changePassword
        );


    /*----------------------------------------------
    NOTIFICATIONS
    ----------------------------------------------*/

    $("#markNotificationsRead")
        ?.addEventListener(
            "click",
            markNotificationsRead
        );


    /*----------------------------------------------
    SETTINGS
    ----------------------------------------------*/

    $("#orderNotificationsToggle")
        ?.addEventListener(
            "change",
            saveSettings
        );


    $("#deliveryNotificationsToggle")
        ?.addEventListener(
            "change",
            saveSettings
        );


    $("#promotionalNotificationsToggle")
        ?.addEventListener(
            "change",
            saveSettings
        );


    /*----------------------------------------------
    LOGOUT
    ----------------------------------------------*/

    $("#logoutButton")
        ?.addEventListener(
            "click",
            openLogoutModal
        );


    $("#logoutButtonTop")
        ?.addEventListener(
            "click",
            openLogoutModal
        );


    $("#cancelLogoutButton")
        ?.addEventListener(
            "click",
            closeLogoutModal
        );


    $("#confirmLogoutButton")
        ?.addEventListener(
            "click",
            performLogout
        );


    /*----------------------------------------------
    WISHLIST DELETE
    ----------------------------------------------*/

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".remove-wishlist-button"
                );

            if (!button) return;

            removeWishlistItem(
                button.dataset.wishlistId
            );

        }
    );


    /*----------------------------------------------
    ADDRESS DELETE
    ----------------------------------------------*/

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".delete-address-button"
                );

            if (!button) return;

            deleteAddress(
                button.dataset.addressId
            );

        }
    );


    /*----------------------------------------------
    MODAL OVERLAYS
    ----------------------------------------------*/

    $$(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                () => {

                    const modal =
                        overlay.closest(
                            ".account-modal"
                        );

                    if (!modal) return;

                    modal.style.display =
                        "none";

                    document.body.classList.remove(
                        "modal-open"
                    );

                }
            );

        });


    /*----------------------------------------------
    ESC KEY
    ----------------------------------------------*/

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;

            closeAddressModal();

            closePasswordModal();

            closeLogoutModal();

        }
    );


    /*----------------------------------------------
    AVATAR BUTTON
    ----------------------------------------------*/

    $("#changeAvatarButton")
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Profile picture upload will be connected with Cloudinary."
                );

            }
        );

}


/*==================================================
FEATURE: AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            currentUser = null;

            showAccountError(
                "Please login to access your SmartBazaar account."
            );

            return;

        }


        currentUser = user;


        try {

            await refreshAccount();

        } catch (error) {

            console.error(
                "Account initialization error:",
                error
            );

            showAccountError(
                "Unable to load your account. Please try again."
            );

        }

    }
);


/*==================================================
INITIALIZE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEventListeners();

    }
);


/*==================================================
SMARTBAZAAR PRO 2
ACCOUNT.JS COMPLETE
==================================================*/
