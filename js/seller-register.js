/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER REGISTRATION SYSTEM
FIREBASE AUTHENTICATION + USER PROFILE
==================================================*/


/*==================================================
FIREBASE IMPORT
==================================================*/

import {
    auth
} from "../firebase-config.js";


import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FIREBASE DATABASE
==================================================*/

const database =
    getDatabase();


/*==================================================
ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
DOM ELEMENTS
==================================================*/

const sellerRegisterForm =
    document.getElementById(
        "sellerRegisterForm"
    );


const sellerName =
    document.getElementById(
        "sellerName"
    );


const sellerEmail =
    document.getElementById(
        "sellerEmail"
    );


const sellerPhone =
    document.getElementById(
        "sellerPhone"
    );


const sellerPassword =
    document.getElementById(
        "sellerPassword"
    );


const sellerConfirmPassword =
    document.getElementById(
        "sellerConfirmPassword"
    );


const sellerTerms =
    document.getElementById(
        "sellerTerms"
    );


const sellerRegisterSubmit =
    document.getElementById(
        "sellerRegisterSubmit"
    );


const sellerRegisterSpinner =
    document.getElementById(
        "sellerRegisterSpinner"
    );


const sellerRegisterMessage =
    document.getElementById(
        "sellerRegisterMessage"
    );


/*==================================================
FEATURE: PASSWORD SHOW / HIDE
==================================================*/

const sellerPasswordToggle =
    document.getElementById(
        "sellerPasswordToggle"
    );


const sellerConfirmPasswordToggle =
    document.getElementById(
        "sellerConfirmPasswordToggle"
    );


function setupPasswordToggle(
    button,
    input
) {

    if (
        !button ||
        !input
    ) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const icon =
                button.querySelector(
                    "i"
                );


            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";


                if (icon) {

                    icon.classList.remove(
                        "fa-eye"
                    );

                    icon.classList.add(
                        "fa-eye-slash"
                    );

                }

            }

            else {

                input.type =
                    "password";


                if (icon) {

                    icon.classList.remove(
                        "fa-eye-slash"
                    );

                    icon.classList.add(
                        "fa-eye"
                    );

                }

            }

        }
    );

}


setupPasswordToggle(
    sellerPasswordToggle,
    sellerPassword
);


setupPasswordToggle(
    sellerConfirmPasswordToggle,
    sellerConfirmPassword
);


/*==================================================
FEATURE: MESSAGE
==================================================*/

function showMessage(
    message,
    type
) {

    if (
        !sellerRegisterMessage
    ) {
        return;
    }


    sellerRegisterMessage.textContent =
        message;


    sellerRegisterMessage.className =
        "seller-register-message show " +
        type;

}


/*==================================================
FEATURE: CLEAR MESSAGE
==================================================*/

function clearMessage() {

    if (
        !sellerRegisterMessage
    ) {
        return;
    }


    sellerRegisterMessage.textContent =
        "";


    sellerRegisterMessage.className =
        "seller-register-message";

}


/*==================================================
FEATURE: LOADING STATE
==================================================*/

function setLoading(
    loading
) {

    if (
        !sellerRegisterSubmit
    ) {
        return;
    }


    if (loading) {

        sellerRegisterSubmit.disabled =
            true;


        sellerRegisterSubmit.classList.add(
            "loading"
        );


        if (
            sellerRegisterSpinner
        ) {

            sellerRegisterSpinner.hidden =
                false;

        }

    }

    else {

        sellerRegisterSubmit.disabled =
            false;


        sellerRegisterSubmit.classList.remove(
            "loading"
        );


        if (
            sellerRegisterSpinner
        ) {

            sellerRegisterSpinner.hidden =
                true;

        }

    }

}


/*==================================================
FEATURE: INPUT VALIDATION
==================================================*/

function validateForm() {

    const name =
        sellerName?.value.trim() || "";


    const email =
        sellerEmail?.value.trim() || "";


    const phone =
        sellerPhone?.value.trim() || "";


    const password =
        sellerPassword?.value || "";


    const confirmPassword =
        sellerConfirmPassword?.value || "";


    const termsAccepted =
        sellerTerms?.checked === true;


    if (!name) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        sellerName?.focus();

        return false;

    }


    if (!email) {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        sellerEmail?.focus();

        return false;

    }


    if (
        !isValidEmail(email)
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        sellerEmail?.focus();

        return false;

    }


    if (!phone) {

        showMessage(
            "Please enter your phone number.",
            "error"
        );

        sellerPhone?.focus();

        return false;

    }


    if (
        password.length < 6
    ) {

        showMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        sellerPassword?.focus();

        return false;

    }


    if (
        password !==
        confirmPassword
    ) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        sellerConfirmPassword?.focus();

        return false;

    }


    if (!termsAccepted) {

        showMessage(
            "Please accept the Terms & Conditions.",
            "error"
        );

        return false;

    }


    return true;

}


/*==================================================
FEATURE: EMAIL VALIDATION
==================================================*/

function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


/*==================================================
FEATURE: FIREBASE ERROR TRANSLATOR
==================================================*/

function getFirebaseErrorMessage(
    error
) {

    switch (
        error.code
    ) {

        case "auth/email-already-in-use":

            return "An account with this email already exists. Please login instead.";


        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/weak-password":

            return "Password must be at least 6 characters.";


        case "auth/operation-not-allowed":

            return "Email and password registration is not enabled in Firebase.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection and try again.";


        case "auth/too-many-requests":

            return "Too many attempts. Please try again later.";


        default:

            console.error(
                "Seller Registration Firebase Error:",
                error
            );


            return (
                error.message ||
                "Something went wrong. Please try again."
            );

    }

}


/*==================================================
FEATURE: SAVE USER PROFILE
==================================================*/

async function saveUserProfile(
    user,
    name,
    email,
    phone
) {

    const userRef =
        ref(
            database,
            `users/${user.uid}`
        );


    const userData = {

        uid:
            user.uid,

        fullName:
            name,

        email:
            email,

        phone:
            phone,

        city:
            "",

        photoURL:
            user.photoURL || "",

        updatedAt:
            Date.now()

    };


    await set(
        userRef,
        userData
    );

}


/*==================================================
FEATURE: SESSION INFORMATION
==================================================*/

function saveSession(
    user
) {

    const isAdmin =
        user.email ===
        ADMIN_EMAIL;


    sessionStorage.setItem(
        "smartbazaar_user_email",
        user.email || ""
    );


    sessionStorage.setItem(
        "smartbazaar_is_admin",
        isAdmin
            ? "true"
            : "false"
    );

}


/*==================================================
FEATURE: SELLER REGISTRATION
==================================================*/

if (
    sellerRegisterForm
) {

    sellerRegisterForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearMessage();


            if (
                !validateForm()
            ) {

                return;

            }


            const name =
                sellerName.value.trim();


            const email =
                sellerEmail.value.trim();


            const phone =
                sellerPhone.value.trim();


            const password =
                sellerPassword.value;


            setLoading(
                true
            );


            try {

                /*==================================================
                CREATE FIREBASE AUTH ACCOUNT
                ==================================================*/

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                /*==================================================
                SAVE DISPLAY NAME
                ==================================================*/

                await updateProfile(
                    user,
                    {
                        displayName:
                            name
                    }
                );


                /*==================================================
                SAVE EXISTING USER PROFILE
                ==================================================*/

                await saveUserProfile(
                    user,
                    name,
                    email,
                    phone
                );


                /*==================================================
                SAVE SESSION
                ==================================================*/

                saveSession(
                    user
                );


                /*==================================================
                SUCCESS MESSAGE
                ==================================================*/

                showMessage(
                    "Seller account created successfully. Redirecting...",
                    "success"
                );


                /*==================================================
                REDIRECT TO ACCOUNT
                ==================================================*/

                setTimeout(
                    () => {

                        window.location.href =
                            "account.html";

                    },
                    900
                );

            }

            catch (
                error
            ) {

                showMessage(
                    getFirebaseErrorMessage(
                        error
                    ),
                    "error"
                );

            }

            finally {

                setLoading(
                    false
                );

            }

        }
    );

}
