/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ACCOUNT SYSTEM
FEATURE: CUSTOMER ACCOUNT PAGE
FEATURE: FIREBASE AUTHENTICATION
FEATURE: USER PROFILE
FEATURE: MY ORDERS
FEATURE: WISHLIST
FEATURE: ADDRESSES
FEATURE: ACCOUNT SETTINGS
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    set,
    update
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE INITIALIZATION
==================================================*/

const auth =
    getAuth(app);


const db =
    getDatabase(app);


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const accountLoading =
    document.getElementById(
        "accountLoading"
    );


const accountContent =
    document.getElementById(
        "accountContent"
    );


const accountError =
    document.getElementById(
        "accountError"
    );


const accountErrorMessage =
    document.getElementById(
        "accountErrorMessage"
    );


const accountLoginRequired =
    document.getElementById(
        "accountLoginRequired"
    );


const accountUserName =
    document.getElementById(
        "accountUserName"
    );


const accountUserEmail =
    document.getElementById(
        "accountUserEmail"
    );


const accountUserAvatar =
    document.getElementById(
        "accountUserAvatar"
    );


const accountOrdersCount =
    document.getElementById(
        "accountOrdersCount"
    );


const accountWishlistCount =
    document.getElementById(
        "accountWishlistCount"
    );


const accountAddressesCount =
    document.getElementById(
        "accountAddressesCount"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const profileForm =
    document.getElementById(
        "profileForm"
    );


/*==================================================
FEATURE: CURRENT USER
==================================================*/

let currentUser =
    null;


/*==================================================
FEATURE: INITIALIZE ACCOUNT
==================================================*/

onAuthStateChanged(
    auth,
    async (user) => {

        currentUser =
            user;


        if (!user) {

            showLoginRequired();

            return;

        }


        await loadAccount(
            user
        );

    }
);


/*==================================================
FEATURE: LOAD ACCOUNT
==================================================*/

async function loadAccount(
    user
) {

    try {

        showLoading();


        renderUserProfile(
            user
        );


        await loadUserStatistics(
            user
        );


        setupProfileForm(
            user
        );


        hideLoading();


    }

    catch (error) {

        console.error(
            "Account loading error:",
            error
        );


        showAccountError(
            "Unable to load your account information."
        );

    }

}


/*==================================================
FEATURE: RENDER USER PROFILE
==================================================*/

function renderUserProfile(
    user
) {

    const displayName =
        user.displayName ||
        "SmartBazaar User";


    const email =
        user.email ||
        "No email available";


    if (accountUserName) {

        accountUserName.textContent =
            displayName;

    }


    if (accountUserEmail) {

        accountUserEmail.textContent =
            email;

    }


    if (accountUserAvatar) {

        if (user.photoURL) {

            accountUserAvatar.src =
                user.photoURL;

        } else {

            accountUserAvatar.src =
                createAvatar(
                    displayName
                );

        }

    }

}


/*==================================================
FEATURE: LOAD ACCOUNT STATISTICS
==================================================*/

async function loadUserStatistics(
    user
) {

    /*==================================================
    FEATURE: ORDERS COUNT
    ==================================================*/

    let ordersCount =
        0;


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
            snapshot.exists()
        ) {

            const orders =
                snapshot.val();


            Object.values(
                orders
            ).forEach(
                order => {

                    if (
                        order &&
                        (
                            order.customerEmail ===
                            user.email ||

                            order.userId ===
                            user.uid
                        )
                    ) {

                        ordersCount++;

                    }

                }
            );

        }

    }

    catch (error) {

        console.warn(
            "Orders count unavailable:",
            error
        );

    }


    if (accountOrdersCount) {

        accountOrdersCount.textContent =
            ordersCount;

    }


    /*==================================================
    FEATURE: WISHLIST COUNT
    ==================================================*/

    let wishlistCount =
        0;


    try {

        const wishlistRef =
            ref(
                db,
                `users/${user.uid}/wishlist`
            );


        const wishlistSnapshot =
            await get(
                wishlistRef
            );


        if (
            wishlistSnapshot.exists()
        ) {

            wishlistCount =
                Object.keys(
                    wishlistSnapshot.val()
                ).length;

        }

    }

    catch (error) {

        console.warn(
            "Wishlist count unavailable:",
            error
        );

    }


    if (accountWishlistCount) {

        accountWishlistCount.textContent =
            wishlistCount;

    }


    /*==================================================
    FEATURE: ADDRESS COUNT
    ==================================================*/

    let addressesCount =
        0;


    try {

        const addressesRef =
            ref(
                db,
                `users/${user.uid}/addresses`
            );


        const addressesSnapshot =
            await get(
                addressesRef
            );


        if (
            addressesSnapshot.exists()
        ) {

            addressesCount =
                Object.keys(
                    addressesSnapshot.val()
                ).length;

        }

    }

    catch (error) {

        console.warn(
            "Address count unavailable:",
            error
        );

    }


    if (accountAddressesCount) {

        accountAddressesCount.textContent =
            addressesCount;

    }

}


/*==================================================
FEATURE: PROFILE FORM
==================================================*/

function setupProfileForm(
    user
) {

    if (!profileForm) {

        return;

    }


    const nameInput =
        document.getElementById(
            "profileName"
        );


    const phoneInput =
        document.getElementById(
            "profilePhone"
        );


    if (nameInput) {

        nameInput.value =
            user.displayName ||
            "";

    }


    loadSavedPhone(
        user,
        phoneInput
    );


    profileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                nameInput
                    ?.value
                    .trim() ||
                "";


            const phone =
                phoneInput
                    ?.value
                    .trim() ||
                "";


            if (
                name.length < 2
            ) {

                alert(
                    "Please enter your full name."
                );

                return;

            }


            if (
                phone &&
                !isValidPakistaniPhone(
                    phone
                )
            ) {

                alert(
                    "Please enter a valid Pakistani mobile number."
                );

                return;

            }


            const submitButton =
                profileForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Saving...
                    `;

            }


            try {

                /*==================================================
                FEATURE: UPDATE FIREBASE AUTH PROFILE
                ==================================================*/

                await updateProfile(
                    user,
                    {
                        displayName:
                            name
                    }
                );


                /*==================================================
                FEATURE: SAVE USER DATA
                ==================================================*/

                await update(
                    ref(
                        db,
                        `users/${user.uid}`
                    ),
                    {
                        uid:
                            user.uid,

                        name:
                            name,

                        email:
                            user.email ||
                            "",

                        phone:
                            phone,

                        updatedAt:
                            Date.now()
                    }
                );


                renderUserProfile(
                    auth.currentUser
                );


                alert(
                    "Profile updated successfully."
                );

            }

            catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                alert(
                    "Unable to update your profile. Please try again."
                );

            }

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        `
                            <i class="fa-solid fa-floppy-disk"></i>
                            Save Changes
                        `;

                }

            }

        }
    );

}


/*==================================================
FEATURE: LOAD SAVED PHONE
==================================================*/

async function loadSavedPhone(
    user,
    phoneInput
) {

    if (!phoneInput) {

        return;

    }


    try {

        const userRef =
            ref(
                db,
                `users/${user.uid}`
            );


        const snapshot =
            await get(
                userRef
            );


        if (
            snapshot.exists()
        ) {

            const userData =
                snapshot.val();


            phoneInput.value =
                userData.phone ||
                "";

        }

    }

    catch (error) {

        console.warn(
            "Unable to load phone:",
            error
        );

    }

}


/*==================================================
FEATURE: LOGOUT
==================================================*/

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                logoutButton.disabled =
                    true;


                logoutButton.innerHTML =
                    `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Signing Out...
                    `;


                await signOut(
                    auth
                );


                window.location.href =
                    "./index.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Unable to sign out. Please try again."
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerHTML =
                    `
                        <i class="fa-solid fa-right-from-bracket"></i>
                        Logout
                    `;

            }

        }
    );

}


/*==================================================
FEATURE: LOGIN REQUIRED
==================================================*/

function showLoginRequired() {

    hideLoading();


    if (accountContent) {

        accountContent.style.display =
            "none";

    }


    if (accountError) {

        accountError.style.display =
            "none";

    }


    if (accountLoginRequired) {

        accountLoginRequired.style.display =
            "block";

    }

}


/*==================================================
FEATURE: SHOW LOADING
==================================================*/

function showLoading() {

    if (accountLoading) {

        accountLoading.style.display =
            "flex";

    }


    if (accountContent) {

        accountContent.style.display =
            "none";

    }


    if (accountLoginRequired) {

        accountLoginRequired.style.display =
            "none";

    }


    if (accountError) {

        accountError.style.display =
            "none";

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (accountLoading) {

        accountLoading.style.display =
            "none";

    }


    if (accountContent) {

        accountContent.style.display =
            "block";

    }

}


/*==================================================
FEATURE: ACCOUNT ERROR
==================================================*/

function showAccountError(
    message
) {

    if (accountLoading) {

        accountLoading.style.display =
            "none";

    }


    if (accountContent) {

        accountContent.style.display =
            "none";

    }


    if (accountError) {

        accountError.style.display =
            "block";

    }


    if (accountErrorMessage) {

        accountErrorMessage.textContent =
            message;

    }

}


/*==================================================
FEATURE: PAKISTANI PHONE VALIDATION
==================================================*/

function isValidPakistaniPhone(
    phone
) {

    return /^03\d{9}$/.test(
        phone
    );

}


/*==================================================
FEATURE: DEFAULT AVATAR
==================================================*/

function createAvatar(
    name
) {

    const firstLetter =
        (
            name
                .trim()
                .charAt(0) ||
            "S"
        ).toUpperCase();


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
            `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="160"
                height="160"
                viewBox="0 0 160 160"
            >
                <rect
                    width="160"
                    height="160"
                    rx="80"
                    fill="#2e7d32"
                />

                <text
                    x="80"
                    y="105"
                    text-anchor="middle"
                    font-size="76"
                    font-family="Arial"
                    fill="#ffffff"
                >
                    ${firstLetter}
                </text>
            </svg>
            `
        )
    );

}
