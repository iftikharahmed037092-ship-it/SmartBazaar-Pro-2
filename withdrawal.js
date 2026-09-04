/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER WITHDRAWAL SYSTEM
FILE: withdrawal.js

PURPOSE:
Create and manage seller withdrawal requests.

IMPORTANT:
Actual money transfer must NEVER be performed
directly from frontend.

Frontend creates a withdrawal REQUEST.
Secure backend/Admin process handles the actual
JazzCash payout.
==================================================*/

import {
    ref,
    get,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { database } from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE AUTH
==================================================*/

const auth = getAuth();


/*==================================================
FEATURE: DATABASE PATHS
==================================================*/

const WALLET_PATH =
    "sellerWallets";

const WITHDRAWALS_PATH =
    "withdrawals";


/*==================================================
FEATURE: WITHDRAWAL STATUS
==================================================*/

export const WITHDRAWAL_STATUS = {

    PENDING:
        "pending",

    PROCESSING:
        "processing",

    COMPLETED:
        "completed",

    FAILED:
        "failed",

    CANCELLED:
        "cancelled"
};


/*==================================================
FEATURE: MINIMUM WITHDRAWAL
==================================================*/

export const WITHDRAWAL_CONFIG = {

    minimumAmount:
        100,

    currency:
        "PKR"
};


/*==================================================
FEATURE: GET CURRENT SELLER
==================================================*/

function getCurrentSeller() {

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login before requesting withdrawal."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET SELLER WALLET
==================================================*/

async function getWallet(sellerId) {

    const walletRef =
        ref(
            database,
            `${WALLET_PATH}/${sellerId}`
        );

    const snapshot =
        await get(walletRef);

    if (!snapshot.exists()) {

        return {
            availableBalance: 0
        };
    }

    return snapshot.val();
}


/*==================================================
FEATURE: VALIDATE JAZZCASH NUMBER
==================================================*/

export function isValidJazzCashNumber(phone) {

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
FEATURE: CREATE WITHDRAWAL REQUEST
==================================================*/

export async function createWithdrawalRequest({

    amount,

    jazzCashNumber,

    accountTitle = "",

    note = ""

}) {

    const user =
        getCurrentSeller();


    /*----------------------------------------------
    VALIDATE AMOUNT
    ----------------------------------------------*/

    const withdrawalAmount =
        Number(amount);


    if (
        !Number.isFinite(withdrawalAmount) ||
        withdrawalAmount <= 0
    ) {

        throw new Error(
            "Please enter a valid withdrawal amount."
        );
    }


    if (
        withdrawalAmount <
        WITHDRAWAL_CONFIG.minimumAmount
    ) {

        throw new Error(
            `Minimum withdrawal is ${WITHDRAWAL_CONFIG.minimumAmount} PKR.`
        );
    }


    /*----------------------------------------------
    VALIDATE JAZZCASH NUMBER
    ----------------------------------------------*/

    if (
        !isValidJazzCashNumber(
            jazzCashNumber
        )
    ) {

        throw new Error(
            "Please enter a valid JazzCash mobile number."
        );
    }


    /*----------------------------------------------
    CHECK WALLET BALANCE
    ----------------------------------------------*/

    const wallet =
        await getWallet(
            user.uid
        );


    const availableBalance =
        Number(
            wallet.availableBalance || 0
        );


    if (
        withdrawalAmount >
        availableBalance
    ) {

        throw new Error(
            "Insufficient wallet balance."
        );
    }


    /*----------------------------------------------
    CREATE REQUEST
    ----------------------------------------------*/

    const withdrawalsRef =
        ref(
            database,
            WITHDRAWALS_PATH
        );


    const withdrawalRef =
        push(
            withdrawalsRef
        );


    const withdrawalId =
        withdrawalRef.key;


    /*----------------------------------------------
    WITHDRAWAL DATA
    ----------------------------------------------*/

    const withdrawalData = {

        withdrawalId,

        sellerId:
            user.uid,

        sellerEmail:
            user.email || "",

        amount:
            withdrawalAmount,

        currency:
            WITHDRAWAL_CONFIG.currency,

        paymentMethod:
            "jazzcash",

        jazzCashNumber:
            jazzCashNumber,

        accountTitle:
            accountTitle,

        note:
            note,

        status:
            WITHDRAWAL_STATUS.PENDING,

        payoutTransactionId:
            null,

        failureReason:
            null,

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()
    };


    /*----------------------------------------------
    SAVE REQUEST
    ----------------------------------------------*/

    await set(
        withdrawalRef,
        withdrawalData
    );


    return {

        withdrawalId,

        amount:
            withdrawalAmount,

        status:
            WITHDRAWAL_STATUS.PENDING
    };
}


/*==================================================
FEATURE: GET WITHDRAWAL
==================================================*/

export async function getWithdrawal(
    withdrawalId
) {

    const user =
        getCurrentSeller();


    if (!withdrawalId) {

        throw new Error(
            "Withdrawal ID is required."
        );
    }


    const withdrawalRef =
        ref(
            database,
            `${WITHDRAWALS_PATH}/${withdrawalId}`
        );


    const snapshot =
        await get(withdrawalRef);


    if (!snapshot.exists()) {
        return null;
    }


    const withdrawal =
        snapshot.val();


    if (
        withdrawal.sellerId !==
        user.uid
    ) {

        throw new Error(
            "You are not authorized to view this withdrawal."
        );
    }


    return {

        firebaseKey:
            withdrawalId,

        ...withdrawal
    };
}
