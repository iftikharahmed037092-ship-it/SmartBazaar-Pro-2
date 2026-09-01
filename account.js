/* =========================================================
   SMARTBAZAAR PRO 2
   CUSTOMER ACCOUNT SYSTEM
   FILE: account.js

   FEATURES:
   001  Account Loading
   002  Header
   003  Mobile Sidebar
   004  Account Application
   005  Profile Hero
   006  Profile Completion
   007  Statistics
   008  Dashboard / Navigation
   009  Address Management
   010  Delete Address
   011  Password Management
   012  Logout
   013  Wishlist
   014  Notifications
   015  Generic Confirmation
   016  Toast System
   017  Upload Progress

   IMPORTANT:
   - Existing HTML classes/IDs are preserved.
   - Firebase configuration is loaded from firebase-config.js.
========================================================= */

import {
    auth,
    db,
    storage
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
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
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/* =========================================================
   FEATURE 001
   GLOBAL STATE
========================================================= */

let currentUser = null;

let currentProfile = {};

let currentOrders = {};

let currentWishlist = {};

let currentAddresses = {};

let currentNotifications = {};

let currentSettings = {};

let editingAddressId = null;

let addressToDelete = null;

let genericConfirmAction = null;

let profileOriginalData = {};

let listenersStarted = false;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


/* =========================================================
   FEATURE 016
   TOAST SYSTEM
========================================================= */

function showToast(message, type = "success") {

    const container = $("accountToastContainer");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `account-toast ${type}`;

    let icon = "fa-circle-check";

    if (type === "error") {
        icon = "fa-circle-exclamation";
    }

    if (type === "warning") {
        icon = "fa-triangle-exclamation";
    }

    if (type === "info") {
        icon = "fa-circle-info";
    }

    toast.innerHTML = `
        <span class="toast-icon">
            <i class="fa-solid ${icon}"></i>
        </span>

        <span class="toast-message"></span>

        <button
            type="button"
            class="toast-close"
            aria-label="Close notification"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    toast.querySelector(".toast-message").textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    const closeToast = () => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);
    };

    toast
        .querySelector(".toast-close")
        .addEventListener("click", closeToast);

    setTimeout(closeToast, 4000);
}


/* =========================================================
   FEATURE 001
   LOADER
========================================================= */

function hideLoader() {

    const loader = $("pageLoader");

    if (!loader) return;

    loader.classList.add("hidden");

    setTimeout(() => {
        loader.style.display = "none";
    }, 400);
}


function showLoader() {

    const loader = $("pageLoader");

    if (!loader) return;

    loader.style.display = "flex";

    requestAnimationFrame(() => {
        loader.classList.remove("hidden");
    });
}


/* =========================================================
   FEATURE 004
   ACCOUNT ERROR
========================================================= */

function showAccountError(message) {

    const errorBox = $("accountError");
    const app = $("accountApp");

    if (errorBox) {
        errorBox.hidden = false;
    }

    if (app) {
        app.hidden = true;
    }

    const messageElement = $("accountErrorMessage");

    if (messageElement) {
        messageElement.textContent = message;
    }

    hideLoader();
}


function hideAccountError() {

    const errorBox = $("accountError");
    const app = $("accountApp");

    if (errorBox) {
        errorBox.hidden = true;
    }

    if (app) {
        app.hidden = false;
    }
}


/* =========================================================
   FEATURE 003
   MOBILE SIDEBAR
========================================================= */

function openMobileSidebar() {

    const sidebar = $("accountSidebar");
    const overlay = $("mobileSidebarOverlay");
    const button = $("mobileMenuButton");

    if (!sidebar) return;

    sidebar.classList.add("mobile-open");

    if (overlay) {
        overlay.hidden = false;

        requestAnimationFrame(() => {
            overlay.classList.add("show");
        });
    }

    if (button) {
        button.setAttribute("aria-expanded", "true");
    }

    document.body.classList.add("account-menu-open");
}


function closeMobileSidebar() {

    const sidebar = $("accountSidebar");
    const overlay = $("mobileSidebarOverlay");
    const button = $("mobileMenuButton");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (overlay) {

        overlay.classList.remove("show");

        setTimeout(() => {
            overlay.hidden = true;
        }, 250);
    }

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }

    document.body.classList.remove("account-menu-open");
}


/* =========================================================
   FEATURE 008
   SECTION NAVIGATION
========================================================= */

function openSection(sectionName) {

    if (!sectionName) return;

    const sections = $$(".account-section");

    sections.forEach(section => {

        const isActive =
            section.dataset.sectionContent === sectionName;

        section.classList.toggle("active", isActive);
    });


    const navItems = $$(".account-nav-item");

    navItems.forEach(item => {

        const isActive =
            item.dataset.section === sectionName;

        item.classList.toggle("active", isActive);
    });


    closeMobileSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (sectionName === "orders") {
        renderOrders();
    }

    if (sectionName === "wishlist") {
        renderWishlist();
    }

    if (sectionName === "addresses") {
        renderAddresses();
    }

    if (sectionName === "notifications") {
        renderNotifications();
    }
}


/* =========================================================
   FEATURE 005
   PROFILE INITIAL
========================================================= */

function getUserInitial(name = "U") {

    const cleanName = String(name).trim();

    if (!cleanName) {
        return "U";
    }

    return cleanName.charAt(0).toUpperCase();
}


/* =========================================================
   FEATURE 005
   PROFILE DATA
========================================================= */

function getProfilePath() {

    if (!currentUser) return null;

    return `users/${currentUser.uid}/profile`;
}


async function loadProfile() {

    if (!currentUser) return;

    try {

        const profileRef = ref(db, getProfilePath());

        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
            currentProfile = snapshot.val() || {};
        } else {
            currentProfile = {};
        }

        profileOriginalData = {
            ...currentProfile
        };

        renderProfile();

    } catch (error) {

        console.error("Profile load error:", error);

        showToast(
            "Unable to load profile information.",
            "error"
        );
    }
}


/* =========================================================
   FEATURE 005
   RENDER PROFILE
========================================================= */

function renderProfile() {

    if (!currentUser) return;

    const name =
        currentProfile.displayName ||
        currentUser.displayName ||
        "Customer";

    const email =
        currentUser.email ||
        currentProfile.email ||
        "No email";

    const initial = getUserInitial(name);


    /* PROFILE HERO */

    if ($("profileName")) {
        $("profileName").textContent = name;
    }

    if ($("profileEmail")) {
        $("profileEmail").textContent = email;
    }

    if ($("profileAvatarInitial")) {
        $("profileAvatarInitial").textContent = initial;
    }

    if ($("sidebarAvatarInitial")) {
        $("sidebarAvatarInitial").textContent = initial;
    }

    if ($("sidebarUserName")) {
        $("sidebarUserName").textContent = name;
    }

    if ($("profileMediaInitial")) {
        $("profileMediaInitial").textContent = initial;
    }


    /* EMAIL */

    if ($("profileEmailInput")) {
        $("profileEmailInput").value = email;
    }


    /* FORM */

    if ($("profileNameInput")) {
        $("profileNameInput").value =
            currentProfile.displayName ||
            currentUser.displayName ||
            "";
    }

    if ($("profilePhoneInput")) {
        $("profilePhoneInput").value =
            currentProfile.phone || "";
    }

    if ($("profileCountryInput")) {
        $("profileCountryInput").value =
            currentProfile.country || "";
    }

    if ($("profileCityInput")) {
        $("profileCityInput").value =
            currentProfile.city || "";
    }

    if ($("profileDobInput")) {
        $("profileDobInput").value =
            currentProfile.dateOfBirth || "";
    }

    if ($("profileGenderInput")) {
        $("profileGenderInput").value =
            currentProfile.gender || "";
    }

    if ($("profilePostalCodeInput")) {
        $("profilePostalCodeInput").value =
            currentProfile.postalCode || "";
    }

    if ($("profileBioInput")) {
        $("profileBioInput").value =
            currentProfile.bio || "";
    }


    /* MEMBER DATE */

    const createdAt =
        currentProfile.createdAt ||
        currentUser.metadata?.creationTime;

    if ($("profileMemberSince")) {

        $("profileMemberSince").textContent =
            createdAt
                ? `Member since ${formatDate(createdAt)}`
                : "Member since —";
    }


    /* LAST LOGIN */

    if ($("lastLoginText")) {

        const loginTime =
            currentUser.metadata?.lastSignInTime;

        $("lastLoginText").textContent =
            loginTime
                ? formatDateTime(loginTime)
                : "Not available";
    }


    /* EMAIL VERIFICATION */

    updateEmailVerificationUI();

    /* MEDIA */

    renderProfilePhoto();

    renderProfileBanner();

    /* COMPLETION */

    calculateProfileCompletion();

    /* BIO COUNTER */

    updateBioCounter();
}


/* =========================================================
   FEATURE 005
   PROFILE PHOTO
========================================================= */

function renderProfilePhoto() {

    const url =
        currentProfile.photoURL ||
        currentUser?.photoURL ||
        "";

    const heroImage = $("profileAvatarImage");
    const heroInitial = $("profileAvatarInitial");

    const sidebarImage = $("sidebarAvatarImage");
    const sidebarInitial = $("sidebarAvatarInitial");

    const mediaImage = $("profileMediaPreview");
    const mediaInitial = $("profileMediaInitial");


    if (url) {

        if (heroImage) {
            heroImage.src = url;
            heroImage.hidden = false;
        }

        if (heroInitial) {
            heroInitial.hidden = true;
        }

        if (sidebarImage) {
            sidebarImage.src = url;
            sidebarImage.hidden = false;
        }

        if (sidebarInitial) {
            sidebarInitial.hidden = true;
        }

        if (mediaImage) {
            mediaImage.src = url;
            mediaImage.hidden = false;
        }

        if (mediaInitial) {
            mediaInitial.hidden = true;
        }

        toggleElement(
            "removeProfilePhotoButton",
            false
        );

        toggleElement(
            "profilePhotoRemoveButton",
            false
        );

    } else {

        if (heroImage) {
            heroImage.hidden = true;
            heroImage.removeAttribute("src");
        }

        if (heroInitial) {
            heroInitial.hidden = false;
        }

        if (sidebarImage) {
            sidebarImage.hidden = true;
            sidebarImage.removeAttribute("src");
        }

        if (sidebarInitial) {
            sidebarInitial.hidden = false;
        }

        if (mediaImage) {
            mediaImage.hidden = true;
            mediaImage.removeAttribute("src");
        }

        if (mediaInitial) {
            mediaInitial.hidden = false;
        }

        toggleElement(
            "removeProfilePhotoButton",
            true
        );

        toggleElement(
            "profilePhotoRemoveButton",
            true
        );
    }
}


/* =========================================================
   FEATURE 005
   PROFILE BANNER
========================================================= */

function renderProfileBanner() {

    const url =
        currentProfile.bannerURL || "";

    const background =
        $("profileBackground");

    const preview =
        $("profileBannerPreview");

    if (background) {

        if (url) {

            background.style.backgroundImage =
                `url("${url}")`;

            background.classList.add(
                "has-banner"
            );

        } else {

            background.style.backgroundImage =
                "";

            background.classList.remove(
                "has-banner"
            );
        }
    }


    if (preview) {

        if (url) {

            preview.style.backgroundImage =
                `url("${url}")`;

            preview.classList.add(
                "has-banner"
            );

            const span =
                preview.querySelector("span");

            if (span) {
                span.style.display = "none";
            }

        } else {

            preview.style.backgroundImage =
                "";

            preview.classList.remove(
                "has-banner"
            );

            const span =
                preview.querySelector("span");

            if (span) {
                span.style.display = "";
            }
        }
    }


    toggleElement(
        "removeProfileBannerButton",
        !url
    );

    toggleElement(
        "profileBannerMediaRemoveButton",
        !url
    );
}


/* =========================================================
   FEATURE 006
   PROFILE COMPLETION
========================================================= */

function calculateProfileCompletion() {

    const fields = [

        currentProfile.displayName ||
        currentUser?.displayName,

        currentProfile.phone,

        currentProfile.country,

        currentProfile.city,

        currentProfile.dateOfBirth,

        currentProfile.gender,

        currentProfile.postalCode,

        currentProfile.bio,

        currentProfile.photoURL ||
        currentUser?.photoURL
    ];

    const completed =
        fields.filter(value =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ).length;

    const total = fields.length;

    const percentage =
        total > 0
            ? Math.round((completed / total) * 100)
            : 0;


    if ($("profileCompletionPercent")) {
        $("profileCompletionPercent").textContent =
            `${percentage}%`;
    }

    if ($("profileCompletionBar")) {
        $("profileCompletionBar").style.width =
            `${percentage}%`;
    }

    if ($("profileCompletionText")) {

        if (percentage === 100) {
            $("profileCompletionText").textContent =
                "Your profile is complete.";
        } else {
            $("profileCompletionText").textContent =
                "Complete your profile for a better experience.";
        }
    }
}


/* =========================================================
   FEATURE 005
   SAVE PROFILE
========================================================= */

async function saveProfile(event) {

    if (event) {
        event.preventDefault();
    }

    if (!currentUser) return;

    const nameInput =
        $("profileNameInput");

    const name =
        nameInput?.value.trim() || "";

    if (!name) {

        showToast(
            "Please enter your full name.",
            "warning"
        );

        nameInput?.focus();

        return;
    }


    const profileData = {

        displayName: name,

        email:
            currentUser.email || "",

        phone:
            $("profilePhoneInput")?.value.trim() || "",

        country:
            $("profileCountryInput")?.value || "",

        city:
            $("profileCityInput")?.value.trim() || "",

        dateOfBirth:
            $("profileDobInput")?.value || "",

        gender:
            $("profileGenderInput")?.value || "",

        postalCode:
            $("profilePostalCodeInput")?.value.trim() || "",

        bio:
            $("profileBioInput")?.value.trim() || "",

        updatedAt:
            new Date().toISOString()
    };


    const button =
        $("saveProfileButton");

    setButtonLoading(
        button,
        true,
        "Saving..."
    );


    try {

        await update(
            ref(db, getProfilePath()),
            profileData
        );


        if (
            currentUser.displayName !== name
        ) {

            await updateProfile(
                currentUser,
                {
                    displayName: name
                }
            );
        }


        currentProfile = {
            ...currentProfile,
            ...profileData
        };

        profileOriginalData = {
            ...currentProfile
        };

        renderProfile();

        showToast(
            "Profile updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Save profile error:",
            error
        );

        showToast(
            "Unable to save your profile.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Save Changes"
        );
    }
}


/* =========================================================
   RESET PROFILE
========================================================= */

function resetProfile() {

    renderProfile();

    showToast(
        "Profile changes have been reset.",
        "info"
    );
}


/* =========================================================
   FEATURE 006
   BIO COUNTER
========================================================= */

function updateBioCounter() {

    const textarea =
        $("profileBioInput");

    const counter =
        $("bioCharacterCount");

    if (!textarea || !counter) return;

    counter.textContent =
        `${textarea.value.length} / 500`;
}


/* =========================================================
   FEATURE 007
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}/orders`
                )
            );

        currentOrders =
            snapshot.exists()
                ? snapshot.val() || {}
                : {};

        renderOrders();

        updateOrderStatistics();

    } catch (error) {

        console.error(
            "Orders load error:",
            error
        );

        currentOrders = {};

        renderOrders();
    }
}


/* =========================================================
   FEATURE 007
   ORDER STATISTICS
========================================================= */

function updateOrderStatistics() {

    const orders =
        Object.values(currentOrders || {});

    let pending = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;

    orders.forEach(order => {

        const status =
            String(
                order.status || "pending"
            ).toLowerCase();

        if (status === "pending") {
            pending++;
        }

        if (status === "processing") {
            processing++;
        }

        if (
            status === "shipped" ||
            status === "out_for_delivery"
        ) {
            shipped++;
        }

        if (status === "delivered") {
            delivered++;
        }
    });


    setText(
        "ordersCount",
        orders.length
    );

    setText(
        "ordersNavBadge",
        orders.length
    );

    setText(
        "pendingOrdersCount",
        pending
    );

    setText(
        "processingOrdersCount",
        processing
    );

    setText(
        "shippedOrdersCount",
        shipped
    );

    setText(
        "deliveredOrdersCount",
        delivered
    );


    renderRecentOrders(
        orders
            .sort(
                (a, b) =>
                    getTimestamp(b.createdAt) -
                    getTimestamp(a.createdAt)
            )
            .slice(0, 5)
    );
}


/* =========================================================
   FEATURE 008
   RENDER ORDERS
========================================================= */

function renderOrders() {

    const container =
        $("ordersList");

    if (!container) return;

    const search =
        $("orderSearchInput")
            ?.value
            .trim()
            .toLowerCase() || "";

    const status =
        $("orderStatusFilter")
            ?.value || "all";


    let orders =
        Object.entries(
            currentOrders || {}
        ).map(([id, order]) => ({
            id,
            ...order
        }));


    orders = orders.filter(order => {

        const orderStatus =
            String(
                order.status || "pending"
            ).toLowerCase();

        const matchesStatus =
            status === "all" ||
            orderStatus === status;

        const searchable =
            `${order.id} ${
                order.orderId || ""
            } ${
                order.productName || ""
            }`.toLowerCase();

        const matchesSearch =
            !search ||
            searchable.includes(search);

        return (
            matchesStatus &&
            matchesSearch
        );
    });


    orders.sort(
        (a, b) =>
            getTimestamp(b.createdAt) -
            getTimestamp(a.createdAt)
    );


    if ($("ordersResultText")) {

        $("ordersResultText").textContent =
            `${orders.length} order${
                orders.length === 1 ? "" : "s"
            } found`;
    }


    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-box-open"></i>

                <h4>
                    No orders found
                </h4>

                <p>
                    No orders match your current filters.
                </p>

                <a
                    href="index.html"
                    class="empty-action-button"
                >
                    Start Shopping
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML =
        orders
            .map(order =>
                createOrderHTML(
                    order
                )
            )
            .join("");
}


/* =========================================================
   RECENT ORDERS
========================================================= */

function renderRecentOrders(orders) {

    const container =
        $("dashboardRecentOrders");

    if (!container) return;

    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-box-open"></i>

                <h4>
                    No orders yet
                </h4>

                <p>
                    Your recent orders will appear here.
                </p>

                <a
                    href="index.html"
                    class="empty-action-button"
                >
                    Start Shopping
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML =
        orders
            .map(order =>
                createOrderHTML(order)
            )
            .join("");
}


/* =========================================================
   ORDER HTML
========================================================= */

function createOrderHTML(order) {

    const status =
        String(
            order.status || "pending"
        ).toLowerCase();

    const orderId =
        order.orderId ||
        order.id ||
        "N/A";

    const productName =
        order.productName ||
        order.product?.name ||
        "Order";

    const image =
        order.image ||
        order.product?.image ||
        "";

    const total =
        order.total ??
        order.totalAmount ??
        order.amount ??
        0;

    return `
        <article class="order-item">

            <div class="order-item-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(productName)}"
                            >
                        `
                        : `
                            <i class="fa-solid fa-box"></i>
                        `
                }

            </div>


            <div class="order-item-info">

                <strong>
                    ${escapeHTML(productName)}
                </strong>

                <span>
                    Order #${escapeHTML(String(orderId))}
                </span>

                <small>
                    ${formatDate(order.createdAt)}
                </small>

            </div>


            <div class="order-item-status">

                <span class="order-status-badge ${escapeAttribute(status)}">
                    ${formatStatus(status)}
                </span>

                <strong>
                    Rs. ${formatMoney(total)}
                </strong>

            </div>

        </article>
    `;
}


/* =========================================================
   FEATURE 007
   LOAD WISHLIST
========================================================= */

async function loadWishlist() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}/wishlist`
                )
            );

        currentWishlist =
            snapshot.exists()
                ? snapshot.val() || {}
                : {};

        renderWishlist();

        updateWishlistStatistics();

    } catch (error) {

        console.error(
            "Wishlist load error:",
            error
        );

        currentWishlist = {};

        renderWishlist();
    }
}


/* =========================================================
   WISHLIST STATISTICS
========================================================= */

function updateWishlistStatistics() {

    const count =
        Object.keys(
            currentWishlist || {}
        ).length;

    setText(
        "wishlistCount",
        count
    );

    setText(
        "wishlistNavBadge",
        count
    );

    setText(
        "wishlistItemCount",
        `${count} item${count === 1 ? "" : "s"}`
    );
}


/* =========================================================
   FEATURE 013
   RENDER WISHLIST
========================================================= */

function renderWishlist() {

    const container =
        $("wishlistProducts");

    if (!container) return;

    const items =
        Object.entries(
            currentWishlist || {}
        ).map(([id, item]) => ({
            id,
            ...item
        }));


    updateWishlistStatistics();


    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-heart"></i>

                <h4>
                    Your wishlist is empty
                </h4>

                <p>
                    Save products you love and find them here later.
                </p>

                <a
                    href="index.html"
                    class="empty-action-button"
                >
                    Browse Products
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML =
        items
            .map(item =>
                createWishlistHTML(item)
            )
            .join("");
}


/* =========================================================
   WISHLIST CARD
========================================================= */

function createWishlistHTML(item) {

    const name =
        item.name ||
        item.productName ||
        "Product";

    const image =
        item.image ||
        item.imageURL ||
        "";

    const price =
        item.price ??
        0;

    const productId =
        item.productId ||
        item.id;


    return `
        <article
            class="wishlist-product-card"
            data-product-id="${escapeAttribute(productId)}"
        >

            <div class="wishlist-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(name)}"
                            >
                        `
                        : `
                            <i class="fa-solid fa-image"></i>
                        `
                }

            </div>


            <div class="wishlist-product-info">

                <h4>
                    ${escapeHTML(name)}
                </h4>

                <strong>
                    Rs. ${formatMoney(price)}
                </strong>

                ${
                    item.addedAt
                        ? `
                            <small>
                                Saved ${formatDate(item.addedAt)}
                            </small>
                        `
                        : ""
                }

            </div>


            <div class="wishlist-product-actions">

                <button
                    type="button"
                    class="danger-outline-button wishlist-remove-button"
                    data-wishlist-id="${escapeAttribute(productId)}"
                    title="Remove from wishlist"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   REMOVE WISHLIST ITEM
========================================================= */

async function removeWishlistItem(id) {

    if (!currentUser || !id) return;

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/wishlist/${id}`
            )
        );

        delete currentWishlist[id];

        renderWishlist();

        showToast(
            "Product removed from wishlist.",
            "success"
        );

    } catch (error) {

        console.error(
            "Wishlist remove error:",
            error
        );

        showToast(
            "Unable to remove product.",
            "error"
        );
    }
}


/* =========================================================
   FEATURE 013
   CLEAR WISHLIST
========================================================= */

async function clearWishlist() {

    if (!currentUser) return;

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/wishlist`
            )
        );

        currentWishlist = {};

        closeModal(
            "clearWishlistModal"
        );

        renderWishlist();

        showToast(
            "Wishlist cleared successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Clear wishlist error:",
            error
        );

        showToast(
            "Unable to clear wishlist.",
            "error"
        );
    }
}


/* =========================================================
   FEATURE 009
   LOAD ADDRESSES
========================================================= */

async function loadAddresses() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}/addresses`
                )
            );

        currentAddresses =
            snapshot.exists()
                ? snapshot.val() || {}
                : {};

        renderAddresses();

        updateAddressStatistics();

    } catch (error) {

        console.error(
            "Addresses load error:",
            error
        );

        currentAddresses = {};

        renderAddresses();
    }
}


/* =========================================================
   ADDRESS STATISTICS
========================================================= */

function updateAddressStatistics() {

    const count =
        Object.keys(
            currentAddresses || {}
        ).length;

    setText(
        "addressesCount",
        count
    );

    setText(
        "addressesNavBadge",
        count
    );
}


/* =========================================================
   FEATURE 009
   RENDER ADDRESSES
========================================================= */

function renderAddresses() {

    const container =
        $("addressesList");

    if (!container) return;

    const addresses =
        Object.entries(
            currentAddresses || {}
        ).map(([id, address]) => ({
            id,
            ...address
        }));


    updateAddressStatistics();


    if (!addresses.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-location-dot"></i>

                <h4>
                    No addresses saved
                </h4>

                <p>
                    Add your first delivery address.
                </p>

                <button
                    type="button"
                    class="empty-action-button"
                    id="emptyAddAddressButton"
                >
                    Add Address
                </button>

            </div>
        `;

        const button =
            $("emptyAddAddressButton");

        button?.addEventListener(
            "click",
            () => openAddressModal()
        );

        return;
    }


    addresses.sort(
        (a, b) =>
            Number(Boolean(b.isDefault)) -
            Number(Boolean(a.isDefault))
    );


    container.innerHTML =
        addresses
            .map(address =>
                createAddressHTML(address)
            )
            .join("");
}


/* =========================================================
   ADDRESS HTML
========================================================= */

function createAddressHTML(address) {

    const id =
        address.id;

    return `
        <article
            class="address-card"
            data-address-id="${escapeAttribute(id)}"
        >

            <div class="address-card-header">

                <div class="address-title">

                    <span class="address-icon">
                        <i class="fa-solid fa-location-dot"></i>
                    </span>

                    <div>

                        <h4>
                            ${escapeHTML(
                                address.name ||
                                "Address"
                            )}
                        </h4>

                        ${
                            address.isDefault
                                ? `
                                    <span class="default-address-badge">
                                        Default
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div class="address-actions">

                    <button
                        type="button"
                        class="secondary-action-button address-edit-button"
                        data-address-id="${escapeAttribute(id)}"
                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>


                    <button
                        type="button"
                        class="danger-outline-button address-delete-button"
                        data-address-id="${escapeAttribute(id)}"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>


            <div class="address-card-body">

                <strong>
                    ${escapeHTML(
                        address.fullName ||
                        ""
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        address.phone ||
                        ""
                    )}
                </span>

                <p>
                    ${escapeHTML(
                        address.address ||
                        ""
                    )}
                </p>

                <span>
                    ${escapeHTML(
                        address.area ||
                        ""
                    )}
                    ${
                        address.area
                            ? ", "
                            : ""
                    }
                    ${escapeHTML(
                        address.city ||
                        ""
                    )}
                    ${
                        address.postalCode
                            ? ` - ${escapeHTML(
                                address.postalCode
                            )}`
                            : ""
                    }
                </span>

            </div>

        </article>
    `;
}


/* =========================================================
   OPEN ADDRESS MODAL
========================================================= */

function openAddressModal(addressId = null) {

    const form =
        $("addressForm");

    if (!form) return;

    editingAddressId =
        addressId;

    const title =
        $("addressModalTitle");

    if (addressId) {

        const address =
            currentAddresses[addressId];

        if (!address) return;

        if (title) {
            title.textContent =
                "Edit Address";
        }

        $("editingAddressId").value =
            addressId;

        $("addressName").value =
            address.name || "";

        $("addressFullName").value =
            address.fullName || "";

        $("addressPhone").value =
            address.phone || "";

        $("addressLine").value =
            address.address || "";

        $("addressCity").value =
            address.city || "";

        $("addressArea").value =
            address.area || "";

        $("addressPostalCode").value =
            address.postalCode || "";

        $("addressDefault").checked =
            Boolean(address.isDefault);

    } else {

        if (title) {
            title.textContent =
                "Add New Address";
        }

        form.reset();

        $("editingAddressId").value =
            "";

        editingAddressId = null;
    }

    openModal("addressModal");
}


/* =========================================================
   SAVE ADDRESS
========================================================= */

async function saveAddress(event) {

    event.preventDefault();

    if (!currentUser) return;


    const name =
        $("addressName")?.value.trim();

    const fullName =
        $("addressFullName")?.value.trim();

    const phone =
        $("addressPhone")?.value.trim();

    const address =
        $("addressLine")?.value.trim();

    const city =
        $("addressCity")?.value.trim();


    if (
        !name ||
        !fullName ||
        !phone ||
        !address ||
        !city
    ) {

        showToast(
            "Please complete all required address fields.",
            "warning"
        );

        return;
    }


    const addressId =
        editingAddressId ||
        `address_${Date.now()}`;


    const isDefault =
        $("addressDefault")?.checked ||
        false;


    const addressData = {

        name,

        fullName,

        phone,

        address,

        city,

        area:
            $("addressArea")?.value.trim() || "",

        postalCode:
            $("addressPostalCode")
                ?.value
                .trim() || "",

        isDefault,

        updatedAt:
            new Date().toISOString()
    };


    const button =
        $("saveAddressButton");

    setButtonLoading(
        button,
        true,
        "Saving..."
    );


    try {

        if (isDefault) {

            await removeDefaultAddressFlags(
                addressId
            );
        }


        await set(
            ref(
                db,
                `users/${currentUser.uid}/addresses/${addressId}`
            ),
            addressData
        );


        currentAddresses[addressId] =
            addressData;


        closeModal(
            "addressModal"
        );

        renderAddresses();

        showToast(
            editingAddressId
                ? "Address updated successfully."
                : "Address added successfully.",
            "success"
        );


        editingAddressId = null;

    } catch (error) {

        console.error(
            "Save address error:",
            error
        );

        showToast(
            "Unable to save address.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Save Address"
        );
    }
}


/* =========================================================
   DEFAULT ADDRESS
========================================================= */

async function removeDefaultAddressFlags(
    exceptId = null
) {

    const updates = {};

    Object.entries(
        currentAddresses || {}
    ).forEach(([id, address]) => {

        if (
            id !== exceptId &&
            address.isDefault
        ) {

            updates[
                `users/${currentUser.uid}/addresses/${id}/isDefault`
            ] = false;
        }
    });


    if (Object.keys(updates).length) {

        await update(
            ref(db),
            updates
        );
    }
}


/* =========================================================
   FEATURE 010
   DELETE ADDRESS
========================================================= */

function askDeleteAddress(addressId) {

    if (!addressId) return;

    addressToDelete =
        addressId;

    openModal(
        "deleteAddressModal"
    );
}


async function deleteAddress() {

    if (
        !currentUser ||
        !addressToDelete
    ) {
        return;
    }

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/addresses/${addressToDelete}`
            )
        );

        delete currentAddresses[
            addressToDelete
        ];

        addressToDelete = null;

        closeModal(
            "deleteAddressModal"
        );

        renderAddresses();

        showToast(
            "Address deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Delete address error:",
            error
        );

        showToast(
            "Unable to delete address.",
            "error"
        );
    }
}


/* =========================================================
   FEATURE 014
   LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}/notifications`
                )
            );

        currentNotifications =
            snapshot.exists()
                ? snapshot.val() || {}
                : {};

        renderNotifications();

        updateNotificationStatistics();

    } catch (error) {

        console.error(
            "Notifications load error:",
            error
        );

        currentNotifications = {};

        renderNotifications();
    }
}


/* =========================================================
   NOTIFICATION STATISTICS
========================================================= */

function updateNotificationStatistics() {

    const notifications =
        Object.values(
            currentNotifications || {}
        );

    const unread =
        notifications.filter(
            item => !item.read
        ).length;

    setText(
        "notificationsCount",
        unread
    );

    setText(
        "notificationsNavBadge",
        unread
    );

    setText(
        "headerNotificationBadge",
        unread
    );
}


/* =========================================================
   FEATURE 014
   RENDER NOTIFICATIONS
========================================================= */

function renderNotifications() {

    const container =
        $("notificationsList");

    if (!container) return;

    const notifications =
        Object.entries(
            currentNotifications || {}
        ).map(([id, item]) => ({
            id,
            ...item
        }));


    notifications.sort(
        (a, b) =>
            getTimestamp(b.createdAt) -
            getTimestamp(a.createdAt)
    );


    updateNotificationStatistics();


    if (!notifications.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-bell"></i>

                <h4>
                    No notifications
                </h4>

                <p>
                    New account and order notifications will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        notifications
            .map(
                notification =>
                    createNotificationHTML(
                        notification
                    )
            )
            .join("");
}


/* =========================================================
   NOTIFICATION HTML
========================================================= */

function createNotificationHTML(
    notification
) {

    const type =
        notification.type ||
        "general";

    let icon =
        "fa-bell";

    if (type === "order") {
        icon = "fa-box-open";
    }

    if (type === "success") {
        icon = "fa-circle-check";
    }

    if (type === "warning") {
        icon = "fa-triangle-exclamation";
    }

    if (type === "security") {
        icon = "fa-shield-halved";
    }


    return `
        <article
            class="notification-item ${
                notification.read
                    ? "read"
                    : "unread"
            }"
            data-notification-id="${escapeAttribute(
                notification.id
            )}"
        >

            <div class="notification-icon">

                <i class="fa-solid ${icon}"></i>

            </div>


            <div class="notification-content">

                <strong>
                    ${escapeHTML(
                        notification.title ||
                        "Notification"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        notification.message ||
                        ""
                    )}
                </p>

                <small>
                    ${formatDateTime(
                        notification.createdAt
                    )}
                </small>

            </div>


            <div class="notification-actions">

                ${
                    !notification.read
                        ? `
                            <button
                                type="button"
                                class="secondary-action-button notification-read-button"
                                data-notification-id="${escapeAttribute(
                                    notification.id
                                )}"
                            >
                                Mark Read
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="danger-outline-button notification-delete-button"
                    data-notification-id="${escapeAttribute(
                        notification.id
                    )}"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   MARK NOTIFICATION READ
========================================================= */

async function markNotificationRead(
    notificationId
) {

    if (!currentUser || !notificationId) {
        return;
    }

    try {

        await update(
            ref(
                db,
                `users/${currentUser.uid}/notifications/${notificationId}`
            ),
            {
                read: true,
                readAt:
                    new Date().toISOString()
            }
        );

        if (
            currentNotifications[
                notificationId
            ]
        ) {

            currentNotifications[
                notificationId
            ].read = true;
        }

        renderNotifications();

    } catch (error) {

        console.error(
            "Notification read error:",
            error
        );
    }
}


/* =========================================================
   MARK ALL NOTIFICATIONS READ
========================================================= */

async function markAllNotificationsRead() {

    if (!currentUser) return;

    const updates = {};

    Object.entries(
        currentNotifications || {}
    ).forEach(([id, notification]) => {

        if (!notification.read) {

            updates[
                `users/${currentUser.uid}/notifications/${id}/read`
            ] = true;

            updates[
                `users/${currentUser.uid}/notifications/${id}/readAt`
            ] = new Date().toISOString();

        }
    });


    if (!Object.keys(updates).length) {

        showToast(
            "All notifications are already read.",
            "info"
        );

        return;
    }


    try {

        await update(
            ref(db),
            updates
        );

        Object.values(
            currentNotifications
        ).forEach(notification => {
            notification.read = true;
        });

        renderNotifications();

        showToast(
            "All notifications marked as read.",
            "success"
        );

    } catch (error) {

        console.error(
            "Mark all read error:",
            error
        );

        showToast(
            "Unable to update notifications.",
            "error"
        );
    }
}


/* =========================================================
   DELETE NOTIFICATION
========================================================= */

async function deleteNotification(
    notificationId
) {

    if (!currentUser || !notificationId) {
        return;
    }

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/notifications/${notificationId}`
            )
        );

        delete currentNotifications[
            notificationId
        ];

        renderNotifications();

    } catch (error) {

        console.error(
            "Delete notification error:",
            error
        );

        showToast(
            "Unable to delete notification.",
            "error"
        );
    }
}


/* =========================================================
   CLEAR NOTIFICATIONS
========================================================= */

async function clearNotifications() {

    if (!currentUser) return;

    try {

        await remove(
            ref(
                db,
                `users/${currentUser.uid}/notifications`
            )
        );

        currentNotifications = {};

        closeModal(
            "clearNotificationsModal"
        );

        renderNotifications();

        showToast(
            "Notifications cleared successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Clear notifications error:",
            error
        );

        showToast(
            "Unable to clear notifications.",
            "error"
        );
    }
}


/* =========================================================
   FEATURE 008
   SETTINGS
========================================================= */

async function loadSettings() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}/settings`
                )
            );

        currentSettings =
            snapshot.exists()
                ? snapshot.val() || {}
                : {};

        renderSettings();

    } catch (error) {

        console.error(
            "Settings load error:",
            error
        );
    }
}


/* =========================================================
   SETTINGS RENDER
========================================================= */

function renderSettings() {

    const defaults = {

        emailNotifications: true,

        orderNotifications: true,

        promotionalNotifications: false,

        wishlistNotifications: true
    };


    const settings = {
        ...defaults,
        ...currentSettings
    };


    if ($("emailNotificationsToggle")) {
        $("emailNotificationsToggle").checked =
            Boolean(
                settings.emailNotifications
            );
    }

    if ($("orderNotificationsToggle")) {
        $("orderNotificationsToggle").checked =
            Boolean(
                settings.orderNotifications
            );
    }

    if ($("promotionalNotificationsToggle")) {
        $("promotionalNotificationsToggle").checked =
            Boolean(
                settings.promotionalNotifications
            );
    }

    if ($("wishlistNotificationsToggle")) {
        $("wishlistNotificationsToggle").checked =
            Boolean(
                settings.wishlistNotifications
            );
    }
}


/* =========================================================
   SAVE SETTINGS
========================================================= */

async function saveSettings() {

    if (!currentUser) return;

    const settings = {

        emailNotifications:
            Boolean(
                $("emailNotificationsToggle")
                    ?.checked
            ),

        orderNotifications:
            Boolean(
                $("orderNotificationsToggle")
                    ?.checked
            ),

        promotionalNotifications:
            Boolean(
                $("promotionalNotificationsToggle")
                    ?.checked
            ),

        wishlistNotifications:
            Boolean(
                $("wishlistNotificationsToggle")
                    ?.checked
            ),

        updatedAt:
            new Date().toISOString()
    };


    const button =
        $("saveSettingsButton");

    setButtonLoading(
        button,
        true,
        "Saving..."
    );


    try {

        await set(
            ref(
                db,
                `users/${currentUser.uid}/settings`
            ),
            settings
        );

        currentSettings =
            settings;

        showToast(
            "Settings saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Save settings error:",
            error
        );

        showToast(
            "Unable to save settings.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Save Settings"
        );
    }
}


/* =========================================================
   FEATURE 011
   PASSWORD MODAL
========================================================= */

function openPasswordModal() {

    $("passwordForm")?.reset();

    resetPasswordStrength();

    openModal(
        "passwordModal"
    );
}


/* =========================================================
   PASSWORD STRENGTH
========================================================= */

function updatePasswordStrength() {

    const password =
        $("newPassword")?.value || "";

    const bars =
        $$(".strength-bars span");

    const text =
        $("passwordStrengthText");

    if (!bars.length || !text) {
        return;
    }


    let score = 0;

    if (password.length >= 6) {
        score++;
    }

    if (password.length >= 10) {
        score++;
    }

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    ) {
        score++;
    }


    bars.forEach(
        (bar, index) => {
            bar.classList.toggle(
                "active",
                index < score
            );
        }
    );


    const labels = [
        "Password strength",
        "Weak",
        "Fair",
        "Good",
        "Strong"
    ];

    text.textContent =
        labels[score] ||
        labels[0];
}


function resetPasswordStrength() {

    const bars =
        $$(".strength-bars span");

    bars.forEach(
        bar =>
            bar.classList.remove(
                "active"
            )
    );

    setText(
        "passwordStrengthText",
        "Password strength"
    );
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function togglePassword(
    targetId,
    button
) {

    const input =
        $(targetId);

    if (!input) return;

    if (input.type === "password") {

        input.type = "text";

        button.setAttribute(
            "aria-label",
            "Hide password"
        );

        const icon =
            button.querySelector("i");

        if (icon) {
            icon.className =
                "fa-solid fa-eye-slash";
        }

    } else {

        input.type = "password";

        button.setAttribute(
            "aria-label",
            "Show password"
        );

        const icon =
            button.querySelector("i");

        if (icon) {
            icon.className =
                "fa-solid fa-eye";
        }
    }
}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changePassword(event) {

    event.preventDefault();

    if (!currentUser) return;


    const currentPassword =
        $("currentPassword")?.value || "";

    const newPassword =
        $("newPassword")?.value || "";

    const confirmPassword =
        $("confirmPassword")?.value || "";


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showToast(
            "Please complete all password fields.",
            "warning"
        );

        return;
    }


    if (newPassword.length < 6) {

        showToast(
            "New password must contain at least 6 characters.",
            "warning"
        );

        return;
    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showToast(
            "New passwords do not match.",
            "warning"
        );

        return;
    }


    if (
        newPassword ===
        currentPassword
    ) {

        showToast(
            "New password must be different.",
            "warning"
        );

        return;
    }


    const button =
        $("savePasswordButton");

    setButtonLoading(
        button,
        true,
        "Updating..."
    );


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


        closeModal(
            "passwordModal"
        );

        $("passwordForm")?.reset();

        resetPasswordStrength();

        showToast(
            "Password updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Password update error:",
            error
        );


        let message =
            "Unable to update password.";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Current password is incorrect.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Current password is incorrect.";

        } else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            message =
                "Too many attempts. Please try again later.";

        } else if (
            error.code ===
            "auth/requires-recent-login"
        ) {

            message =
                "Please log in again before changing your password.";
        }


        showToast(
            message,
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Update Password"
        );
    }
}


/* =========================================================
   FEATURE 011
   EMAIL VERIFICATION
========================================================= */

function updateEmailVerificationUI() {

    const verified =
        Boolean(
            currentUser?.emailVerified
        );


    const status =
        verified
            ? "Verified"
            : "Not Verified";


    setText(
        "dashboardEmailStatus",
        status
    );

    setText(
        "emailVerificationText",
        verified
            ? "Your email address has been verified."
            : "Your email address has not been verified yet."
    );

    setText(
        "emailVerificationBadge",
        status
    );


    toggleElement(
        "verifyEmailButton",
        verified
    );
}


async function verifyEmail() {

    if (!currentUser) return;

    try {

        await sendEmailVerification(
            currentUser
        );

        showToast(
            "Verification email sent. Please check your inbox.",
            "success"
        );

    } catch (error) {

        console.error(
            "Email verification error:",
            error
        );

        showToast(
            "Unable to send verification email.",
            "error"
        );
    }
}


/* =========================================================
   FEATURE 012
   LOGOUT
========================================================= */

function openLogoutModal() {

    openModal(
        "logoutModal"
    );
}


async function confirmLogout() {

    const button =
        $("confirmLogoutButton");

    setButtonLoading(
        button,
        true,
        "Logging out..."
    );


    try {

        await signOut(auth);

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showToast(
            "Unable to logout. Please try again.",
            "error"
        );

        setButtonLoading(
            button,
            false,
            "Logout"
        );
    }
}


/* =========================================================
   FEATURE 017
   UPLOAD PROGRESS
========================================================= */

function showUploadProgress(
    title = "Uploading...",
    text = "Please wait while your image is uploaded."
) {

    const modal =
        $("uploadProgressModal");

    if (!modal) return;

    setText(
        "uploadProgressTitle",
        title
    );

    setText(
        "uploadProgressText",
        text
    );

    setText(
        "uploadProgressPercent",
        "0%"
    );

    if ($("uploadProgressBar")) {
        $("uploadProgressBar").style.width =
            "0%";
    }

    modal.hidden = false;
}


function updateUploadProgress(
    percentage
) {

    const value =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    percentage
                )
            )
        );

    if ($("uploadProgressBar")) {
        $("uploadProgressBar").style.width =
            `${value}%`;
    }

    setText(
        "uploadProgressPercent",
        `${value}%`
    );
}


function hideUploadProgress() {

    const modal =
        $("uploadProgressModal");

    if (!modal) return;

    modal.hidden = true;
}


/* =========================================================
   FEATURE 005
   IMAGE VALIDATION
========================================================= */

function validateImage(
    file,
    maxSizeMB
) {

    if (!file) {
        return false;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showToast(
            "Please select a valid image file.",
            "warning"
        );

        return false;
    }


    const maxBytes =
        maxSizeMB *
        1024 *
        1024;


    if (
        file.size >
        maxBytes
    ) {

        showToast(
            `Image must be smaller than ${maxSizeMB}MB.`,
            "warning"
        );

        return false;
    }

    return true;
}


/* =========================================================
   PROFILE PHOTO UPLOAD
========================================================= */

async function uploadProfilePhoto(
    file
) {

    if (
        !currentUser ||
        !file
    ) {
        return;
    }

    if (
        !validateImage(
            file,
            5
        )
    ) {
        return;
    }


    showUploadProgress(
        "Uploading Profile Photo...",
        "Please wait while your profile photo is uploaded."
    );


    try {

        const filePath =
            `users/${currentUser.uid}/profile/profile-photo-${Date.now()}`;

        const imageRef =
            storageRef(
                storage,
                filePath
            );


        const uploadTask =
            uploadBytesResumable(
                imageRef,
                file
            );


        await new Promise(
            (
                resolve,
                reject
            ) => {

                uploadTask.on(
                    "state_changed",

                    snapshot => {

                        const percentage =
                            (
                                snapshot.bytesTransferred /
                                snapshot.totalBytes
                            ) * 100;

                        updateUploadProgress(
                            percentage
                        );
                    },

                    reject,

                    resolve
                );
            }
        );


        const url =
            await getDownloadURL(
                uploadTask.snapshot.ref
            );


        await updateProfile(
            currentUser,
            {
                photoURL: url
            }
        );


        await update(
            ref(
                db,
                getProfilePath()
            ),
            {
                photoURL: url,
                updatedAt:
                    new Date().toISOString()
            }
        );


        currentProfile.photoURL =
            url;


        renderProfile();

        hideUploadProgress();

        showToast(
            "Profile photo updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Profile photo upload error:",
            error
        );

        hideUploadProgress();

        showToast(
            "Unable to upload profile photo.",
            "error"
        );
    }
}


/* =========================================================
   REMOVE PROFILE PHOTO
========================================================= */

async function removeProfilePhoto() {

    if (!currentUser) return;

    try {

        const oldUrl =
            currentProfile.photoURL ||
            currentUser.photoURL;


        await updateProfile(
            currentUser,
            {
                photoURL: null
            }
        );


        await update(
            ref(
                db,
                getProfilePath()
            ),
            {
                photoURL: null,
                updatedAt:
                    new Date().toISOString()
            }
        );


        if (oldUrl) {

            try {

                const imageRef =
                    storageRef(
                        storage,
                        oldUrl
                    );

                await deleteObject(
                    imageRef
                );

            } catch (storageError) {

                console.warn(
                    "Old photo deletion skipped:",
                    storageError
                );
            }
        }


        currentProfile.photoURL =
            "";

        renderProfile();

        showToast(
            "Profile photo removed.",
            "success"
        );

    } catch (error) {

        console.error(
            "Remove profile photo error:",
            error
        );

        showToast(
            "Unable to remove profile photo.",
            "error"
        );
    }
}


/* =========================================================
   PROFILE BANNER UPLOAD
========================================================= */

async function uploadProfileBanner(
    file
) {

    if (
        !currentUser ||
        !file
    ) {
        return;
    }

    if (
        !validateImage(
            file,
            8
        )
    ) {
        return;
    }


    showUploadProgress(
        "Uploading Cover Banner...",
        "Please wait while your cover banner is uploaded."
    );


    try {

        const filePath =
            `users/${currentUser.uid}/profile/profile-banner-${Date.now()}`;

        const imageRef =
            storageRef(
                storage,
                filePath
            );


        const uploadTask =
            uploadBytesResumable(
                imageRef,
                file
            );


        await new Promise(
            (
                resolve,
                reject
            ) => {

                uploadTask.on(
                    "state_changed",

                    snapshot => {

                        const percentage =
                            (
                                snapshot.bytesTransferred /
                                snapshot.totalBytes
                            ) * 100;

                        updateUploadProgress(
                            percentage
                        );
                    },

                    reject,

                    resolve
                );
            }
        );


        const url =
            await getDownloadURL(
                uploadTask.snapshot.ref
            );


        await update(
            ref(
                db,
                getProfilePath()
            ),
            {
                bannerURL: url,
                updatedAt:
                    new Date().toISOString()
            }
        );


        currentProfile.bannerURL =
            url;


        renderProfile();

        hideUploadProgress();

        showToast(
            "Cover banner updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Banner upload error:",
            error
        );

        hideUploadProgress();

        showToast(
            "Unable to upload cover banner.",
            "error"
        );
    }
}


/* =========================================================
   REMOVE PROFILE BANNER
========================================================= */

async function removeProfileBanner() {

    if (!currentUser) return;

    try {

        await update(
            ref(
                db,
                getProfilePath()
            ),
            {
                bannerURL: null,
                updatedAt:
                    new Date().toISOString()
            }
        );


        currentProfile.bannerURL =
            "";

        renderProfile();

        showToast(
            "Cover banner removed.",
            "success"
        );

    } catch (error) {

        console.error(
            "Remove banner error:",
            error
        );

        showToast(
            "Unable to remove cover banner.",
            "error"
        );
    }
}


/* =========================================================
   MODALS
========================================================= */

function openModal(
    modalId
) {

    const modal =
        $(modalId);

    if (!modal) return;

    modal.hidden = false;

    document.body.classList.add(
        "modal-open"
    );

    requestAnimationFrame(() => {
        modal.classList.add("show");
    });
}


function closeModal(
    modalId
) {

    const modal =
        $(modalId);

    if (!modal) return;

    modal.classList.remove(
        "show"
    );

    setTimeout(() => {

        modal.hidden = true;

        const anyOpenModal =
            $$(".account-modal:not([hidden])")
                .length > 0;

        if (!anyOpenModal) {

            document.body.classList.remove(
                "modal-open"
            );
        }

    }, 200);
}


/* =========================================================
   GENERIC CONFIRMATION
========================================================= */

function openGenericConfirm(
    title,
    message,
    action
) {

    setText(
        "genericConfirmTitle",
        title
    );

    setText(
        "genericConfirmMessage",
        message
    );

    genericConfirmAction =
        action;

    openModal(
        "genericConfirmModal"
    );
}


async function runGenericConfirm() {

    if (
        typeof genericConfirmAction !==
        "function"
    ) {
        return;
    }

    const action =
        genericConfirmAction;

    genericConfirmAction =
        null;

    closeModal(
        "genericConfirmModal"
    );

    try {
        await action();
    } catch (error) {
        console.error(
            "Confirmation action error:",
            error
        );
    }
}


/* =========================================================
   HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        $(id);

    if (element) {
        element.textContent =
            String(value);
    }
}


function toggleElement(
    id,
    hidden
) {

    const element =
        $(id);

    if (element) {
        element.hidden =
            hidden;
    }
}


function setButtonLoading(
    button,
    loading,
    loadingText
) {

    if (!button) return;

    if (loading) {

        button.dataset.originalHTML =
            button.innerHTML;

        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            ${escapeHTML(loadingText)}
        `;

    } else {

        button.disabled = false;

        if (
            button.dataset.originalHTML
        ) {

            button.innerHTML =
                button.dataset.originalHTML;
        }
    }
}


function formatDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        parseDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}


function formatDateTime(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        parseDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}


function parseDate(
    value
) {

    if (
        value instanceof Date
    ) {
        return value;
    }

    if (
        typeof value === "number"
    ) {
        return new Date(value);
    }

    if (
        value?.seconds
    ) {
        return new Date(
            value.seconds * 1000
        );
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}


function getTimestamp(
    value
) {

    const date =
        parseDate(value);

    return date
        ? date.getTime()
        : 0;
}


function formatMoney(
    value
) {

    const number =
        Number(value) || 0;

    return number.toLocaleString(
        "en-PK",
        {
            maximumFractionDigits: 2
        }
    );
}


function formatStatus(
    status
) {

    const value =
        String(
            status || "pending"
        )
        .replaceAll("_", " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

    return value;
}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(
    value
) {

    return escapeHTML(value);
}


/* =========================================================
   FEATURE 007
   CART COUNT
========================================================= */

function loadCartCount() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem(
                    "smartbazaar_cart"
                ) || "[]"
            );

        let count = 0;

        if (Array.isArray(cart)) {

            cart.forEach(item => {

                count +=
                    Number(
                        item.quantity || 1
                    );
            });

        } else if (
            cart &&
            typeof cart === "object"
        ) {

            Object.values(cart)
                .forEach(item => {

                    count +=
                        Number(
                            item.quantity || 1
                        );
                });
        }

        setText(
            "headerCartCount",
            count
        );

    } catch (error) {

        console.warn(
            "Cart count error:",
            error
        );

        setText(
            "headerCartCount",
            0
        );
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function initializeEventListeners() {

    /* MOBILE MENU */

    $("mobileMenuButton")
        ?.addEventListener(
            "click",
            openMobileSidebar
        );

    $("sidebarCloseButton")
        ?.addEventListener(
            "click",
            closeMobileSidebar
        );

    $("mobileSidebarOverlay")
        ?.addEventListener(
            "click",
            closeMobileSidebar
        );


    /* NAVIGATION */

    $$(".account-nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openSection(
                        button.dataset.section
                    )
            );
        });


    /* QUICK ACTIONS */

    $$("[data-open-section]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openSection(
                        button.dataset.openSection
                    )
            );
        });


    /* PROFILE */

    $("profileForm")
        ?.addEventListener(
            "submit",
            saveProfile
        );

    $("resetProfileButton")
        ?.addEventListener(
            "click",
            resetProfile
        );

    $("editProfileButton")
        ?.addEventListener(
            "click",
            () =>
                openSection("profile")
        );


    /* BIO */

    $("profileBioInput")
        ?.addEventListener(
            "input",
            updateBioCounter
        );


    /* PROFILE PHOTO */

    $("avatarEditButton")
        ?.addEventListener(
            "click",
            () =>
                $("profilePhotoInput")?.click()
        );

    $("profilePhotoUploadButton")
        ?.addEventListener(
            "click",
            () =>
                $("profilePhotoInput")?.click()
        );

    $("profilePhotoInput")
        ?.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                if (file) {
                    uploadProfilePhoto(
                        file
                    );
                }

                event.target.value =
                    "";
            }
        );


    $("removeProfilePhotoButton")
        ?.addEventListener(
            "click",
            () =>
                openGenericConfirm(
                    "Remove Profile Photo?",
                    "Your current profile photo will be removed.",
                    removeProfilePhoto
                )
        );


    $("profilePhotoRemoveButton")
        ?.addEventListener(
            "click",
            () =>
                openGenericConfirm(
                    "Remove Profile Photo?",
                    "Your current profile photo will be removed.",
                    removeProfilePhoto
                )
        );


    /* BANNER */

    $("profileBannerUploadButton")
        ?.addEventListener(
            "click",
            () =>
                $("profileBannerInput")?.click()
        );

    $("profileBannerMediaUploadButton")
        ?.addEventListener(
            "click",
            () =>
                $("profileBannerInput")?.click()
        );


    $("profileBannerInput")
        ?.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                if (file) {
                    uploadProfileBanner(
                        file
                    );
                }

                event.target.value =
                    "";
            }
        );


    $("removeProfileBannerButton")
        ?.addEventListener(
            "click",
            () =>
                openGenericConfirm(
                    "Remove Cover Banner?",
                    "Your current cover banner will be removed.",
                    removeProfileBanner
                )
        );


    $("profileBannerMediaRemoveButton")
        ?.addEventListener(
            "click",
            () =>
                openGenericConfirm(
                    "Remove Cover Banner?",
                    "Your current cover banner will be removed.",
                    removeProfileBanner
                )
        );


    /* ORDERS */

    $("orderSearchInput")
        ?.addEventListener(
            "input",
            renderOrders
        );

    $("orderStatusFilter")
        ?.addEventListener(
            "change",
            renderOrders
        );

    $("refreshOrdersButton")
        ?.addEventListener(
            "click",
            async () => {

                await loadOrders();

                showToast(
                    "Orders refreshed.",
                    "success"
                );
            }
        );


    /* WISHLIST */

    $("clearWishlistButton")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "clearWishlistModal"
                )
        );

    $("confirmClearWishlistButton")
        ?.addEventListener(
            "click",
            clearWishlist
        );


    /* ADDRESSES */

    $("addAddressButton")
        ?.addEventListener(
            "click",
            () =>
                openAddressModal()
        );

    $("addressForm")
        ?.addEventListener(
            "submit",
            saveAddress
        );

    $("confirmDeleteAddressButton")
        ?.addEventListener(
            "click",
            deleteAddress
        );


    /* NOTIFICATIONS */

    $("headerNotificationButton")
        ?.addEventListener(
            "click",
            () =>
                openSection(
                    "notifications"
                )
        );

    $("markAllNotificationsRead")
        ?.addEventListener(
            "click",
            markAllNotificationsRead
        );

    $("clearNotificationsButton")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "clearNotificationsModal"
                )
        );

    $("confirmClearNotificationsButton")
        ?.addEventListener(
            "click",
            clearNotifications
        );


    /* SECURITY */

    $("changePasswordButton")
        ?.addEventListener(
            "click",
            openPasswordModal
        );

    $("passwordForm")
        ?.addEventListener(
            "submit",
            changePassword
        );

    $("newPassword")
        ?.addEventListener(
            "input",
            updatePasswordStrength
        );

    $("verifyEmailButton")
        ?.addEventListener(
            "click",
            verifyEmail
        );


    /* SETTINGS */

    $("saveSettingsButton")
        ?.addEventListener(
            "click",
            saveSettings
        );


    /* LOGOUT */

    $("headerLogoutButton")
        ?.addEventListener(
            "click",
            openLogoutModal
        );

    $("sidebarLogoutButton")
        ?.addEventListener(
            "click",
            openLogoutModal
        );

    $("confirmLogoutButton")
        ?.addEventListener(
            "click",
            confirmLogout
        );


    /* GENERIC CONFIRM */

    $("genericConfirmButton")
        ?.addEventListener(
            "click",
            runGenericConfirm
        );


    /* MODAL CLOSE */

    $$("[data-close-modal]")
        .forEach(element => {

            element.addEventListener(
                "click",
                () => {

                    const modalId =
                        element.dataset.closeModal;

                    closeModal(
                        modalId
                    );
                }
            );
        });


    /* PASSWORD TOGGLE */

    $$("[data-password-target]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    togglePassword(
                        button.dataset.passwordTarget,
                        button
                    );
                }
            );
        });


    /* DELEGATED CLICKS */

    document.addEventListener(
        "click",
        event => {

            const editAddress =
                event.target.closest(
                    ".address-edit-button"
                );

            if (editAddress) {

                openAddressModal(
                    editAddress.dataset.addressId
                );

                return;
            }


            const deleteAddress =
                event.target.closest(
                    ".address-delete-button"
                );

            if (deleteAddress) {

                askDeleteAddress(
                    deleteAddress.dataset.addressId
                );

                return;
            }


            const removeWishlist =
                event.target.closest(
                    ".wishlist-remove-button"
                );

            if (removeWishlist) {

                removeWishlistItem(
                    removeWishlist.dataset.wishlistId
                );

                return;
            }


            const markRead =
                event.target.closest(
                    ".notification-read-button"
                );

            if (markRead) {

                markNotificationRead(
                    markRead.dataset.notificationId
                );

                return;
            }


            const deleteNotificationButton =
                event.target.closest(
                    ".notification-delete-button"
                );

            if (deleteNotificationButton) {

                deleteNotification(
                    deleteNotificationButton.dataset.notificationId
                );

                return;
            }
        }
    );


    /* ESCAPE KEY */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            closeMobileSidebar();

            $$(".account-modal:not([hidden])")
                .forEach(modal => {
                    closeModal(
                        modal.id
                    );
                });
        }
    );
}


/* =========================================================
   FIREBASE AUTH
========================================================= */

function initializeAuthentication() {

    onAuthStateChanged(
        auth,
        async user => {

            if (!user) {

                hideLoader();

                window.location.href =
                    "login.html";

                return;
            }


            currentUser =
                user;


            try {

                hideAccountError();

                await Promise.all([
                    loadProfile(),
                    loadOrders(),
                    loadWishlist(),
                    loadAddresses(),
                    loadNotifications(),
                    loadSettings()
                ]);


                loadCartCount();

                updateEmailVerificationUI();

                hideLoader();

            } catch (error) {

                console.error(
                    "Account initialization error:",
                    error
                );

                showAccountError(
                    "We could not load your account. Please try again."
                );
            }
        }
    );
}


/* =========================================================
   RETRY
========================================================= */

async function retryAccount() {

    if (!currentUser) {

        window.location.reload();

        return;
    }

    showLoader();

    hideAccountError();

    try {

        await Promise.all([
            loadProfile(),
            loadOrders(),
            loadWishlist(),
            loadAddresses(),
            loadNotifications(),
            loadSettings()
        ]);

        hideLoader();

    } catch (error) {

        console.error(
            "Retry error:",
            error
        );

        showAccountError(
            "Unable to reload your account."
        );
    }
}


/* =========================================================
   WINDOW EVENTS
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "smartbazaar_cart"
        ) {
            loadCartCount();
        }
    }
);


window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900
        ) {
            closeMobileSidebar();
        }
    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeEventListeners();

        $("accountRetryButton")
            ?.addEventListener(
                "click",
                retryAccount
            );

        initializeAuthentication();
    }
);


/* =========================================================
   GLOBAL DEBUG ACCESS
   Development helper only
========================================================= */

window.SmartBazaarAccount = {

    getUser: () =>
        currentUser,

    getProfile: () =>
        currentProfile,

    getOrders: () =>
        currentOrders,

    getWishlist: () =>
        currentWishlist,

    getAddresses: () =>
        currentAddresses,

    getNotifications: () =>
        currentNotifications,

    openSection,

    showToast
};


/* =========================================================
   END OF ACCOUNT.JS
========================================================= */
