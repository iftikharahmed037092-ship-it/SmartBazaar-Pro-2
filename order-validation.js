/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ORDER VALIDATION
FILE: order-validation.js
==================================================*/


/*==================================================
FEATURE: VALIDATE PAKISTANI PHONE
==================================================*/

export function isValidPakistaniPhone(phone) {

    if (!phone) {
        return false;
    }

    const normalized =
        String(phone)
            .replace(/\s+/g, "")
            .trim();

    return /^03\d{9}$/.test(
        normalized
    );
}


/*==================================================
FEATURE: VALIDATE REQUIRED TEXT
==================================================*/

function isValidText(value) {

    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
}


/*==================================================
FEATURE: VALIDATE PRODUCT
==================================================*/

export function validateProductData(data) {

    if (!data) {

        return {
            valid: false,
            message:
                "Product information is missing."
        };
    }


    if (!isValidText(data.productId)) {

        return {
            valid: false,
            message:
                "Product ID is required."
        };
    }


    const price =
        Number(data.price);


    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        return {
            valid: false,
            message:
                "Invalid product price."
        };
    }


    const quantity =
        Number(data.quantity);


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        return {
            valid: false,
            message:
                "Invalid product quantity."
        };
    }


    return {
        valid: true,
        message: ""
    };
}


/*==================================================
FEATURE: VALIDATE CUSTOMER
==================================================*/

export function validateCustomerData(data) {

    if (!data) {

        return {
            valid: false,
            message:
                "Customer information is missing."
        };
    }


    if (
        !isValidText(
            data.customerName
        )
    ) {

        return {
            valid: false,
            message:
                "Customer name is required."
        };
    }


    if (
        !isValidPakistaniPhone(
            data.customerPhone
        )
    ) {

        return {
            valid: false,
            message:
                "Please enter a valid Pakistani mobile number."
        };
    }


    if (
        !isValidText(
            data.customerCity
        )
    ) {

        return {
            valid: false,
            message:
                "City is required."
        };
    }


    if (
        !isValidText(
            data.customerAddress
        )
    ) {

        return {
            valid: false,
            message:
                "Complete delivery address is required."
        };
    }


    return {
        valid: true,
        message: ""
    };
}


/*==================================================
FEATURE: VALIDATE PAYMENT METHOD
==================================================*/

export function validatePaymentMethod(
    paymentMethod
) {

    if (!isValidText(paymentMethod)) {

        return {
            valid: false,
            message:
                "Please select a payment method."
        };
    }


    const allowedMethods = [

        "cod",

        "jazzcash",

        "easypaisa"

    ];


    if (
        !allowedMethods.includes(
            paymentMethod
        )
    ) {

        return {
            valid: false,
            message:
                "Invalid payment method."
        };
    }


    return {
        valid: true,
        message: ""
    };
}


/*==================================================
FEATURE: VALIDATE ORDER TOTAL
==================================================*/

export function validateOrderTotal(data) {

    const price =
        Number(data.price || 0);

    const quantity =
        Number(data.quantity || 0);

    const deliveryFee =
        Number(data.deliveryFee || 0);

    const calculatedSubtotal =
        price * quantity;

    const calculatedTotal =
        calculatedSubtotal +
        deliveryFee;


    const submittedTotal =
        Number(
            data.total ||
            calculatedTotal
        );


    if (
        !Number.isFinite(submittedTotal) ||
        submittedTotal <= 0
    ) {

        return {
            valid: false,
            message:
                "Invalid order total."
        };
    }


    /*
     * Allow tiny floating-point difference.
     */

    if (
        Math.abs(
            submittedTotal -
            calculatedTotal
        ) > 0.01
    ) {

        return {
            valid: false,
            message:
                "Order total does not match product price."
        };
    }


    return {
        valid: true,
        message: ""
    };
}


/*==================================================
FEATURE: COMPLETE ORDER VALIDATION
==================================================*/

export function validateOrderData(data) {

    const productResult =
        validateProductData(data);

    if (!productResult.valid) {
        return productResult;
    }


    const customerResult =
        validateCustomerData(data);

    if (!customerResult.valid) {
        return customerResult;
    }


    const paymentResult =
        validatePaymentMethod(
            data.paymentMethod
        );

    if (!paymentResult.valid) {
        return paymentResult;
    }


    const totalResult =
        validateOrderTotal(data);

    if (!totalResult.valid) {
        return totalResult;
    }


    return {
        valid: true,
        message: ""
    };
}
