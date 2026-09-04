/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CHECKOUT / ORDER SYSTEM
FEATURE: FIREBASE ORDER CREATION
FEATURE: STOCK VALIDATION
FEATURE: PAYMENT METHOD SELECTION
FEATURE: SECURE JAZZCASH CONNECTION
FEATURE: BACKEND PAYMENT API
FEATURE: ORDER SUCCESS SYSTEM
FEATURE: SELLER CONNECTION
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
    app,
    auth
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE AUTH
==================================================*/

import {
    onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: ORDER SERVICE
==================================================*/

import {
    createPendingOrder
} from "./order-create.js";


/*==================================================
FEATURE: DATABASE
==================================================*/

const db =
    getDatabase(app);


/*==================================================
FEATURE: BACKEND API
==================================================*/

const BACKEND_API_URL =
    window.SMARTBAZAAR_BACKEND_URL ||
    "http://localhost:3000";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const checkoutLoading =
    document.getElementById(
        "checkoutLoading"
    );


const checkoutContent =
    document.getElementById(
        "checkoutContent"
    );


const checkoutError =
    document.getElementById(
        "checkoutError"
    );


const checkoutErrorMessage =
    document.getElementById(
        "checkoutErrorMessage"
    );


const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );


const checkoutProductImage =
    document.getElementById(
        "checkoutProductImage"
    );


const checkoutProductName =
    document.getElementById(
        "checkoutProductName"
    );


const checkoutProductCategory =
    document.getElementById(
        "checkoutProductCategory"
    );


const checkoutProductPrice =
    document.getElementById(
        "checkoutProductPrice"
    );


const checkoutProductQuantity =
    document.getElementById(
        "checkoutProductQuantity"
    );


const checkoutQuantity =
    document.getElementById(
        "checkoutQuantity"
    );


const summaryProductPrice =
    document.getElementById(
        "summaryProductPrice"
    );


const summaryQuantity =
    document.getElementById(
        "summaryQuantity"
    );


const summaryTotal =
    document.getElementById(
        "summaryTotal"
    );


const increaseQuantity =
    document.getElementById(
        "increaseQuantity"
    );


const decreaseQuantity =
    document.getElementById(
        "decreaseQuantity"
    );


const orderSuccess =
    document.getElementById(
        "orderSuccess"
    );


const successOrderId =
    document.getElementById(
        "successOrderId"
    );


const successOrderTotal =
    document.getElementById(
        "successOrderTotal"
    );


/*==================================================
FEATURE: URL PARAMETERS
EXPECTED:
checkout.html?id=PRODUCT_ID&quantity=1
==================================================*/

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const productId =
    urlParams.get(
        "id"
    );


let requestedQuantity =
    Number(
        urlParams.get(
            "quantity"
        )
    ) || 1;


/*==================================================
FEATURE: PRODUCT STATE
==================================================*/

let currentProduct =
    null;


let currentStock =
    0;


/*==================================================
FEATURE: AUTH STATE
==================================================*/

let currentUser =
    null;


/*==================================================
FEATURE: ORDER STATE
==================================================*/

let orderBeingPlaced =
    false;


/*==================================================
FEATURE: AUTHENTICATION INITIALIZATION
==================================================*/

const authReadyPromise =
    new Promise(
        resolve => {

            onAuthStateChanged(
                auth,
                user => {

                    currentUser =
                        user;

                    resolve(
                        user
                    );

                }
            );

        }
    );


/*==================================================
FEATURE: INITIALIZE
==================================================*/

if (!productId) {

    showCheckoutError(
        "No product was selected for checkout."
    );

} else {

    initializeCheckout();

}


/*==================================================
FEATURE: INITIALIZE CHECKOUT
==================================================*/

async function initializeCheckout() {

    try {

        enablePaymentMethods();

        setupPaymentSelection();

        setupQuantityControls();


        /*----------------------------------------------
        WAIT FOR FIREBASE AUTH
        ----------------------------------------------*/

        await authReadyPromise;


        /*----------------------------------------------
        LOGIN REQUIRED
        ----------------------------------------------*/

        if (!currentUser) {

            showCheckoutError(
                "Please login to your account before checkout."
            );

            return;

        }


        /*----------------------------------------------
        LOAD PRODUCT
        ----------------------------------------------*/

        await loadCheckoutProduct(
            productId
        );

    }

    catch (error) {

        console.error(
            "Checkout initialization error:",
            error
        );


        showCheckoutError(
            error.message ||
            "Unable to initialize checkout."
        );

    }

}


/*==================================================
FEATURE: ENABLE PAYMENT METHODS
==================================================*/

function enablePaymentMethods() {

    const paymentInputs =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentInputs.forEach(
        input => {

            input.disabled =
                false;


            const option =
                input.closest(
                    ".payment-option"
                );


            if (option) {

                option.classList.remove(
                    "disabled-payment"
                );

            }


            const soon =
                option?.querySelector(
                    ".coming-soon"
                );


            if (soon) {

                soon.style.display =
                    "none";

            }

        }
    );

}


/*==================================================
FEATURE: PAYMENT METHOD SELECTION
==================================================*/

function setupPaymentSelection() {

    const paymentOptions =
        document.querySelectorAll(
            ".payment-option"
        );


    const paymentInputs =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentOptions.forEach(
        option => {

            option.addEventListener(
                "click",
                () => {

                    const input =
                        option.querySelector(
                            'input[name="paymentMethod"]'
                        );


                    if (!input) {

                        return;

                    }


                    input.checked =
                        true;


                    updatePaymentSelection();

                }
            );

        }
    );


    paymentInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                updatePaymentSelection
            );

        }
    );


    updatePaymentSelection();

}


/*==================================================
FEATURE: UPDATE PAYMENT SELECTION
==================================================*/

function updatePaymentSelection() {

    const paymentOptions =
        document.querySelectorAll(
            ".payment-option"
        );


    paymentOptions.forEach(
        option => {

            const input =
                option.querySelector(
                    'input[name="paymentMethod"]'
                );


            if (
                input &&
                input.checked
            ) {

                option.classList.add(
                    "active"
                );

            } else {

                option.classList.remove(
                    "active"
                );

            }

        }
    );

}


/*==================================================
FEATURE: LOAD PRODUCT
==================================================*/

async function loadCheckoutProduct(
    id
) {

    try {

        const productRef =
            ref(
                db,
                `products/${id}`
            );


        const snapshot =
            await get(
                productRef
            );


        if (!snapshot.exists()) {

            showCheckoutError(
                "This product no longer exists."
            );

            return;

        }


        currentProduct =
            snapshot.val();


        currentStock =
            Number(
                currentProduct.stock || 0
            );


        if (currentStock <= 0) {

            showCheckoutError(
                "This product is currently out of stock."
            );

            return;

        }


        if (
            requestedQuantity < 1
        ) {

            requestedQuantity =
                1;

        }


        if (
            requestedQuantity >
            currentStock
        ) {

            requestedQuantity =
                currentStock;

        }


        if (checkoutQuantity) {

            checkoutQuantity.value =
                requestedQuantity;

            checkoutQuantity.min =
                "1";

            checkoutQuantity.max =
                String(
                    currentStock
                );

        }


        renderCheckoutProduct();


        if (checkoutLoading) {

            checkoutLoading.style.display =
                "none";

        }


        if (checkoutContent) {

            checkoutContent.style.display =
                "grid";

        }

    }

    catch (error) {

        console.error(
            "Checkout product loading error:",
            error
        );


        showCheckoutError(
            "Unable to load product information."
        );

    }

}


/*==================================================
FEATURE: RENDER CHECKOUT PRODUCT
==================================================*/

function renderCheckoutProduct() {

    if (!currentProduct) {

        return;

    }


    const price =
        Number(
            currentProduct.price || 0
        );


    const image =
        getProductImage(
            currentProduct
        );


    if (checkoutProductImage) {

        checkoutProductImage.src =
            image;

        checkoutProductImage.alt =
            currentProduct.name ||
            currentProduct.title ||
            "Product";

    }


    if (checkoutProductName) {

        checkoutProductName.textContent =
            currentProduct.name ||
            currentProduct.title ||
            "Product";

    }


    if (checkoutProductCategory) {

        checkoutProductCategory.textContent =
            currentProduct.category ||
            "Product";

    }


    if (checkoutProductPrice) {

        checkoutProductPrice.textContent =
            formatPrice(
                price
            );

    }


    updateSummary();

}


/*==================================================
FEATURE: GET PRODUCT IMAGE
==================================================*/

function getProductImage(
    product
) {

    if (
        product.image &&
        typeof product.image === "string"
    ) {

        return product.image;

    }


    if (
        product.imageUrl &&
        typeof product.imageUrl === "string"
    ) {

        return product.imageUrl;

    }


    if (
        Array.isArray(
            product.images
        )
    ) {

        const validImage =
            product.images.find(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );


        if (validImage) {

            return validImage;

        }

    }


    if (
        product.images &&
        typeof product.images === "object"
    ) {

        const images =
            Object.values(
                product.images
            );


        const validImage =
            images.find(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );


        if (validImage) {

            return validImage;

        }

    }


    return "";

}


/*==================================================
FEATURE: SETUP QUANTITY CONTROLS
==================================================*/

function setupQuantityControls() {

    if (increaseQuantity) {

        increaseQuantity.addEventListener(
            "click",
            increaseProductQuantity
        );

    }


    if (decreaseQuantity) {

        decreaseQuantity.addEventListener(
            "click",
            decreaseProductQuantity
        );

    }


    if (checkoutQuantity) {

        checkoutQuantity.addEventListener(
            "change",
            validateQuantityInput
        );

    }

}


/*==================================================
FEATURE: INCREASE QUANTITY
==================================================*/

function increaseProductQuantity() {

    if (
        !currentProduct ||
        !checkoutQuantity
    ) {

        return;

    }


    let quantity =
        Number(
            checkoutQuantity.value
        ) || 1;


    if (
        quantity <
        currentStock
    ) {

        quantity++;

    }


    checkoutQuantity.value =
        quantity;


    updateSummary();

}


/*==================================================
FEATURE: DECREASE QUANTITY
==================================================*/

function decreaseProductQuantity() {

    if (!checkoutQuantity) {

        return;

    }


    let quantity =
        Number(
            checkoutQuantity.value
        ) || 1;


    if (
        quantity > 1
    ) {

        quantity--;

    }


    checkoutQuantity.value =
        quantity;


    updateSummary();

}


/*==================================================
FEATURE: QUANTITY VALIDATION
==================================================*/

function validateQuantityInput() {

    if (!checkoutQuantity) {

        return;

    }


    let quantity =
        Number(
            checkoutQuantity.value
        ) || 1;


    if (
        quantity < 1
    ) {

        quantity =
            1;

    }


    if (
        currentStock > 0 &&
        quantity > currentStock
    ) {

        quantity =
            currentStock;

    }


    checkoutQuantity.value =
        quantity;


    updateSummary();

}


/*==================================================
FEATURE: UPDATE SUMMARY
==================================================*/

function updateSummary() {

    if (
        !currentProduct ||
        !checkoutQuantity
    ) {

        return;

    }


    const price =
        Number(
            currentProduct.price || 0
        );


    let quantity =
        Number(
            checkoutQuantity.value
        ) || 1;


    if (
        quantity < 1
    ) {

        quantity =
            1;

    }


    if (
        currentStock > 0 &&
        quantity > currentStock
    ) {

        quantity =
            currentStock;

    }


    checkoutQuantity.value =
        quantity;


    const total =
        price *
        quantity;


    if (checkoutProductQuantity) {

        checkoutProductQuantity.textContent =
            quantity;

    }


    if (summaryProductPrice) {

        summaryProductPrice.textContent =
            formatPrice(
                price
            );

    }


    if (summaryQuantity) {

        summaryQuantity.textContent =
            quantity;

    }


    if (summaryTotal) {

        summaryTotal.textContent =
            formatPrice(
                total
            );

    }

}


/*==================================================
FEATURE: PLACE ORDER
==================================================*/

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        handleCheckoutSubmit
    );

}


/*==================================================
FEATURE: CHECKOUT SUBMIT HANDLER
==================================================*/

async function handleCheckoutSubmit(
    event
) {

    event.preventDefault();


    if (orderBeingPlaced) {

        return;

    }


    if (!currentProduct) {

        alert(
            "Product information is not available."
        );

        return;

    }


    await authReadyPromise;


    if (!currentUser) {

        alert(
            "Please login before placing an order."
        );

        return;

    }


    /*==================================================
    FEATURE: CUSTOMER INFORMATION
    ==================================================*/

    const customerName =
        document
            .getElementById(
                "customerName"
            )
            ?.value
            .trim() || "";


    const customerPhone =
        document
            .getElementById(
                "customerPhone"
            )
            ?.value
            .trim() || "";


    const customerCity =
        document
            .getElementById(
                "customerCity"
            )
            ?.value
            .trim() || "";


    const customerAddress =
        document
            .getElementById(
                "customerAddress"
            )
            ?.value
            .trim() || "";


    const customerNote =
        document
            .getElementById(
                "customerNote"
            )
            ?.value
            .trim() || "";


    /*==================================================
    FEATURE: PAYMENT METHOD
    ==================================================*/

    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    const paymentMethod =
        selectedPayment
            ? selectedPayment.value
            : "cod";


    /*==================================================
    FEATURE: QUANTITY
    ==================================================*/

    let quantity =
        Number(
            checkoutQuantity?.value
        ) || 1;


    /*==================================================
    FEATURE: VALIDATION
    ==================================================*/

    if (
        customerName.length < 2
    ) {

        alert(
            "Please enter your full name."
        );

        return;

    }


    if (
        !isValidPakistaniPhone(
            customerPhone
        )
    ) {

        alert(
            "Please enter a valid Pakistani mobile number, for example 03001234567."
        );

        return;

    }


    if (
        customerCity.length < 2
    ) {

        alert(
            "Please enter your city."
        );

        return;

    }


    if (
        customerAddress.length < 5
    ) {

        alert(
            "Please enter your complete delivery address."
        );

        return;

    }


    if (
        quantity < 1
    ) {

        quantity =
            1;

    }


    if (
        quantity >
        currentStock
    ) {

        alert(
            `Only ${currentStock} item(s) are currently available.`
        );

        return;

    }


    /*==================================================
    FEATURE: START PROCESS
    ==================================================*/

    orderBeingPlaced =
        true;


    if (placeOrderButton) {

        placeOrderButton.disabled =
            true;

        placeOrderButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Processing...
            `;

    }


    try {

        /*==================================================
        FEATURE: GET LATEST PRODUCT
        ==================================================*/

        const productRef =
            ref(
                db,
                `products/${productId}`
            );


        const latestSnapshot =
            await get(
                productRef
            );


        if (
            !latestSnapshot.exists()
        ) {

            throw new Error(
                "This product is no longer available."
            );

        }


        const latestProduct =
            latestSnapshot.val();


        /*==================================================
        FEATURE: LATEST STOCK
        ==================================================*/

        const latestStock =
            Number(
                latestProduct.stock || 0
            );


        if (
            latestStock <= 0
        ) {

            throw new Error(
                "This product is currently out of stock."
            );

        }


        if (
            quantity >
            latestStock
        ) {

            throw new Error(
                `Only ${latestStock} item(s) are currently available.`
            );

        }


        /*==================================================
        FEATURE: AUTHORITATIVE PRICE
        ==================================================*/

        const price =
            Number(
                latestProduct.price || 0
            );


        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {

            throw new Error(
                "This product has an invalid price."
            );

        }


        const total =
            price *
            quantity;


        /*==================================================
        FEATURE: ORDER PAYLOAD
        ==================================================*/

        const orderPayload = {

            productId:
                productId,

            productName:
                latestProduct.name ||
                latestProduct.title ||
                "Product",

            productImage:
                getProductImage(
                    latestProduct
                ),

            productCategory:
                latestProduct.category ||
                "",

            price:
                price,

            quantity:
                quantity,

            total:
                total,

            customerName:
                customerName,

            customerPhone:
                customerPhone,

            customerCity:
                customerCity,

            customerAddress:
                customerAddress,

            customerNote:
                customerNote,

            paymentMethod:
                paymentMethod,

            sellerId:
                latestProduct.sellerId ||
                latestProduct.seller ||
                "",

            sellerName:
                latestProduct.sellerName ||
                latestProduct.seller ||
                "",

            userId:
                currentUser.uid,

            customerId:
                currentUser.uid

        };


        /*==================================================
        FEATURE: COD FLOW
        ==================================================*/

        if (
            paymentMethod ===
            "cod"
        ) {

            const createdOrder =
                await createPendingOrder(
                    orderPayload
                );


            const orderId =
                createdOrder.orderId;


            const newStock =
                latestStock -
                quantity;


            await update(
                productRef,
                {

                    stock:
                        newStock,

                    updatedAt:
                        Date.now()

                }
            );


            currentStock =
                newStock;


            showOrderSuccess(
                orderId,
                total
            );


            return;

        }


        /*==================================================
        FEATURE: JAZZCASH FLOW
        ==================================================*/

        if (
            paymentMethod ===
            "jazzcash"
        ) {

            /*----------------------------------------------
            STEP 1:
            CREATE PENDING ORDER
            ----------------------------------------------*/

            const createdOrder =
                await createPendingOrder(
                    orderPayload
                );


            if (
                !createdOrder ||
                !createdOrder.orderId
            ) {

                throw new Error(
                    "Unable to create pending order."
                );

            }


            const orderId =
                createdOrder.orderId;


            /*----------------------------------------------
            STEP 2:
            GET FIREBASE ID TOKEN
            ----------------------------------------------*/

            const idToken =
                await currentUser.getIdToken(
                    true
                );


            if (!idToken) {

                throw new Error(
                    "Unable to authenticate payment request."
                );

            }


            /*----------------------------------------------
            STEP 3:
            CALL SECURE BACKEND
            ----------------------------------------------*/

            const response =
                await fetch(
                    `${BACKEND_API_URL}/api/payments/jazzcash/create`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${idToken}`

                        },

                        body:
                            JSON.stringify({

                                orderId:
                                    orderId

                            })

                    }
                );


            const paymentResult =
                await response.json();


            /*----------------------------------------------
            STEP 4:
            CHECK BACKEND RESPONSE
            ----------------------------------------------*/

            if (
                !response.ok ||
                !paymentResult ||
                !paymentResult.success
            ) {

                throw new Error(
                    paymentResult?.message ||
                    "JazzCash payment could not be started."
                );

            }


            /*----------------------------------------------
            STEP 5:
            PAYMENT FORM / REDIRECT
            ----------------------------------------------*/

            if (
                paymentResult.redirectUrl
            ) {

                window.location.href =
                    paymentResult.redirectUrl;

                return;

            }


            if (
                paymentResult.paymentUrl
            ) {

                window.location.href =
                    paymentResult.paymentUrl;

                return;

            }


            if (
                paymentResult.action &&
                paymentResult.fields
            ) {

                submitJazzCashForm(
                    paymentResult.action,
                    paymentResult.fields
                );

                return;

            }


            throw new Error(
                "JazzCash payment gateway response is incomplete."
            );

        }


        throw new Error(
            "Selected payment method is not available."
        );

    }

    catch (error) {

        console.error(
            "FINAL CHECKOUT ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to complete checkout."
        );


        orderBeingPlaced =
            false;


        if (placeOrderButton) {

            placeOrderButton.disabled =
                false;

            placeOrderButton.innerHTML =
                `
                    <i class="fa-solid fa-lock"></i>
                    Place Order
                `;

        }

    }

}


/*==================================================
FEATURE: JAZZCASH POST FORM
==================================================*/

function submitJazzCashForm(
    action,
    fields
) {

    if (
        !action ||
        !fields
    ) {

        throw new Error(
            "JazzCash payment form data is missing."
        );

    }


    const form =
        document.createElement(
            "form"
        );


    form.method =
        "POST";


    form.action =
        action;


    form.style.display =
        "none";


    Object.entries(
        fields
    ).forEach(
        ([name, value]) => {

            if (
                value === undefined ||
                value === null
            ) {

                return;

            }


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "hidden";


            input.name =
                name;


            input.value =
                String(
                    value
                );


            form.appendChild(
                input
            );

        }
    );


    document.body.appendChild(
        form
    );


    form.submit();

}


/*==================================================
FEATURE: ORDER SUCCESS
==================================================*/

function showOrderSuccess(
    orderId,
    total
) {

    if (checkoutContent) {

        checkoutContent.style.display =
            "none";

    }


    if (checkoutLoading) {

        checkoutLoading.style.display =
            "none";

    }


    if (checkoutError) {

        checkoutError.style.display =
            "none";

    }


    if (successOrderId) {

        successOrderId.textContent =
            orderId;

    }


    if (successOrderTotal) {

        successOrderTotal.textContent =
            formatPrice(
                total
            );

    }


    if (orderSuccess) {

        orderSuccess.style.display =
            "block";

    }


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

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
FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(
    price
) {

    return (
        "Rs. " +
        Number(
            price
        ).toLocaleString(
            "en-PK"
        )
    );

}


/*==================================================
FEATURE: CHECKOUT ERROR
==================================================*/

function showCheckoutError(
    message
) {

    if (checkoutLoading) {

        checkoutLoading.style.display =
            "none";

    }


    if (checkoutContent) {

        checkoutContent.style.display =
            "none";

    }


    if (checkoutError) {

        checkoutError.style.display =
            "block";

    }


    if (checkoutErrorMessage) {

        checkoutErrorMessage.textContent =
            message;

    }

}
