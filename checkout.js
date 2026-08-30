/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CHECKOUT / ORDER SYSTEM
FEATURE: FIREBASE ORDER CREATION
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
    runTransaction,
    update

} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE
==================================================*/

const db =
    getDatabase(app);


/*==================================================
FEATURE: DOM
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
FEATURE: INITIALIZE
==================================================*/

if (!productId) {

    showCheckoutError(
        "No product was selected for checkout."
    );

} else {

    loadCheckoutProduct(
        productId
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
        product.image
    ) {

        return product.image;

    }


    if (
        product.imageUrl
    ) {

        return product.imageUrl;

    }


    if (
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ) {

        return product.images[0];

    }


    if (
        product.images &&
        typeof product.images === "object"
    ) {

        const images =
            Object.values(
                product.images
            );


        if (
            images.length
        ) {

            return images[0];

        }

    }


    return "";

}


/*==================================================
FEATURE: QUANTITY INCREASE
==================================================*/

increaseQuantity.addEventListener(
    "click",
    () => {

        let quantity =
            Number(
                checkoutQuantity.value
            ) || 1;


        if (
            quantity >= currentStock
        ) {

            quantity =
                currentStock;

        } else {

            quantity++;

        }


        checkoutQuantity.value =
            quantity;


        updateSummary();

    }
);


/*==================================================
FEATURE: QUANTITY DECREASE
==================================================*/

decreaseQuantity.addEventListener(
    "click",
    () => {

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
);


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
==================================================*/

checkoutForm.addEventListener(
    "submit",
    async (
        event
    ) => {

        event.preventDefault();


        if (!currentProduct) {

            return;

        }


        if (
            placeOrderButton.disabled
        ) {

            return;

        }


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


        const paymentMethod =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            )?.value ||
            "cod";


        const quantity =
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
            quantity < 1 ||
            quantity > currentStock
        ) {

            alert(
                `Only ${currentStock} item(s) are currently available.`
            );

            return;

        }


        /*==================================================
        FEATURE: BUTTON LOADING
        ==================================================*/

        placeOrderButton.disabled =
            true;


        placeOrderButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Processing Order...
            `;


        try {

            /*==================================================
            FEATURE: RECHECK PRODUCT
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
                    "Product is no longer available."
                );

            }


            const latestProduct =
                latestSnapshot.val();


            const latestStock =
                Number(
                    latestProduct.stock || 0
                );


            if (
                latestStock < quantity
            ) {

                throw new Error(
                    `Only ${latestStock} item(s) are currently available.`
                );

            }


            /*==================================================
            FEATURE: TOTAL
            ==================================================*/

            const price =
                Number(
                    latestProduct.price || 0
                );


            const total =
                price *
                quantity;


            /*==================================================
            FEATURE: STOCK TRANSACTION
            ==================================================*/

            const stockResult =
                await runTransaction(
                    productRef,
                    product => {

                        if (
                            product === null
                        ) {

                            return;

                        }


                        const stock =
                            Number(
                                product.stock || 0
                            );


                        if (
                            stock < quantity
                        ) {

                            return;

                        }


                        product.stock =
                            stock -
                            quantity;


                        product.updatedAt =
                            Date.now();


                        return product;

                    }
                );


            if (
                !stockResult.committed
            ) {

                throw new Error(
                    "The requested quantity is no longer available."
                );

            }


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

                status:
                    "pending",

                paymentStatus:
                    paymentMethod === "cod"
                        ? "pending"
                        : "pending",

                deliveryStatus:
                    "pending",

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
            FEATURE: SHOW SUCCESS
            ==================================================*/

            showOrderSuccess(
                orderId,
                total
            );

        }

        catch (error) {

            console.error(
                "Order creation error:",
                error
            );


            alert(
                error.message ||
                "Unable to place your order. Please try again."
            );


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
FEATURE: SUCCESS
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
FEATURE: PHONE VALIDATION
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
