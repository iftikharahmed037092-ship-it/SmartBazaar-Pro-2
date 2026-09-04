/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER TRANSACTIONS
FILE: seller-transactions.js

PURPOSE:
Read and organize seller financial transactions.

TRANSACTION TYPES:
- earning
- commission
- withdrawal
- refund
- adjustment

IMPORTANT:
Financial writes should be performed by secure
backend/Admin-controlled processes.
==================================================*/

import {
    ref,
    get,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { database } from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE AUTH
==================================================*/

const auth =
    getAuth();


/*==================================================
FEATURE: TRANSACTIONS PATH
==================================================*/

const TRANSACTIONS_PATH =
    "sellerTransactions";


/*==================================================
FEATURE: TRANSACTION TYPES
==================================================*/

export const TRANSACTION_TYPES = {

    EARNING:
        "earning",

    COMMISSION:
        "commission",

    WITHDRAWAL:
        "withdrawal",

    REFUND:
        "refund",

    ADJUSTMENT:
        "adjustment"
};


/*==================================================
FEATURE: GET CURRENT SELLER
==================================================*/

function getCurrentSeller() {

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login to view transactions."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET SELLER TRANSACTIONS
==================================================*/

export async function getSellerTransactions() {

    const user =
        getCurrentSeller();


    const transactionsRef =
        ref(
            database,
            TRANSACTIONS_PATH
        );


    const transactionsQuery =
        query(
            transactionsRef,
            orderByChild("sellerId"),
            equalTo(user.uid)
        );


    const snapshot =
        await get(transactionsQuery);


    if (!snapshot.exists()) {
        return [];
    }


    const data =
        snapshot.val();


    const transactions =
        Object.entries(data)

            .map(
                ([key, transaction]) => ({
                    firebaseKey: key,
                    ...transaction
                })
            )

            .sort(
                (a, b) =>
                    Number(
                        b.createdAt || 0
                    ) -
                    Number(
                        a.createdAt || 0
                    )
            );


    return transactions;
}


/*==================================================
FEATURE: GET TRANSACTION BY ID
==================================================*/

export async function getSellerTransactionById(
    transactionId
) {

    if (!transactionId) {

        throw new Error(
            "Transaction ID is required."
        );
    }


    const user =
        getCurrentSeller();


    const transactionRef =
        ref(
            database,
            `${TRANSACTIONS_PATH}/${transactionId}`
        );


    const snapshot =
        await get(transactionRef);


    if (!snapshot.exists()) {
        return null;
    }


    const transaction =
        snapshot.val();


    if (
        transaction.sellerId !==
        user.uid
    ) {

        throw new Error(
            "You are not authorized to view this transaction."
        );
    }


    return {

        firebaseKey:
            transactionId,

        ...transaction
    };
}


/*==================================================
FEATURE: CALCULATE TRANSACTION SUMMARY
==================================================*/

export function calculateTransactionSummary(
    transactions = []
) {

    let earnings = 0;

    let commissions = 0;

    let withdrawals = 0;

    let refunds = 0;

    let adjustments = 0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount || 0
                );


            switch (
                String(
                    transaction.type || ""
                ).toLowerCase()
            ) {

                case TRANSACTION_TYPES.EARNING:

                    earnings += amount;

                    break;


                case TRANSACTION_TYPES.COMMISSION:

                    commissions += amount;

                    break;


                case TRANSACTION_TYPES.WITHDRAWAL:

                    withdrawals += amount;

                    break;


                case TRANSACTION_TYPES.REFUND:

                    refunds += amount;

                    break;


                case TRANSACTION_TYPES.ADJUSTMENT:

                    adjustments += amount;

                    break;
            }

        }
    );


    return {

        earnings:
            Number(
                earnings.toFixed(2)
            ),

        commissions:
            Number(
                commissions.toFixed(2)
            ),

        withdrawals:
            Number(
                withdrawals.toFixed(2)
            ),

        refunds:
            Number(
                refunds.toFixed(2)
            ),

        adjustments:
            Number(
                adjustments.toFixed(2)
            )
    };
}


/*==================================================
FEATURE: FORMAT TRANSACTION AMOUNT
==================================================*/

export function formatTransactionAmount(
    amount,
    currency = "PKR"
) {

    const value =
        Number(amount || 0);


    return `${currency} ${value.toLocaleString(
        "en-PK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;
}


/*==================================================
FEATURE: TRANSACTION LABEL
==================================================*/

export function getTransactionTypeLabel(
    type
) {

    switch (
        String(type || "")
            .toLowerCase()
    ) {

        case TRANSACTION_TYPES.EARNING:
            return "Sale Earning";

        case TRANSACTION_TYPES.COMMISSION:
            return "Platform Commission";

        case TRANSACTION_TYPES.WITHDRAWAL:
            return "Withdrawal";

        case TRANSACTION_TYPES.REFUND:
            return "Refund";

        case TRANSACTION_TYPES.ADJUSTMENT:
            return "Balance Adjustment";

        default:
            return "Transaction";
    }
}
