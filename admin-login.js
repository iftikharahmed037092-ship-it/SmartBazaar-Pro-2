/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FIREBASE AUTHENTICATION SYSTEM
LOGIN / SIGNUP / GOOGLE / PASSWORD RESET
==================================================*/


/*==================================================
FIREBASE IMPORTS
==================================================*/

import {
    auth
} from "./firebase-config.js";


import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
GOOGLE PROVIDER
==================================================*/

const googleProvider =
    new GoogleAuthProvider();


googleProvider.setCustomParameters({

    prompt: "select_account"

});


/*==================================================
DOM ELEMENTS
==================================================*/

const loginPanel =
    document.getElementById(
        "loginPanel"
    );


const signupPanel =
    document.getElementById(
        "signupPanel"
    );


const forgotPanel =
    document.getElementById(
        "forgotPanel"
    );


const loginForm =
    document.getElementById(
        "loginForm"
    );


const signupForm =
    document.getElementById(
        "signupForm"
    );


const forgotForm =
    document.getElementById(
        "forgotForm"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const signupName =
    document.getElementById(
        "signupName"
    );


const signupEmail =
    document.getElementById(
        "signupEmail"
    );


const signupPassword =
    document.getElementById(
        "signupPassword"
    );


const signupConfirmPassword =
    document.getElementById(
        "signupConfirmPassword"
    );


const forgotEmail =
    document.getElementById(
        "forgotEmail"
    );


const rememberMe =
    document.getElementById(
        "rememberMe"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const signupButton =
    document.getElementById(
        "signupButton"
    );


const forgotButton =
    document.getElementById(
        "forgotButton"
    );


const googleLoginButton =
    document.getElementById(
        "googleLoginButton"
    );


const googleSignupButton =
    document.getElementById(
        "googleSignupButton"
    );


const authMessage =
    document.getElementById(
        "authMessage"
    );


const signupMessage =
    document.getElementById(
        "signupMessage"
    );


const forgotMessage =
    document.getElementById(
        "forgotMessage"
    );


/*==================================================
FEATURE: PANEL SWITCHING
==================================================*/

function showPanel(panel) {

    loginPanel.classList.remove(
        "active"
    );

    signupPanel.classList.remove(
        "active"
    );

    forgotPanel.classList.remove(
        "active"
    );


    panel.classList.add(
        "active"
    );


    clearMessages();

}


/*==================================================
LOGIN PANEL
==================================================*/

document
    .getElementById(
        "showLoginButton"
    )
    .addEventListener(
        "click",
        () => {

            showPanel(
                loginPanel
            );

        }
    );


/*==================================================
SIGNUP PANEL
==================================================*/

document
    .getElementById(
        "showSignupButton"
    )
    .addEventListener(
        "click",
        () => {

            showPanel(
                signupPanel
            );

        }
    );


/*==================================================
FORGOT PASSWORD PANEL
==================================================*/

document
    .getElementById(
        "forgotPasswordButton"
    )
    .addEventListener(
        "click",
        () => {

            const email =
                loginEmail.value.trim();


            forgotEmail.value =
                email;


            showPanel(
                forgotPanel
            );

        }
    );


/*==================================================
BACK TO LOGIN
==================================================*/

document
    .getElementById(
        "backToLoginButton"
    )
    .addEventListener(
        "click",
        () => {

            showPanel(
                loginPanel
            );

        }
    );


/*==================================================
FEATURE: PASSWORD SHOW / HIDE
==================================================*/

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;


                    const input =
                        document.getElementById(
                            targetId
                        );


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


                        icon.classList.remove(
                            "fa-eye"
                        );

                        icon.classList.add(
                            "fa-eye-slash"
                        );

                    }

                    else {

                        input.type =
                            "password";


                        icon.classList.remove(
                            "fa-eye-slash"
                        );

                        icon.classList.add(
                            "fa-eye"
                        );

                    }

                }
            );

        }
    );


/*==================================================
FEATURE: LOGIN
==================================================*/

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            loginEmail.value.trim();


        const password =
            loginPassword.value;


        if (
            !email ||
            !password
        ) {

            showMessage(
                authMessage,
                "Please enter your email and password.",
                "error"
            );

            return;

        }


        setLoading(
            loginButton,
            true
        );


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            /*==================================================
            FEATURE: ADMIN CHECK
            ==================================================*/

            const isAdmin =
                user.email ===
                ADMIN_EMAIL;


            /*
            Admin status local session میں رکھا جاتا ہے۔
            اصل security بعد میں Firebase Rules/Claims
            کے ذریعے مضبوط کی جائے گی۔
            */

            sessionStorage.setItem(
                "smartbazaar_user_email",
                user.email || ""
            );


            sessionStorage.setItem(
                "smartbazaar_is_admin",
                isAdmin ? "true" : "false"
            );


            showMessage(
                authMessage,
                "Login successful. Redirecting...",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                700
            );

        }

        catch (error) {

            showMessage(
                authMessage,
                getFirebaseErrorMessage(
                    error
                ),
                "error"
            );

        }

        finally {

            setLoading(
                loginButton,
                false
            );

        }

    }
);


/*==================================================
FEATURE: SIGNUP
==================================================*/

signupForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            signupName.value.trim();


        const email =
            signupEmail.value.trim();


        const password =
            signupPassword.value;


        const confirmPassword =
            signupConfirmPassword.value;


        const terms =
            document.getElementById(
                "acceptTerms"
            ).checked;


        if (
            password !==
            confirmPassword
        ) {

            showMessage(
                signupMessage,
                "Passwords do not match.",
                "error"
            );

            return;

        }


        if (!terms) {

            showMessage(
                signupMessage,
                "Please accept the Terms & Conditions.",
                "error"
            );

            return;

        }


        setLoading(
            signupButton,
            true
        );


        try {

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            /*==================================================
            FEATURE: SAVE DISPLAY NAME
            ==================================================*/

            await updateProfile(
                user,
                {
                    displayName:
                        name
                }
            );


            const isAdmin =
                user.email ===
                ADMIN_EMAIL;


            sessionStorage.setItem(
                "smartbazaar_user_email",
                user.email || ""
            );


            sessionStorage.setItem(
                "smartbazaar_is_admin",
                isAdmin ? "true" : "false"
            );


            showMessage(
                signupMessage,
                "Account created successfully. Welcome to SmartBazaar Pro 2!",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                900
            );

        }

        catch (error) {

            showMessage(
                signupMessage,
                getFirebaseErrorMessage(
                    error
                ),
                "error"
            );

        }

        finally {

            setLoading(
                signupButton,
                false
            );

        }

    }
);


/*==================================================
FEATURE: GOOGLE LOGIN
==================================================*/

googleLoginButton.addEventListener(
    "click",
    () => {

        googleAuthentication();

    }
);


/*==================================================
FEATURE: GOOGLE SIGNUP
==================================================*/

googleSignupButton.addEventListener(
    "click",
    () => {

        googleAuthentication();

    }
);


/*==================================================
FEATURE: GOOGLE AUTHENTICATION
==================================================*/

async function googleAuthentication() {

    setLoading(
        googleLoginButton,
        true
    );

    setLoading(
        googleSignupButton,
        true
    );


    try {

        const credential =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            credential.user;


        const isAdmin =
            user.email ===
            ADMIN_EMAIL;


        sessionStorage.setItem(
            "smartbazaar_user_email",
            user.email || ""
        );


        sessionStorage.setItem(
            "smartbazaar_is_admin",
            isAdmin ? "true" : "false"
        );


        showMessage(
            authMessage,
            "Google authentication successful. Redirecting...",
            "success"
        );


        setTimeout(
            () => {

                window.location.href =
                    "index.html";

            },
            700
        );

    }

    catch (error) {

        showMessage(
            authMessage,
            getFirebaseErrorMessage(
                error
            ),
            "error"
        );

    }

    finally {

        setLoading(
            googleLoginButton,
            false
        );

        setLoading(
            googleSignupButton,
            false
        );

    }

}


/*==================================================
FEATURE: FORGOT PASSWORD
==================================================*/

forgotForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            forgotEmail.value.trim();


        if (!email) {

            showMessage(
                forgotMessage,
                "Please enter your email address.",
                "error"
            );

            return;

        }


        setLoading(
            forgotButton,
            true
        );


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            showMessage(
                forgotMessage,
                "Password reset link has been sent to your email.",
                "success"
            );


            forgotForm.reset();

        }

        catch (error) {

            showMessage(
                forgotMessage,
                getFirebaseErrorMessage(
                    error
                ),
                "error"
            );

        }

        finally {

            setLoading(
                forgotButton,
                false
            );

        }

    }
);


/*==================================================
FEATURE: MESSAGE
==================================================*/

function showMessage(
    element,
    message,
    type
) {

    element.textContent =
        message;

    element.className =
        "auth-message show " +
        type;

}


/*==================================================
FEATURE: CLEAR MESSAGES
==================================================*/

function clearMessages() {

    [
        authMessage,
        signupMessage,
        forgotMessage
    ]
        .forEach(
            element => {

                element.textContent =
                    "";

                element.className =
                    "auth-message";

            }
        );

}


/*==================================================
FEATURE: BUTTON LOADING
==================================================*/

function setLoading(
    button,
    loading
) {

    if (!button) {
        return;
    }


    if (loading) {

        button.classList.add(
            "loading"
        );

        button.disabled =
            true;

    }

    else {

        button.classList.remove(
            "loading"
        );

        button.disabled =
            false;

    }

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

        case
            "auth/invalid-credential":

            return "Incorrect email or password.";

        case
            "auth/invalid-login-credentials":

            return "Incorrect email or password.";

        case
            "auth/user-not-found":

            return "No account was found with this email.";

        case
            "auth/wrong-password":

            return "Incorrect password.";

        case
            "auth/email-already-in-use":

            return "An account with this email already exists.";

        case
            "auth/weak-password":

            return "Password must be at least 6 characters.";

        case
            "auth/invalid-email":

            return "Please enter a valid email address.";

        case
            "auth/popup-closed-by-user":

            return "Google sign-in was cancelled.";

        case
            "auth/popup-blocked":

            return "Your browser blocked the Google sign-in window.";

        case
            "auth/network-request-failed":

            return "Network error. Please check your internet connection.";

        case
            "auth/too-many-requests":

            return "Too many attempts. Please try again later.";

        case
            "auth/operation-not-allowed":

            return "This sign-in method is not enabled in Firebase.";

        default:

            console.error(
                "Firebase Auth Error:",
                error
            );

            return (
                error.message ||
                "Something went wrong. Please try again."
            );

    }

}
