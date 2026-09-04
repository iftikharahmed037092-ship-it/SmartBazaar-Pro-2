/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PAYMENT METHODS
FILE: payment-methods.js
==================================================*/

export const PAYMENT_METHODS = {
    COD: "cod",
    JAZZCASH: "jazzcash",
    EASYPAISA: "easypaisa"
};

export const PAYMENT_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    PAID: "paid",
    FAILED: "failed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded"
};

/*==================================================
FEATURE: PAYMENT METHOD LABELS
==================================================*/

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.COD]: "Cash on Delivery",
    [PAYMENT_METHODS.JAZZCASH]: "JazzCash",
    [PAYMENT_METHODS.EASYPAISA]: "EasyPaisa"
};

/*==================================================
FEATURE: GET SELECTED PAYMENT METHOD
==================================================*/

export function getSelectedPaymentMethod(selector = 'input[name="paymentMethod"]:checked') {
    const selected = document.querySelector(selector);

    if (!selected) {
        return null;
    }

    return selected.value;
}

/*==================================================
FEATURE: VALIDATE PAYMENT METHOD
==================================================*/

export function isValidPaymentMethod(method) {
    return Object.values(PAYMENT_METHODS).includes(method);
}

/*==================================================
FEATURE: PAYMENT METHOD AVAILABILITY
==================================================*/

export function isOnlinePaymentMethod(method) {
    return (
        method === PAYMENT_METHODS.JAZZCASH ||
        method === PAYMENT_METHODS.EASYPAISA
    );
}

/*==================================================
FEATURE: PAYMENT STATUS
==================================================*/

export function isSuccessfulPayment(status) {
    return status === PAYMENT_STATUS.PAID;
}

export function isPendingPayment(status) {
    return (
        status === PAYMENT_STATUS.PENDING ||
        status === PAYMENT_STATUS.PROCESSING
    );
}

export function isFailedPayment(status) {
    return (
        status === PAYMENT_STATUS.FAILED ||
        status === PAYMENT_STATUS.CANCELLED
    );
}

/*==================================================
FEATURE: PAYMENT METHOD DISPLAY
==================================================*/

export function getPaymentMethodLabel(method) {
    return PAYMENT_METHOD_LABELS[method] || "Unknown Payment Method";
}

/*==================================================
FEATURE: PAYMENT METHOD CONFIGURATION
==================================================*/

export function getPaymentMethodConfig(method) {

    switch (method) {

        case PAYMENT_METHODS.COD:
            return {
                method: PAYMENT_METHODS.COD,
                name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.COD],
                type: "offline",
                enabled: true,
                requiresOnlinePayment: false
            };

        case PAYMENT_METHODS.JAZZCASH:
            return {
                method: PAYMENT_METHODS.JAZZCASH,
                name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.JAZZCASH],
                type: "online",
                enabled: true,
                requiresOnlinePayment: true
            };

        case PAYMENT_METHODS.EASYPAISA:
            return {
                method: PAYMENT_METHODS.EASYPAISA,
                name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.EASYPAISA],
                type: "online",
                enabled: false,
                requiresOnlinePayment: true
            };

        default:
            return null;
    }
}

/*==================================================
FEATURE: PAYMENT METHOD EVENTS
==================================================*/

export function initializePaymentMethods(options = {}) {

    const {
        selector = 'input[name="paymentMethod"]',
        onChange = null
    } = options;

    const paymentInputs = document.querySelectorAll(selector);

    paymentInputs.forEach(input => {

        input.addEventListener("change", event => {

            const method = event.target.value;
            const config = getPaymentMethodConfig(method);

            if (typeof onChange === "function") {
                onChange(method, config);
            }

        });

    });

    return paymentInputs;
}
