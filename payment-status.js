/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PAYMENT STATUS SYSTEM
FILE: payment-status.js
==================================================*/

import {
    PAYMENT_STATUS
} from "./payment-methods.js";

/*==================================================
FEATURE: STATUS LABELS
==================================================*/

const STATUS_LABELS = {

    [PAYMENT_STATUS.PENDING]:
        "Payment Pending",

    [PAYMENT_STATUS.PROCESSING]:
        "Payment Processing",

    [PAYMENT_STATUS.PAID]:
        "Payment Successful",

    [PAYMENT_STATUS.FAILED]:
        "Payment Failed",

    [PAYMENT_STATUS.CANCELLED]:
        "Payment Cancelled",

    [PAYMENT_STATUS.REFUNDED]:
        "Payment Refunded"
};

/*==================================================
FEATURE: STATUS MESSAGES
==================================================*/

const STATUS_MESSAGES = {

    [PAYMENT_STATUS.PENDING]:
        "Your payment is waiting for confirmation.",

    [PAYMENT_STATUS.PROCESSING]:
        "Your payment is being processed.",

    [PAYMENT_STATUS.PAID]:
        "Your payment has been successfully verified.",

    [PAYMENT_STATUS.FAILED]:
        "Your payment could not be completed.",

    [PAYMENT_STATUS.CANCELLED]:
        "Your payment was cancelled.",

    [PAYMENT_STATUS.REFUNDED]:
        "Your payment has been refunded."
};

/*==================================================
FEATURE: GET STATUS LABEL
==================================================*/

export function getPaymentStatusLabel(status) {

    return (
        STATUS_LABELS[status] ||
        "Unknown Payment Status"
    );
}

/*==================================================
FEATURE: GET STATUS MESSAGE
==================================================*/

export function getPaymentStatusMessage(status) {

    return (
        STATUS_MESSAGES[status] ||
        "Payment status is unavailable."
    );
}

/*==================================================
FEATURE: STATUS TYPE
==================================================*/

export function getPaymentStatusType(status) {

    switch (status) {

        case PAYMENT_STATUS.PAID:
            return "success";

        case PAYMENT_STATUS.PENDING:
        case PAYMENT_STATUS.PROCESSING:
            return "pending";

        case PAYMENT_STATUS.FAILED:
        case PAYMENT_STATUS.CANCELLED:
            return "failed";

        case PAYMENT_STATUS.REFUNDED:
            return "refunded";

        default:
            return "unknown";
    }
}

/*==================================================
FEATURE: STATUS CHECKS
==================================================*/

export function isPaid(status) {
    return status === PAYMENT_STATUS.PAID;
}

export function isPending(status) {

    return (
        status === PAYMENT_STATUS.PENDING ||
        status === PAYMENT_STATUS.PROCESSING
    );
}

export function isFailed(status) {

    return (
        status === PAYMENT_STATUS.FAILED ||
        status === PAYMENT_STATUS.CANCELLED
    );
}

export function isRefunded(status) {
    return status === PAYMENT_STATUS.REFUNDED;
}

/*==================================================
FEATURE: NORMALIZE PAYMENT STATUS
==================================================*/

export function normalizePaymentStatus(status) {

    if (!status) {
        return PAYMENT_STATUS.PENDING;
    }

    const normalized = String(status)
        .trim()
        .toLowerCase();

    const validStatuses =
        Object.values(PAYMENT_STATUS);

    if (validStatuses.includes(normalized)) {
        return normalized;
    }

    return PAYMENT_STATUS.PENDING;
}

/*==================================================
FEATURE: BUILD PAYMENT STATUS OBJECT
==================================================*/

export function createPaymentStatus(status, extra = {}) {

    const normalizedStatus =
        normalizePaymentStatus(status);

    return {

        status: normalizedStatus,

        label:
            getPaymentStatusLabel(normalizedStatus),

        message:
            getPaymentStatusMessage(normalizedStatus),

        type:
            getPaymentStatusType(normalizedStatus),

        isPaid:
            isPaid(normalizedStatus),

        isPending:
            isPending(normalizedStatus),

        isFailed:
            isFailed(normalizedStatus),

        isRefunded:
            isRefunded(normalizedStatus),

        updatedAt:
            Date.now(),

        ...extra
    };
}

/*==================================================
FEATURE: RENDER PAYMENT STATUS
==================================================*/

export function renderPaymentStatus(
    container,
    status,
    extra = {}
) {

    if (!container) {
        return;
    }

    const statusData =
        createPaymentStatus(status, extra);

    container.dataset.status =
        statusData.status;

    container.dataset.type =
        statusData.type;

    container.innerHTML = `
        <div class="payment-status payment-status-${statusData.type}">
            <div class="payment-status-label">
                ${escapeHTML(statusData.label)}
            </div>

            <div class="payment-status-message">
                ${escapeHTML(statusData.message)}
            </div>
        </div>
    `;
}

/*==================================================
FEATURE: SAFE HTML
==================================================*/

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
