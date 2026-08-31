/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CHECKOUT / ORDER SYSTEM
FEATURE: FIREBASE ORDER CREATION
FEATURE: STOCK VALIDATION
FEATURE: PAYMENT METHOD SELECTION
FEATURE: ORDER SUCCESS SYSTEM
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {

    getDatabase,
    ref,
    get,
    push,
    set,
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
FEATURE: ORDER STATE
==================================================*/

let orderBeingPlaced =
    false;


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


        checkoutQuantity.value =
            requestedQuantity;


        checkoutQuantity.min =
            "1";


        checkoutQuantity.max =
            String(
                currentStock
            );


        renderCheckoutProduct();


        checkoutLoading.style.display =
            "none";


        checkoutContent.style.display =
            "grid";

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


    checkoutProductImage.src =
        image;


    checkoutProductImage.alt =
        currentProduct.name ||
        currentProduct.title ||
        "Product";


    checkoutProductName.textContent =
        currentProduct.name ||
        currentProduct.title ||
        "Product";


    checkoutProductCategory.textContent =
        currentProduct.category ||
        "Product";


    checkoutProductPrice.textContent =
        formatPrice(
            price
        );


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

    if (!currentProduct) {

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

    if (!currentProduct) {

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


    checkoutProductQuantity.textContent =
        quantity;


    summaryProductPrice.textContent =
        formatPrice(
            price
        );


    summaryQuantity.textContent =
        quantity;


    summaryTotal.textContent =
        formatPrice(
            total
        );

}


/*==================================================
FEATURE: PLACE ORDER
FEATURE: FINAL ORDER CREATION
==================================================*/

checkoutForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (
            orderBeingPlaced
        ) {

            return;

        }


        if (!currentProduct) {

            alert(
                "Product information is not available."
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
                .value
                .trim();


        const customerPhone =
            document
                .getElementById(
                    "customerPhone"
                )
                .value
                .trim();


        const customerCity =
            document
                .getElementById(
                    "customerCity"
                )
                .value
                .trim();


        const customerAddress =
            document
                .getElementById(
                    "customerAddress"
                )
                .value
                .trim();


        const customerNote =
            document
                .getElementById(
                    "customerNote"
                )
                .value
                .trim();


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
                checkoutQuantity.value
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
        FEATURE: START ORDER
        ==================================================*/

        orderBeingPlaced =
            true;


        placeOrderButton.disabled =
            true;


        placeOrderButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Processing Order...
            `;


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
            FEATURE: CHECK LATEST STOCK
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
            FEATURE: CALCULATE TOTAL
            ==================================================*/

            const price =
                Number(
                    latestProduct.price || 0
                );


            const total =
                price *
                quantity;


            /*==================================================
            FEATURE: CREATE ORDER ID
            ==================================================*/

            const ordersRef =
                ref(
                    db,
                    "orders"
                );


            const newOrderRef =
                push(
                    ordersRef
                );


            const orderId =
                newOrderRef.key;


            /*==================================================
            FEATURE: ORDER DATA
            ==================================================*/

            const orderData = {

                orderId:
                    orderId,

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

                paymentStatus:
                    "pending",

                status:
                    "pending",

                deliveryStatus:
                    "pending",

                sellerId:
                    latestProduct.sellerId ||
                    latestProduct.seller ||
                    "",

                sellerName:
                    latestProduct.sellerName ||
                    latestProduct.seller ||
                    "",

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now()

            };


            /*==================================================
            FEATURE: SAVE ORDER
            ==================================================*/

            await set(
                newOrderRef,
                orderData
            );


            /*==================================================
            FEATURE: UPDATE STOCK
            ==================================================*/

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


            /*==================================================
            FEATURE: UPDATE LOCAL STOCK
            ==================================================*/

            currentStock =
                newStock;


            /*==================================================
            FEATURE: SHOW SUCCESS
            ==================================================*/

            showOrderSuccess(
                orderId,
                total
            );

        }

        catch (error) {

            console.error(
                "FINAL ORDER ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to place your order. Please try again."
            );


            orderBeingPlaced =
                false;


            placeOrderButton.disabled =
                false;


            placeOrderButton.innerHTML =
                `
                    <i class="fa-solid fa-lock"></i>
                    Place Order
                `;

        }

    }
);


/*==================================================
FEATURE: ORDER SUCCESS
==================================================*/

function showOrderSuccess(
    orderId,
    total
) {

    checkoutContent.style.display =
        "none";


    checkoutLoading.style.display =
        "none";


    checkoutError.style.display =
        "none";


    successOrderId.textContent =
        orderId;


    successOrderTotal.textContent =
        formatPrice(
            total
        );


    orderSuccess.style.display =
        "block";


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

    checkoutLoading.style.display =
        "none";


    checkoutContent.style.display =
        "none";


    checkoutError.style.display =
        "block";


    checkoutErrorMessage.textContent =
        message;

}
