/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER COMMISSION SYSTEM
FILE: commission.js

PURPOSE:
Calculate SmartBazaar platform commission and
seller earning after a successful order.

IMPORTANT:
Commission percentages should ultimately be
controlled by Admin/backend for production.
==================================================*/


/*==================================================
FEATURE: DEFAULT COMMISSION CONFIGURATION
==================================================*/

export const COMMISSION_CONFIG = {

    defaultRate: 10,

    currency: "PKR",

    minimumRate: 0,

    maximumRate: 100

};


/*==================================================
FEATURE: NORMALIZE COMMISSION RATE
==================================================*/

export function normalizeCommissionRate(rate) {

    const numericRate =
        Number(rate);

    if (!Number.isFinite(numericRate)) {
        return COMMISSION_CONFIG.defaultRate;
    }

    return Math.min(
        COMMISSION_CONFIG.maximumRate,
        Math.max(
            COMMISSION_CONFIG.minimumRate,
            numericRate
        )
    );
}


/*==================================================
FEATURE: CALCULATE COMMISSION
==================================================*/

export function calculateCommission(
    amount,
    rate = COMMISSION_CONFIG.defaultRate
) {

    const grossAmount =
        Number(amount || 0);

    const commissionRate =
        normalizeCommissionRate(rate);

    if (
        !Number.isFinite(grossAmount) ||
        grossAmount <= 0
    ) {

        return {
            grossAmount: 0,
            commissionRate,
            commissionAmount: 0,
            sellerEarning: 0
        };
    }


    const commissionAmount =
        Number(
            (
                grossAmount *
                commissionRate /
                100
            ).toFixed(2)
        );


    const sellerEarning =
        Number(
            (
                grossAmount -
                commissionAmount
            ).toFixed(2)
        );


    return {

        grossAmount,

        commissionRate,

        commissionAmount,

        sellerEarning
    };
}


/*==================================================
FEATURE: CALCULATE FROM ORDER
==================================================*/

export function calculateOrderCommission(order) {

    if (!order) {

        throw new Error(
            "Order data is required."
        );
    }


    const amount =
        Number(
            order.subtotal ??
            order.total ??
            0
        );


    const rate =
        order.commissionRate ??
        COMMISSION_CONFIG.defaultRate;


    return calculateCommission(
        amount,
        rate
    );
}


/*==================================================
FEATURE: BUILD COMMISSION RECORD
==================================================*/

export function createCommissionRecord(
    order,
    options = {}
) {

    const calculation =
        calculateOrderCommission(order);


    return {

        orderId:
            order.orderId ||
            order.id ||
            "",

        productId:
            order.productId ||
            "",

        sellerId:
            order.sellerId ||
            "",

        grossAmount:
            calculation.grossAmount,

        commissionRate:
            calculation.commissionRate,

        commissionAmount:
            calculation.commissionAmount,

        sellerEarning:
            calculation.sellerEarning,

        currency:
            options.currency ||
            COMMISSION_CONFIG.currency,

        status:
            options.status ||
            "pending",

        createdAt:
            options.createdAt ||
            Date.now()
    };
}


/*==================================================
FEATURE: VERIFY COMMISSION CALCULATION
==================================================*/

export function verifyCommissionCalculation(
    grossAmount,
    commissionAmount,
    sellerEarning
) {

    const gross =
        Number(grossAmount || 0);

    const commission =
        Number(commissionAmount || 0);

    const earning =
        Number(sellerEarning || 0);


    if (
        !Number.isFinite(gross) ||
        !Number.isFinite(commission) ||
        !Number.isFinite(earning)
    ) {
        return false;
    }


    return (
        Math.abs(
            gross -
            commission -
            earning
        ) <= 0.01
    );
}
