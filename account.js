/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CUSTOMER ACCOUNT SYSTEM
FEATURE: ACCOUNT DASHBOARD
FEATURE: ACCOUNT NAVIGATION
FEATURE: PROFILE MANAGEMENT
FEATURE: ORDERS INTEGRATION
FEATURE: WISHLIST
FEATURE: ADDRESSES
FEATURE: NOTIFICATIONS
FEATURE: ACCOUNT SECURITY
FEATURE: ACCOUNT SETTINGS
==================================================*/

import {
    onAuthStateChanged,
    signOut,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    ref,
    get,
    set,
    push,
    update,
    remove,
    query,
    orderByChild,
    equalTo,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";


/*==================================================
FEATURE: CLOUDINARY PROFILE PICTURE IMPORT
==================================================*/

import {
    uploadToCloudinary,
    CLOUDINARY_FOLDERS
} from "./cloudinary-config.js";

/*==================================================
FEATURE: FIREBASE CONFIG LOADER
==================================================*/

let firebaseConfigModule = null;

let auth = null;
let db = null;


/*==================================================
FEATURE: GLOBAL ACCOUNT STATE
==================================================*/

let currentUser = null;

let currentProfile = {};

let accountOrders = [];

let accountWishlist = [];

let accountAddresses = [];

let accountNotifications = [];

let isSavingProfile = false;


/*==================================================
FEATURE: DOM HELPER
==================================================*/

function $(id) {

    return document.getElementById(id);

}
/*==================================================
FEATURE: PROFILE PICTURE DOM ELEMENTS
==================================================*/

const profilePictureInput =
    $("profilePictureInput");

const profileAvatarImage =
    $("profileAvatarImage");

const profileAvatarLetter =
    $("profileAvatarLetter");

const changeAvatarButton =
    $("changeAvatarButton");

/*==================================================
FEATURE: SAFE TEXT
==================================================*/

function escapeHTML(value) {

    if (value === null || value === undefined) {
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
FEATURE: INITIALIZE FIREBASE
==================================================*/

async function initializeFirebase() {

    try {

        firebaseConfigModule = await import("./firebase-config.js");

        /*
        Support multiple common export names.
        */

        auth =
            firebaseConfigModule.auth ||
            firebaseConfigModule.firebaseAuth ||
            firebaseConfigModule.authentication ||
            null;


        db =
            firebaseConfigModule.db ||
            firebaseConfigModule.database ||
            firebaseConfigModule.firebaseDB ||
            null;


        /*
        If firebase-config exports firebaseConfig
        but does not export initialized services,
        initialize them here.
        */

        if (!auth || !db) {

            const firebaseConfig =
                firebaseConfigModule.firebaseConfig ||
                firebaseConfigModule.config ||
                firebaseConfigModule.default ||
                null;


            if (firebaseConfig) {

                const appModule =
                    await import(
                        "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"
                    );


                const {
                    initializeApp,
                    getApps
                } = appModule;


                const databaseModule =
                    await import(
                        "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js"
                    );


                const authModule =
                    await import(
                        "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"
                    );


                const app =
                    getApps().length
                        ? getApps()[0]
                        : initializeApp(firebaseConfig);


                if (!auth) {

                    auth =
                        authModule.getAuth(app);

                }


                if (!db) {

                    db =
                        databaseModule.getDatabase(app);

                }

            }

        }


        if (!auth) {

            throw new Error(
                "Firebase Authentication is not available."
            );

        }


        if (!db) {

            console.warn(
                "Firebase Realtime Database is not available. Account UI will still work."
            );

        }


        return true;

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        showAccountError(
            "Firebase could not be initialized. Please check firebase-config.js."
        );

        return false;

    }

}


/*==================================================
FEATURE: ACCOUNT LOADING
==================================================*/

function showLoading() {

    const loading = $("accountLoading");
    const content = $("accountContent");
    const error = $("accountError");

    if (loading) {

        loading.style.display = "grid";

    }

    if (content) {

        content.style.display = "none";

    }

    if (error) {

        error.style.display = "none";

    }

}


/*==================================================
FEATURE: SHOW ACCOUNT CONTENT
==================================================*/

function showAccountContent() {

    const loading = $("accountLoading");
    const content = $("accountContent");
    const error = $("accountError");

    if (loading) {

        loading.style.display = "none";

    }

    if (error) {

        error.style.display = "none";

    }

    if (content) {

        content.style.display = "block";

    }

}


/*==================================================
FEATURE: ACCOUNT ERROR
==================================================*/

function showAccountError(message) {

    const loading = $("accountLoading");
    const content = $("accountContent");
    const error = $("accountError");
    const errorMessage = $("accountErrorMessage");

    if (loading) {

        loading.style.display = "none";

    }

    if (content) {

        content.style.display = "none";

    }

    if (error) {

        error.style.display = "flex";

    }

    if (errorMessage) {

        errorMessage.textContent = message;

    }

}


/*==================================================
FEATURE: ACCOUNT NAVIGATION
IMPORTANT:
ONLY ONE BUTTON CAN BE ACTIVE AT A TIME
==================================================*/

function setupAccountNavigation() {

    const navItems =
        document.querySelectorAll(
            ".account-nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".account-section"
        );


    function openSection(sectionName) {

        if (!sectionName) {

            sectionName = "overview";

        }


        /*
        Remove active from ALL navigation items first.
        */

        navItems.forEach(item => {

            item.classList.remove("active");

        });


        /*
        Add active ONLY to selected navigation item.
        */

        navItems.forEach(item => {

            if (
                item.dataset.section === sectionName
            ) {

                item.classList.add("active");

            }

        });


        /*
        Hide ALL account sections.
        */

        sections.forEach(section => {

            section.classList.remove("active");

        });


        /*
        Show ONLY selected section.
        */

        const targetSection =
            $(
                `section-${sectionName}`
            );


        if (targetSection) {

            targetSection.classList.add("active");

        }


        /*
        Also scroll to section on mobile.
        */

        if (
            window.innerWidth <= 767 &&
            targetSection
        ) {

            setTimeout(() => {

                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 80);

        }


        /*
        Save currently selected section.
        */

        try {

            localStorage.setItem(
                "smartbazaar_account_section",
                sectionName
            );

        } catch (error) {

            console.warn(
                "Could not save account section."
            );

        }


        /*
        Refresh dynamic content.
        */

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


    /*
    Sidebar navigation click.
    */

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                openSection(
                    item.dataset.section
                );

            }
        );

    });


    /*
    Quick action buttons.
    */

    const quickActions =
        document.querySelectorAll(
            "[data-open-section]"
        );


    quickActions.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const sectionName =
                    button.dataset.openSection;


                openSection(sectionName);

            }
        );

    });


    /*
    Edit Profile opens Profile section.
    */

    const editProfileButton =
        $("editProfileButton");


    if (editProfileButton) {

        editProfileButton.addEventListener(
            "click",
            () => {

                openSection("profile");

            }
        );

    }


    /*
    Restore previous section.
    */

    let savedSection = "overview";

    try {

        savedSection =
            localStorage.getItem(
                "smartbazaar_account_section"
            ) || "overview";

    } catch (error) {

        savedSection = "overview";

    }


    /*
    Validate section.
    */

    const validSections = [
        "overview",
        "profile",
        "orders",
        "my-products",
        "wishlist",
        "addresses",
        "notifications",
        "security",
        "settings"
    ];


    if (
        !validSections.includes(
            savedSection
        )
    ) {

        savedSection = "overview";

    }


    openSection(savedSection);

}


/*==================================================
FEATURE: PROFILE LOAD
==================================================*/

async function loadProfile() {

    if (!currentUser) {

        return;

    }


    const defaultName =
        currentUser.displayName ||
        currentUser.email?.split("@")[0] ||
        "SmartBazaar User";


    currentProfile = {

        uid: currentUser.uid,

        fullName:
            defaultName,

        email:
            currentUser.email || "",

        phone: "",

        city: "",

        photoURL:
            currentUser.photoURL || ""

    };


    /*
    Try loading profile from:
    users/{uid}
    */

    if (db) {

        try {

            const userRef =
                ref(
                    db,
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
                "Could not load user profile:",
                error
            );

        }

    }


    updateProfileUI();

}


/*==================================================
FEATURE: UPDATE PROFILE UI
==================================================*/

function updateProfileUI() {

    const fullName =
        currentProfile.fullName ||
        currentUser?.displayName ||
        "SmartBazaar User";


    const email =
        currentProfile.email ||
        currentUser?.email ||
        "";


    /*
    Hero profile.
    */

    const profileName =
        $("profileName");


    const profileEmail =
        $("profileEmail");


    const avatarLetter =
    $("profileAvatarLetter");

const avatarImage =
    $("profileAvatarImage");


if (profileName) {

    profileName.textContent =
        fullName;

}


if (profileEmail) {

    profileEmail.textContent =
        email;

}


/*
Profile picture display.
*/

if (
    avatarImage &&
    currentProfile.photoURL
) {

    avatarImage.src =
        currentProfile.photoURL;

    avatarImage.hidden =
        false;

    if (avatarLetter) {

        avatarLetter.hidden =
            true;

    }

} else {

    if (avatarImage) {

        avatarImage.hidden =
            true;

        avatarImage.removeAttribute(
            "src"
        );

    }

    if (avatarLetter) {

        avatarLetter.hidden =
            false;

        avatarLetter.textContent =
            getInitial(
                fullName
            );

    }

}

    /*
    Form fields.
    */

    const nameInput =
        $("accountFullName");


    const emailInput =
        $("accountEmail");


    const phoneInput =
        $("accountPhone");


    const cityInput =
        $("accountCity");


    if (nameInput) {

        nameInput.value =
            currentProfile.fullName || "";

    }


    if (emailInput) {

        emailInput.value =
            email;

    }


    if (phoneInput) {

        phoneInput.value =
            currentProfile.phone || "";

    }


    if (cityInput) {

        cityInput.value =
            currentProfile.city || "";

    }

}


/*==================================================
FEATURE: INITIAL LETTER
==================================================*/

function getInitial(name) {

    if (!name) {

        return "U";

    }


    const cleanName =
        String(name).trim();


    if (!cleanName) {

        return "U";

    }


    return cleanName
        .charAt(0)
        .toUpperCase();

}


/*==================================================
FEATURE: PROFILE FORM
==================================================*/

function setupProfileForm() {

    const form =
        $("profileForm");


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            if (isSavingProfile) {

                return;

            }


            const fullName =
                $("accountFullName")?.value.trim() || "";


            const phone =
                $("accountPhone")?.value.trim() || "";


            const city =
                $("accountCity")?.value.trim() || "";


            if (!fullName) {

                alert(
                    "Please enter your full name."
                );

                return;

            }


            if (
                phone &&
                !/^03\d{9}$/.test(phone)
            ) {

                alert(
                    "Please enter a valid Pakistani mobile number, e.g. 03XXXXXXXXX."
                );

                return;

            }


            isSavingProfile = true;


            const saveButton =
                form.querySelector(
                    ".save-button"
                );


            const originalText =
                saveButton
                    ? saveButton.innerHTML
                    : "";


            if (saveButton) {

                saveButton.disabled = true;

                saveButton.innerHTML =
                    `<i class="fa-solid fa-spinner fa-spin"></i>
                     Saving...`;

            }


            try {

                currentProfile = {

                    ...currentProfile,

                    fullName,

                    phone,

                    city,

                    email:
                        currentUser.email || "",

                    uid:
                        currentUser.uid

                };


                /*
                Update Firebase Authentication
                display name.
                */

                await updateProfile(
                    currentUser,
                    {
                        displayName:
                            fullName
                    }
                );


                /*
                Save extended profile.
                */

                if (db) {

                    await update(
                        ref(
                            db,
                            `users/${currentUser.uid}`
                        ),
                        {

                            uid:
                                currentUser.uid,

                            fullName,

                            email:
                                currentUser.email || "",

                            phone,

                            city,

                            updatedAt:
                                Date.now()

                        }
                    );

                }


                updateProfileUI();


                alert(
                    "Profile updated successfully."
                );

            } catch (error) {

                console.error(
                    "Profile save error:",
                    error
                );


                alert(
                    getFirebaseErrorMessage(
                        error
                    )
                );

            } finally {

                isSavingProfile = false;


                if (saveButton) {

                    saveButton.disabled = false;

                    saveButton.innerHTML =
                        originalText;

                }

            }

        }
    );

}


/*==================================================
FEATURE: ORDERS
==================================================*/

async function loadOrders() {

    accountOrders = [];


    if (!currentUser) {

        return;

    }


    if (!db) {

        renderOrders();

        updateStatistics();

        return;

    }


    /*
    First try root orders.
    Most ecommerce checkout systems save:
    orders/{orderId}
    */

    try {

        const ordersRef =
            ref(
                db,
                "orders"
            );


        const snapshot =
            await get(ordersRef);


        if (snapshot.exists()) {

            const data =
                snapshot.val();


            const ordersArray =
                objectToArray(data);


            accountOrders =
                ordersArray.filter(
                    order => {

                        return orderBelongsToUser(
                            order,
                            currentUser
                        );

                    }
                );

        }

    } catch (error) {

        console.warn(
            "Root orders could not be loaded:",
            error
        );

    }


    /*
    If root orders did not work,
    try users/{uid}/orders.
    */

    if (
        accountOrders.length === 0
    ) {

        try {

            const userOrdersRef =
                ref(
                    db,
                    `users/${currentUser.uid}/orders`
                );


            const snapshot =
                await get(userOrdersRef);


            if (snapshot.exists()) {

                accountOrders =
                    objectToArray(
                        snapshot.val()
                    );

            }

        } catch (error) {

            console.warn(
                "User orders could not be loaded:",
                error
            );

        }

    }


    /*
    Newest first.
    */

    accountOrders.sort(
        (a, b) => {

            const dateA =
                Number(
                    a.createdAt ||
                    a.timestamp ||
                    a.dateTimestamp ||
                    0
                );


            const dateB =
                Number(
                    b.createdAt ||
                    b.timestamp ||
                    b.dateTimestamp ||
                    0
                );


            return dateB - dateA;

        }
    );


    renderOrders();

    updateStatistics();

}


/*==================================================
FEATURE: CHECK ORDER OWNER
==================================================*/

function orderBelongsToUser(
    order,
    user
) {

    if (!order || !user) {

        return false;

    }


    const uid =
        user.uid;


    const email =
        String(
            user.email || ""
        ).toLowerCase();


    const possibleUIDs = [

        order.uid,

        order.userId,

        order.customerUid,

        order.customerId,

        order.buyerUid,

        order.buyerId,

        order.createdBy

    ];


    const uidMatch =
        possibleUIDs.some(
            value =>
                value &&
                String(value) === uid
        );


    if (uidMatch) {

        return true;

    }


    const possibleEmails = [

        order.email,

        order.customerEmail,

        order.buyerEmail,

        order.userEmail

    ];


    const emailMatch =
        possibleEmails.some(
            value =>
                value &&
                String(value).toLowerCase() === email
        );


    return emailMatch;

}


/*==================================================
FEATURE: OBJECT TO ARRAY
==================================================*/

function objectToArray(data) {

    if (!data) {

        return [];

    }


    if (Array.isArray(data)) {

        return data
            .filter(Boolean)
            .map(
                (item, index) => ({
                    ...item,
                    _key:
                        item?._key ||
                        String(index)
                })
            );

    }


    return Object.entries(data)
        .map(
            ([key, value]) => ({

                ...(value || {}),

                _key: key

            })
        );

}


/*==================================================
FEATURE: RENDER ORDERS
==================================================*/

function renderOrders() {

    const container =
        $("accountOrdersList");


    const recentContainer =
        $("recentOrders");


    if (!container) {

        return;

    }


    if (
        !accountOrders ||
        accountOrders.length === 0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-solid fa-box-open",
                "No Orders Yet",
                "Orders you place will appear here."
            );

    } else {

        container.innerHTML =
            accountOrders
                .map(
                    order =>
                        orderCardHTML(
                            order
                        )
                )
                .join("");

    }


    /*
    Recent orders on Overview.
    */

    if (recentContainer) {

        const recent =
            accountOrders.slice(
                0,
                3
            );


        if (recent.length === 0) {

            recentContainer.innerHTML =
                emptyStateHTML(
                    "fa-solid fa-box-open",
                    "No Orders Yet",
                    "Your recent orders will appear here."
                );

        } else {

            recentContainer.innerHTML =
                recent
                    .map(
                        order =>
                            recentOrderHTML(
                                order
                            )
                    )
                    .join("");

        }

    }

}


/*==================================================
FEATURE: ORDER CARD
==================================================*/

function orderCardHTML(order) {

    const orderId =
        order.orderId ||
        order.id ||
        order._key ||
        "Order";


    const status =
        normalizeStatus(
            order.status
        );


    const payment =
        order.paymentMethod ||
        order.payment ||
        "â€”";


    const total =
        order.total ??
        order.totalAmount ??
        order.grandTotal ??
        order.amount ??
        0;


    const date =
        formatDate(
            order.createdAt ||
            order.timestamp ||
            order.date
        );


    const productName =
        getOrderProductName(
            order
        );


    return `

        <article
            class="account-order-item"
            data-order-id="${escapeHTML(orderId)}"
        >

            <div class="account-order-icon">

                <i class="fa-solid fa-box-open"></i>

            </div>


            <div class="account-order-main">

                <div class="account-order-top">

                    <strong>
                        ${escapeHTML(orderId)}
                    </strong>

                    <span class="order-status status-${escapeHTML(status)}">
                        ${escapeHTML(capitalize(status))}
                    </span>

                </div>


                <div class="account-order-product">

                    ${escapeHTML(productName)}

                </div>


                <div class="account-order-meta">

                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${escapeHTML(date)}
                    </span>

                    <span>
                        <i class="fa-solid fa-credit-card"></i>
                        ${escapeHTML(payment)}
                    </span>

                </div>

            </div>


            <div class="account-order-total">

                <span>
                    Total
                </span>

                <strong>
                    Rs ${formatMoney(total)}
                </strong>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: RECENT ORDER
==================================================*/

function recentOrderHTML(order) {

    const orderId =
        order.orderId ||
        order.id ||
        order._key ||
        "Order";


    const status =
        normalizeStatus(
            order.status
        );


    const total =
        order.total ??
        order.totalAmount ??
        order.grandTotal ??
        order.amount ??
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
                    ${escapeHTML(
                        formatDate(
                            order.createdAt ||
                            order.timestamp ||
                            order.date
                        )
                    )}
                </span>

            </div>


            <div class="recent-order-right">

                <strong>
                    Rs ${formatMoney(total)}
                </strong>

                <span class="order-status status-${escapeHTML(status)}">
                    ${escapeHTML(capitalize(status))}
                </span>

            </div>

        </div>

    `;

}


/*==================================================
FEATURE: GET PRODUCT NAME
==================================================*/

function getOrderProductName(order) {

    if (order.productName) {

        return order.productName;

    }


    if (order.title) {

        return order.title;

    }


    if (
        order.product &&
        typeof order.product === "object"
    ) {

        return (
            order.product.name ||
            order.product.title ||
            "Product"
        );

    }


    if (
        Array.isArray(order.items) &&
        order.items.length
    ) {

        const first =
            order.items[0];


        return (
            first?.productName ||
            first?.name ||
            first?.title ||
            "Multiple Products"
        );

    }


    return "SmartBazaar Order";

}


/*==================================================
FEATURE: WISHLIST
==================================================*/

async function loadWishlist() {

    accountWishlist = [];


    if (!currentUser) {

        return;

    }


    /*
    Try:
    users/{uid}/wishlist
    */

    if (db) {

        try {

            const wishlistRef =
                ref(
                    db,
                    `users/${currentUser.uid}/wishlist`
                );


            const snapshot =
                await get(wishlistRef);


            if (snapshot.exists()) {

                accountWishlist =
                    objectToArray(
                        snapshot.val()
                    );

            }

        } catch (error) {

            console.warn(
                "Wishlist load error:",
                error
            );

        }

    }


    /*
    Fallback to localStorage.
    */

    if (
        accountWishlist.length === 0
    ) {

        try {

            const local =
                localStorage.getItem(
                    `smartbazaar_wishlist_${currentUser.uid}`
                );


            if (local) {

                accountWishlist =
                    JSON.parse(local);

            }

        } catch (error) {

            console.warn(
                "Local wishlist error:",
                error
            );

        }

    }


    renderWishlist();

    updateStatistics();

}


/*==================================================
FEATURE: RENDER WISHLIST
==================================================*/

function renderWishlist() {

    const container =
        $("wishlistProducts");


    if (!container) {

        return;

    }


    if (
        !accountWishlist ||
        accountWishlist.length === 0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-regular fa-heart",
                "Your Wishlist is Empty",
                "Save products you love and find them here.",
                `
                    <a
                        href="./index.html"
                        class="empty-action-button"
                    >
                        Browse Products
                    </a>
                `
            );


        return;

    }


    container.innerHTML =
        accountWishlist
            .map(
                product =>
                    wishlistProductHTML(
                        product
                    )
            )
            .join("");

}


/*==================================================
FEATURE: WISHLIST PRODUCT
==================================================*/

function wishlistProductHTML(product) {

    const name =
        product.name ||
        product.title ||
        "Product";


    const image =
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        "";


    const price =
        product.price ||
        product.salePrice ||
        0;


    const productId =
        product.productId ||
        product.id ||
        product._key ||
        "";


    return `

        <article
            class="wishlist-product-card"
            data-product-id="${escapeHTML(productId)}"
        >

            <div class="wishlist-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}"
                                loading="lazy"
                            >
                        `
                        : `
                            <i class="fa-solid fa-box"></i>
                        `
                }

            </div>


            <div class="wishlist-product-info">

                <h4>
                    ${escapeHTML(name)}
                </h4>

                <strong>
                    Rs ${formatMoney(price)}
                </strong>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: ADDRESSES
==================================================*/

async function loadAddresses() {

    accountAddresses = [];


    if (!currentUser) {

        return;

    }


    if (db) {

        try {

            const addressesRef =
                ref(
                    db,
                    `users/${currentUser.uid}/addresses`
                );


            const snapshot =
                await get(addressesRef);


            if (snapshot.exists()) {

                accountAddresses =
                    objectToArray(
                        snapshot.val()
                    );

            }

        } catch (error) {

            console.warn(
                "Address load error:",
                error
            );

        }

    }


    accountAddresses.sort(
        (a, b) => {

            if (
                a.isDefault &&
                !b.isDefault
            ) {

                return -1;

            }


            if (
                !a.isDefault &&
                b.isDefault
            ) {

                return 1;

            }


            return 0;

        }
    );


    renderAddresses();

    updateStatistics();

}


/*==================================================
FEATURE: RENDER ADDRESSES
==================================================*/

function renderAddresses() {

    const container =
        $("addressesList");


    if (!container) {

        return;

    }


    if (
        !accountAddresses ||
        accountAddresses.length === 0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-solid fa-location-dot",
                "No Saved Addresses",
                "Add an address for faster checkout."
            );


        return;

    }


    container.innerHTML =
        accountAddresses
            .map(
                address =>
                    addressCardHTML(
                        address
                    )
            )
            .join("");

}


/*==================================================
FEATURE: ADDRESS CARD
==================================================*/

function addressCardHTML(address) {

    const title =
        address.title ||
        address.name ||
        "Address";


    const fullName =
        address.fullName ||
        address.recipientName ||
        "";


    const phone =
        address.phone ||
        address.mobile ||
        "";


    const city =
        address.city ||
        "";


    const complete =
        address.completeAddress ||
        address.address ||
        address.fullAddress ||
        "";


    const id =
        address.id ||
        address._key ||
        "";


    return `

        <article
            class="address-card"
            data-address-id="${escapeHTML(id)}"
        >

            <div class="address-card-header">

                <div>

                    <i class="fa-solid fa-location-dot"></i>

                    <strong>
                        ${escapeHTML(title)}
                    </strong>

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


                <button
                    type="button"
                    class="delete-address-button"
                    data-address-id="${escapeHTML(id)}"
                    aria-label="Delete address"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>


            <div class="address-card-body">

                <strong>
                    ${escapeHTML(fullName)}
                </strong>

                <span>
                    ${escapeHTML(phone)}
                </span>

                <span>
                    ${escapeHTML(city)}
                </span>

                <p>
                    ${escapeHTML(complete)}
                </p>

            </div>


            ${
                !address.isDefault
                    ? `
                        <button
                            type="button"
                            class="set-default-address-button"
                            data-address-id="${escapeHTML(id)}"
                        >
                            Make Default
                        </button>
                    `
                    : ""
            }

        </article>

    `;

}


/*==================================================
FEATURE: ADDRESS MODAL
==================================================*/

function setupAddressModal() {

    const modal =
        $("addressModal");


    const addButton =
        $("addAddressButton");


    const closeButton =
        $("closeAddressModal");


    const cancelButton =
        $("cancelAddressButton");


    const overlay =
        modal
            ? modal.querySelector(
                ".modal-overlay"
            )
            : null;


    function openModal() {

        if (!modal) {

            return;

        }


        modal.style.display = "flex";

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal() {

        if (!modal) {

            return;

        }


        modal.style.display = "none";

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (addButton) {

        addButton.addEventListener(
            "click",
            openModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    setupAddressForm(
        closeModal
    );

}


/*==================================================
FEATURE: ADDRESS FORM
==================================================*/

function setupAddressForm(
    closeModal
) {

    const form =
        $("addressForm");


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            const title =
                $("addressTitle")?.value || "Home";


            const fullName =
                $("addressName")?.value.trim() || "";


            const phone =
                $("addressPhone")?.value.trim() || "";


            const city =
                $("addressCity")?.value.trim() || "";


            const completeAddress =
                $("addressComplete")?.value.trim() || "";


            const isDefault =
                Boolean(
                    $("addressDefault")?.checked
                );


            if (
                !fullName ||
                !phone ||
                !city ||
                !completeAddress
            ) {

                alert(
                    "Please complete all address fields."
                );

                return;

            }


            if (
                !/^03\d{9}$/.test(phone)
            ) {

                alert(
                    "Please enter a valid Pakistani mobile number."
                );

                return;

            }


            if (!db) {

                alert(
                    "Firebase Database is not available."
                );

                return;

            }


            try {

                const addressesRef =
                    ref(
                        db,
                        `users/${currentUser.uid}/addresses`
                    );


                /*
                If this address is default,
                remove default from previous addresses.
                */

                if (isDefault) {

                    const snapshot =
                        await get(
                            addressesRef
                        );


                    if (snapshot.exists()) {

                        const data =
                            snapshot.val();


                        const updates = {};


                        Object.keys(data)
                            .forEach(
                                key => {

                                    updates[
                                        `${key}/isDefault`
                                    ] = false;

                                }
                            );


                        if (
                            Object.keys(
                                updates
                            ).length
                        ) {

                            await update(
                                addressesRef,
                                updates
                            );

                        }

                    }

                }


                const newAddressRef =
                    push(
                        addressesRef
                    );


                await set(
                    newAddressRef,
                    {

                        id:
                            newAddressRef.key,

                        title,

                        fullName,

                        phone,

                        city,

                        completeAddress,

                        isDefault,

                        createdAt:
                            Date.now()

                    }
                );


                form.reset();


                closeModal();


                await loadAddresses();


                alert(
                    "Address saved successfully."
                );

            } catch (error) {

                console.error(
                    "Address save error:",
                    error
                );


                alert(
                    getFirebaseErrorMessage(
                        error
                    )
                );

            }

        }
    );

}


/*==================================================
FEATURE: ADDRESS ACTIONS
==================================================*/

function setupAddressActions() {

    document.addEventListener(
        "click",
        async event => {

            const deleteButton =
                event.target.closest(
                    ".delete-address-button"
                );


            const defaultButton =
                event.target.closest(
                    ".set-default-address-button"
                );


            if (
                !deleteButton &&
                !defaultButton
            ) {

                return;

            }


            if (!currentUser || !db) {

                return;

            }


            if (deleteButton) {

                const id =
                    deleteButton.dataset.addressId;


                if (!id) {

                    return;

                }


                const confirmed =
                    confirm(
                        "Delete this saved address?"
                    );


                if (!confirmed) {

                    return;

                }


                try {

                    await remove(
                        ref(
                            db,
                            `users/${currentUser.uid}/addresses/${id}`
                        )
                    );


                    await loadAddresses();

                } catch (error) {

                    console.error(
                        "Address delete error:",
                        error
                    );


                    alert(
                        getFirebaseErrorMessage(
                            error
                        )
                    );

                }

            }


            if (defaultButton) {

                const id =
                    defaultButton.dataset.addressId;


                if (!id) {

                    return;

                }


                try {

                    const addressesRef =
                        ref(
                            db,
                            `users/${currentUser.uid}/addresses`
                        );


                    const snapshot =
                        await get(
                            addressesRef
                        );


                    if (!snapshot.exists()) {

                        return;

                    }


                    const data =
                        snapshot.val();


                    const updates = {};


                    Object.keys(data)
                        .forEach(
                            key => {

                                updates[
                                    `${key}/isDefault`
                                ] =
                                    key === id;

                            }
                        );


                    await update(
                        addressesRef,
                        updates
                    );


                    await loadAddresses();

                } catch (error) {

                    console.error(
                        "Default address error:",
                        error
                    );


                    alert(
                        getFirebaseErrorMessage(
                            error
                        )
                    );

                }

            }

        }
    );

}


/*==================================================
FEATURE: NOTIFICATIONS
==================================================*/

async function loadNotifications() {

    accountNotifications = [];


    if (!currentUser) {

        return;

    }


    if (db) {

        try {

            const notificationRef =
                ref(
                    db,
                    `users/${currentUser.uid}/notifications`
                );


            const snapshot =
                await get(
                    notificationRef
                );


            if (snapshot.exists()) {

                accountNotifications =
                    objectToArray(
                        snapshot.val()
                    );

            }

        } catch (error) {

            console.warn(
                "Notification load error:",
                error
            );

        }

    }


    accountNotifications.sort(
        (a, b) =>
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


    renderNotifications();

    updateStatistics();

}


/*==================================================
FEATURE: RENDER NOTIFICATIONS
==================================================*/

function renderNotifications() {

    const container =
        $("notificationsList");


    if (!container) {

        return;

    }


    if (
        !accountNotifications ||
        accountNotifications.length === 0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-regular fa-bell",
                "No Notifications",
                "New account and order updates will appear here."
            );


        return;

    }


    container.innerHTML =
        accountNotifications
            .map(
                notification =>
                    notificationHTML(
                        notification
                    )
            )
            .join("");

}


/*==================================================
FEATURE: NOTIFICATION CARD
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


    const unread =
        notification.read === false;


    return `

        <article
            class="notification-item ${
                unread
                    ? "unread"
                    : ""
            }"
        >

            <div class="notification-icon">

                <i class="fa-regular fa-bell"></i>

            </div>


            <div class="notification-content">

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

                <small>
                    ${escapeHTML(date)}
                </small>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: MARK ALL NOTIFICATIONS READ
==================================================*/

function setupNotificationActions() {

    const button =
        $("markNotificationsRead");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async () => {

            if (
                !currentUser ||
                !db
            ) {

                return;

            }


            try {

                const notificationRef =
                    ref(
                        db,
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


                const updates = {};


                Object.keys(data)
                    .forEach(
                        key => {

                            updates[
                                `${key}/read`
                            ] = true;

                        }
                    );


                await update(
                    notificationRef,
                    updates
                );


                await loadNotifications();

            } catch (error) {

                console.error(
                    "Mark notifications read error:",
                    error
                );

            }

        }
    );

}


/*==================================================
FEATURE: SECURITY
==================================================*/

function setupPasswordSystem() {

    const button =
        $("changePasswordButton");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        openPasswordModal
    );


    setupPasswordModal();

}


/*==================================================
FEATURE: PASSWORD MODAL
==================================================*/

function setupPasswordModal() {

    const modal =
        $("passwordModal");


    if (!modal) {

        return;

    }


    const closeButton =
        $("closePasswordModal");


    const cancelButton =
        $("cancelPasswordButton");


    const overlay =
        modal.querySelector(
            ".modal-overlay"
        );


    function closeModal() {

        modal.style.display =
            "none";

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    const form =
        $("passwordForm");


    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (!currentUser) {

                    alert(
                        "Please login first."
                    );

                    return;

                }


                const currentPassword =
                    $("currentPassword")?.value || "";


                const newPassword =
                    $("newPassword")?.value || "";


                const confirmPassword =
                    $("confirmPassword")?.value || "";


                if (
                    newPassword.length < 6
                ) {

                    alert(
                        "New password must contain at least 6 characters."
                    );

                    return;

                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    alert(
                        "New password and confirmation do not match."
                    );

                    return;

                }


                if (
                    !currentPassword
                ) {

                    alert(
                        "Please enter your current password."
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


                    form.reset();

                    closeModal();


                    alert(
                        "Password changed successfully."
                    );

                } catch (error) {

                    console.error(
                        "Password change error:",
                        error
                    );


                    alert(
                        getFirebaseErrorMessage(
                            error
                        )
                    );

                }

            }
        );

    }

}


/*==================================================
FEATURE: OPEN PASSWORD MODAL
==================================================*/

function openPasswordModal() {

    const modal =
        $("passwordModal");


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    document.body.classList.add(
        "modal-open"
    );

}


/*==================================================
FEATURE: LOGOUT SYSTEM
==================================================*/

function setupLogoutSystem() {

    const topLogout =
        $("logoutButtonTop");


    const sidebarLogout =
        $("logoutButton");


    const logoutModal =
        $("logoutModal");


    const cancelLogout =
        $("cancelLogoutButton");


    const confirmLogout =
        $("confirmLogoutButton");


    function openLogoutModal() {

        if (!logoutModal) {

            performLogout();

            return;

        }


        logoutModal.style.display =
            "flex";


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeLogoutModal() {

        if (!logoutModal) {

            return;

        }


        logoutModal.style.display =
            "none";


        document.body.classList.remove(
            "modal-open"
        );

    }


    if (topLogout) {

        topLogout.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (sidebarLogout) {

        sidebarLogout.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    if (confirmLogout) {

        confirmLogout.addEventListener(
            "click",
            async () => {

                await performLogout(
                    closeLogoutModal
                );

            }
        );

    }


    if (logoutModal) {

        const overlay =
            logoutModal.querySelector(
                ".modal-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeLogoutModal
            );

        }

    }

}


/*==================================================
FEATURE: PERFORM LOGOUT
==================================================*/

async function performLogout(
    closeModal = null
) {

    try {

        if (closeModal) {

            closeModal();

        }


        if (auth) {

            await signOut(auth);

        }


        window.location.href =
            "./index.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            getFirebaseErrorMessage(
                error
            )
        );

    }

}


/*==================================================
FEATURE: ACCOUNT STATISTICS
==================================================*/

function updateStatistics() {

    /*
    Total orders
    */

    const totalOrders =
        $("totalOrders");


    if (totalOrders) {

        totalOrders.textContent =
            String(
                accountOrders.length
            );

    }


    /*
    Order nav badge
    */

    const ordersBadge =
        $("ordersNavBadge");


    if (ordersBadge) {

        ordersBadge.textContent =
            String(
                accountOrders.length
            );

    }


    /*
    Wishlist
    */

    const wishlistCount =
        $("wishlistCount");


    if (wishlistCount) {

        wishlistCount.textContent =
            String(
                accountWishlist.length
            );

    }


    /*
    Addresses
    */

    const addressCount =
        $("addressCount");


    if (addressCount) {

        addressCount.textContent =
            String(
                accountAddresses.length
            );

    }


    /*
    Notifications
    */

    const unreadNotifications =
        accountNotifications.filter(
            notification =>
                notification.read === false
        ).length;


    const notificationCount =
        $("notificationCount");


    if (notificationCount) {

        notificationCount.textContent =
            String(
                unreadNotifications
            );

    }


    const notificationBadge =
        $("notificationNavBadge");


    if (notificationBadge) {

        notificationBadge.textContent =
            String(
                unreadNotifications
            );

    }

}


/*==================================================
FEATURE: ACCOUNT SETTINGS
==================================================*/

function setupAccountSettings() {

    const orderToggle =
        $("orderNotificationsToggle");


    const deliveryToggle =
        $("deliveryNotificationsToggle");


    const promotionalToggle =
        $("promotionalNotificationsToggle");


    if (orderToggle) {

        orderToggle.checked =
            getSetting(
                "orderNotifications",
                true
            );


        orderToggle.addEventListener(
            "change",
            () => {

                saveSetting(
                    "orderNotifications",
                    orderToggle.checked
                );

            }
        );

    }


    if (deliveryToggle) {

        deliveryToggle.checked =
            getSetting(
                "deliveryNotifications",
                true
            );


        deliveryToggle.addEventListener(
            "change",
            () => {

                saveSetting(
                    "deliveryNotifications",
                    deliveryToggle.checked
                );

            }
        );

    }


    if (promotionalToggle) {

        promotionalToggle.checked =
            getSetting(
                "promotionalNotifications",
                false
            );


        promotionalToggle.addEventListener(
            "change",
            () => {

                saveSetting(
                    "promotionalNotifications",
                    promotionalToggle.checked
                );

            }
        );

    }

}


/*==================================================
FEATURE: SETTINGS STORAGE
==================================================*/

function getSetting(
    key,
    defaultValue
) {

    try {

        const value =
            localStorage.getItem(
                `smartbazaar_setting_${key}`
            );


        if (value === null) {

            return defaultValue;

        }


        return value === "true";

    } catch (error) {

        return defaultValue;

    }

}


/*==================================================
FEATURE: SAVE SETTING
==================================================*/

function saveSetting(
    key,
    value
) {

    try {

        localStorage.setItem(
            `smartbazaar_setting_${key}`,
            String(value)
        );

    } catch (error) {

        console.warn(
            "Could not save setting."
        );

    }

}




/*==================================================
FEATURE: CHANGE AVATAR
CLOUDINARY PROFILE PICTURE UPLOAD
==================================================*/

function setupAvatarButton() {

    const button =
        $("changeAvatarButton");

    const input =
        $("profilePictureInput");


    if (!button || !input) {

        return;

    }


    /*
    Open file selector.
    */

    button.addEventListener(
        "click",
        () => {

            input.click();

        }
    );


    /*
    Profile picture selected.
    */

    input.addEventListener(
        "change",
        async () => {

            const file =
                input.files?.[0];


            if (!file) {

                return;

            }


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                input.value = "";

                return;

            }


            /*
            Validate image type.
            */

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image file."
                );

                input.value = "";

                return;

            }


            /*
            Maximum file size: 5 MB.
            */
const maxSize =
    50 * 1024 * 1024;

if (
    file.size > maxSize
) {
    alert(
        "Profile picture must be 50 MB or smaller."
    );
    input.value = "";
    return;
}


            const originalText =
                button.innerHTML;


            try {

                button.disabled =
                    true;


                button.innerHTML =
                    `<i class="fa-solid fa-spinner fa-spin"></i>`;


                /*
                Upload profile picture
                to Cloudinary PROFILES folder.
                */

                const uploadResult =
                    await uploadToCloudinary(
                        file,
                        CLOUDINARY_FOLDERS.PROFILES
                    );


                const photoURL =
                    uploadResult.url;


                /*
                Update Firebase Authentication.
                */

                await updateProfile(
                    currentUser,
                    {
                        photoURL
                    }
                );


                /*
                Update local account state.
                */

                currentProfile = {

                    ...currentProfile,

                    photoURL

                };


                /*
                Save Cloudinary URL
                in Realtime Database.
                */

                if (db) {

                    await update(
                        ref(
                            db,
                            `users/${currentUser.uid}`
                        ),
                        {

                            photoURL,

                            updatedAt:
                                Date.now()

                        }
                    );

                }


                /*
                Refresh profile UI.
                */

                updateProfileUI();


                alert(
                    "Profile picture updated successfully."
                );

            } catch (error) {

                console.error(
                    "Profile picture upload error:",
                    error
                );


                alert(
                    error?.message ||
                    "Profile picture upload failed. Please try again."
                );

            } finally {

                button.disabled =
                    false;


                button.innerHTML =
                    originalText;


                input.value =
                    "";

            }

        }
    );

}


/*==================================================
FEATURE: EMPTY STATE
==================================================*/

function emptyStateHTML(
    icon,
    title,
    message,
    extra = ""
) {

    return `

        <div class="empty-state">

            <i class="${escapeHTML(icon)}"></i>

            <h4>
                ${escapeHTML(title)}
            </h4>

            <p>
                ${escapeHTML(message)}
            </p>

            ${extra}

        </div>

    `;

}


/*==================================================
FEATURE: NORMALIZE ORDER STATUS
==================================================*/

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "pending"
        )
        .trim()
        .toLowerCase();


    const allowed = [

        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "canceled"

    ];


    if (
        !allowed.includes(
            value
        )
    ) {

        return "pending";

    }


    if (
        value === "canceled"
    ) {

        return "cancelled";

    }


    return value;

}


/*==================================================
FEATURE: CAPITALIZE
==================================================*/

function capitalize(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .charAt(0)
        .toUpperCase() +
        String(value)
            .slice(1);

}


/*==================================================
FEATURE: FORMAT MONEY
==================================================*/

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


/*==================================================
FEATURE: FORMAT DATE
==================================================*/

function formatDate(
    value
) {

    if (!value) {

        return "Date unavailable";

    }


    let date;


    if (
        typeof value === "number"
    ) {

        date =
            new Date(value);

    } else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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
FEATURE: FIREBASE ERROR MESSAGE
==================================================*/

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return "Something went wrong.";

    }


    const code =
        error.code || "";


    switch (code) {

        case "auth/wrong-password":

            return "The current password is incorrect.";


        case "auth/invalid-credential":

            return "The current password or login credentials are incorrect.";


        case "auth/weak-password":

            return "The new password is too weak.";


        case "auth/requires-recent-login":

            return "Please login again before changing your password.";


        case "auth/too-many-requests":

            return "Too many attempts. Please try again later.";


        case "permission-denied":

            return "Firebase permission denied. Please check your Realtime Database rules.";


        default:

            return (
                error.message ||
                "Something went wrong. Please try again."
            );

    }

}


/*==================================================
FEATURE: LOAD ALL ACCOUNT DATA
==================================================*/
/*==================================================
 FEATURE: MY PRODUCTS SYSTEM
 SELLER PRODUCT CONNECTION
==================================================*/

let myProductsListener = null;


/*==================================================
 FEATURE: SETUP MY PRODUCTS
==================================================*/

function setupMyProductsSystem() {

    const addProductButton =
        document.getElementById(
            "addProductButton"
        );


    if (
        addProductButton &&
        !addProductButton.dataset.bound
    ) {

        addProductButton.dataset.bound =
            "true";


        addProductButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "./product-editor.html?source=account";

            }
        );

    }

}


/*==================================================
 FEATURE: LOAD SELLER PRODUCTS
==================================================*/

function loadMyProducts(
    userId
) {

    const productsList =
        document.getElementById(
            "myProductsList"
        );


    if (!productsList) {
        return;
    }


    if (myProductsListener) {

        myProductsListener();

        myProductsListener =
            null;

    }


    productsList.innerHTML = `
        <div class="my-products-loading">
            Loading your products...
        </div>
    `;


    const productsRef =
    ref(
        db,
        "products"
    );


    myProductsListener =
        onValue(
            productsRef,
            (snapshot) => {

                const data =
                    snapshot.val() || {};


                const products =
                    Object.entries(data)
                        .map(
                            ([firebaseKey, product]) => {

                                return {

                                    ...(product || {}),

                                    productId:
                                        product?.productId ||
                                        firebaseKey

                                };

                            }
                        )
                        .filter(
                            (product) => {

                                return (
                                    product.sellerId === userId ||
                                    product.createdBy === userId
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


                renderMyProducts(
                    products
                );

            },


            (error) => {

                console.error(
                    "My Products Error:",
                    error
                );


                productsList.innerHTML = `
                    <div class="my-products-error">
                        Unable to load your products.
                    </div>
                `;

            }

        );

}


/*==================================================
 FEATURE: RENDER MY PRODUCTS
==================================================*/

function renderMyProducts(
    products
) {

    const productsList =
        document.getElementById(
            "myProductsList"
        );


    const productsCount =
        document.getElementById(
            "myProductsCount"
        );


    const productsNavBadge =
        document.getElementById(
            "myProductsNavBadge"
        );


    if (!productsList) {
        return;
    }


    const total =
        products.length;


    if (productsCount) {

        productsCount.textContent =
            total;

    }


    if (productsNavBadge) {

        productsNavBadge.textContent =
            total;

    }


    if (
        products.length === 0
    ) {

        productsList.innerHTML = `

            <div class="my-products-empty">

                <div class="my-products-empty-icon">

                    <i class="fa-solid fa-box-open"></i>

                </div>

                <h3>
                    No Products Yet
                </h3>

                <p>
                    You have not uploaded any products yet.
                </p>

                <button
                    type="button"
                    class="primary-action-button"
                    id="emptyAddProductButton"
                >

                    <i class="fa-solid fa-plus"></i>

                    Add Your First Product

                </button>

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyAddProductButton"
            );


        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "./product-editor.html?source=account";

                }
            );

        }


        return;
    }


    productsList.innerHTML =
        "";


    products.forEach(
        (product) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "my-product-card";


            const image =
                product.image ||
                (
                    Array.isArray(
                        product.images
                    )
                        ? product.images[0]
                        : ""
                );


            const published =
                product.published === true;


            const stock =
                Number(
                    product.stock || 0
                );


            const price =
                Number(
                    product.price || 0
                );


            card.innerHTML = `

                <div class="my-product-image">

                    ${
                        image
                            ? `
                                <img
                                    src="${escapeHtml(
                                        image
                                    )}"
                                    alt="${escapeHtml(
                                        product.name ||
                                        "Product"
                                    )}"
                                    loading="lazy"
                                >
                            `
                            : `
                                <div class="my-product-no-image">
                                    <i class="fa-solid fa-image"></i>
                                </div>
                            `
                    }

                </div>


                <div class="my-product-info">

                    <h3>
                        ${escapeHtml(
                            product.name ||
                            "Unnamed Product"
                        )}
                    </h3>


                    <div class="my-product-price">

                        Rs.
                        ${price.toLocaleString("en-PK")}

                    </div>


                    <div class="my-product-meta">

                        <span>

                            <i class="fa-solid fa-box"></i>

                            Stock:
                            ${stock}

                        </span>


                        <span>

                            <i class="fa-solid fa-tag"></i>

                            ${escapeHtml(
                                product.category ||
                                "Uncategorized"
                            )}

                        </span>

                    </div>


                    <div class="my-product-status">

                        <span
                            class="${
                                published
                                    ? "published"
                                    : "unpublished"
                            }"
                        >

                            ${
                                published
                                    ? "Published"
                                    : "Unpublished"
                            }

                        </span>

                    </div>


                    <div class="my-product-id">

                        Product ID:
                        ${escapeHtml(
                            product.productId ||
                            ""
                        )}

                    </div>

                </div>

            `;


            productsList.appendChild(
                card
            );

        }
    );

}


async function loadAccountData() {

    await loadProfile();

    await Promise.all([
        loadOrders(),
        loadWishlist(),
        loadAddresses(),
        loadNotifications()
    ]);


    updateStatistics();

}


/*==================================================
FEATURE: AUTH STATE
==================================================*/

async function startAccountSystem() {

    showLoading();


    const firebaseReady =
        await initializeFirebase();


    if (!firebaseReady) {

        return;

    }


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

                await loadAccountData();

                showAccountContent();

            } catch (error) {

                console.error(
                    "Account loading error:",
                    error
                );


                showAccountContent();


                alert(
                    "Some account data could not be loaded. Please check your Firebase Database rules."
                );

            }

        }
    );

}


/*==================================================
FEATURE: INITIALIZE ACCOUNT PAGE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
        Core UI first.
        */

        setupAccountNavigation();

        setupProfileForm();

        setupAddressModal();

        setupAddressActions();

        setupNotificationActions();

        setupPasswordSystem();

        setupLogoutSystem();

        setupAccountSettings();

        setupAvatarButton();


        /*
        Firebase/account system.
        */

        startAccountSystem();

    }
);


/*==================================================
SMARTBAZAAR PRO 2
ACCOUNT.JS COMPLETE
END OF FILE
==================================================*/
