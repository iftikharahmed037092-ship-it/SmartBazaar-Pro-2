/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ORDER STATUS SYSTEM
FILE: order-status.js
==================================================*/


/*==================================================
FEATURE: ORDER STATUS
==================================================*/

export const ORDER_STATUS = {

    PENDING:
        "pending",

    PAYMENT_PROCESSING:
        "payment_processing",

    CONFIRMED:
        "confirmed",

    PROCESSING:
        "processing",

    SHIPPED:
        "shipped",

    OUT_FOR_DELIVERY:
        "out_for_delivery",

    DELIVERED:
        "delivered",

    CANCELLED:
        "cancelled",

    PAYMENT_FAILED:
        "payment_failed",

    RETURN_REQUESTED:
        "return_requested",

    RETURNED:
        "returned",

    REFUNDED:
        "refunded"
};


/*==================================================
FEATURE: PAYMENT ORDER STATUS
==================================================*/

export const PAYMENT_ORDER_STATUS = {

    PENDING:
        "pending",

    PROCESSING:
        "processing",

    PAID:
        "paid",

    FAILED:
        "failed",

    CANCELLED:
        "cancelled",

    REFUNDED:
        "refunded"
};


/*==================================================
FEATURE: DELIVERY STATUS
==================================================*/

export const DELIVERY_STATUS = {

    PENDING:
        "pending",

    PROCESSING:
        "processing",

    SHIPPED:
        "shipped",

    OUT_FOR_DELIVERY:
        "out_for_delivery",

    DELIVERED:
        "delivered",

    RETURNED:
        "returned"
};


/*==================================================
FEATURE: STATUS LABELS
==================================================*/

const ORDER_STATUS_LABELS = {

    pending:
        "Order Pending",

    payment_processing:
        "Payment Processing",

    confirmed:
        "Order Confirmed",

    processing:
        "Processing",

    shipped:
        "Shipped",

    out_for_delivery:
        "Out for Delivery",

    delivered:
        "Delivered",

    cancelled:
        "Cancelled",

    payment_failed:
        "Payment Failed",

    return_requested:
        "Return Requested",

    returned:
        "Returned",

    refunded:
        "Refunded"
};


/*==================================================
FEATURE: GET ORDER STATUS LABEL
==================================================*/

export function getOrderStatusLabel(status) {

    return (
        ORDER_STATUS_LABELS[status] ||
        "Unknown Status"
    );
}


/*==================================================
FEATURE: PAYMENT STATUS CHECK
==================================================*/

export function isOrderPaid(order) {

    if (!order) {
        return false;
    }

    return (
        order.paymentStatus ===
        PAYMENT_ORDER_STATUS.PAID
    );
}


/*==================================================
FEATURE: ORDER CAN BE CANCELLED
==================================================*/

export function canCancelOrder(order) {

    if (!order) {
        return false;
    }


    const blockedStatuses = [

        ORDER_STATUS.SHIPPED,

        ORDER_STATUS.OUT_FOR_DELIVERY,

        ORDER_STATUS.DELIVERED,

        ORDER_STATUS.CANCELLED,

        ORDER_STATUS.RETURNED,

        ORDER_STATUS.REFUNDED

    ];


    return !blockedStatuses.includes(
        order.status
    );
}


/*==================================================
FEATURE: ORDER CAN BE FULFILLED
==================================================*/

export function canProcessOrder(order) {

    if (!order) {
        return false;
    }


    return (
        order.status ===
        ORDER_STATUS.CONFIRMED
    );
}


/*==================================================
FEATURE: DELIVERY COMPLETED
==================================================*/

export function isOrderDelivered(order) {

    if (!order) {
        return false;
    }

    return (
        order.status ===
        ORDER_STATUS.DELIVERED ||

        order.deliveryStatus ===
        DELIVERY_STATUS.DELIVERED
    );
}
