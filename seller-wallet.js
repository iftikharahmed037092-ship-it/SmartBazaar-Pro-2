/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SELLER WALLET SYSTEM
FILE: seller-wallet.js

PURPOSE:
Read seller wallet information and provide the
foundation for wallet transactions.

IMPORTANT:
Wallet credit must only happen after verified
payment/order completion through secure backend.
==================================================*/

import {
    ref,
    get
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
FEATURE: WALLET PATH
==================================================*/

const WALLET_PATH =
    "sellerWallets";


/*==================================================
FEATURE: GET CURRENT SELLER
==================================================*/

function getCurrentSeller() {

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login to access seller wallet."
        );
    }

    return user;
}


/*==================================================
FEATURE: DEFAULT WALLET
==================================================*/

export function createEmptyWallet(
    sellerId
) {

    return {

        sellerId,

        currency:
            "PKR",

        availableBalance:
            0,

        pendingBalance:
            0,

        withdrawnBalance:
            0,

        totalEarned:
            0,

        totalCommission:
            0,

        totalSales:
            0,

        walletStatus:
            "active",

        updatedAt:
            Date.now()
    };
}


/*==================================================
FEATURE: GET SELLER WALLET
==================================================*/

export async function getSellerWallet(
    sellerId = null
) {

    const user =
        getCurrentSeller();

    const uid =
        sellerId || user.uid;


    if (uid !== user.uid) {

        throw new Error(
            "You are not authorized to view this wallet."
        );
    }


    const walletRef =
        ref(
            database,
            `${WALLET_PATH}/${uid}`
        );


    const snapshot =
        await get(walletRef);


    if (!snapshot.exists()) {

        return createEmptyWallet(
            uid
        );
    }


    return {

        sellerId: uid,

        ...snapshot.val()
    };
}


/*==================================================
FEATURE: WALLET BALANCE
==================================================*/

export async function getAvailableBalance(
    sellerId = null
) {

    const wallet =
        await getSellerWallet(
            sellerId
        );

    return Number(
        wallet.availableBalance || 0
    );
}


/*==================================================
FEATURE: PENDING BALANCE
==================================================*/

export async function getPendingBalance(
    sellerId = null
) {

    const wallet =
        await getSellerWallet(
            sellerId
        );

    return Number(
        wallet.pendingBalance || 0
    );
}


/*==================================================
FEATURE: WALLET SUMMARY
==================================================*/

export async function getWalletSummary(
    sellerId = null
) {

    const wallet =
        await getSellerWallet(
            sellerId
        );


    return {

        availableBalance:
            Number(
                wallet.availableBalance || 0
            ),

        pendingBalance:
            Number(
                wallet.pendingBalance || 0
            ),

        withdrawnBalance:
            Number(
                wallet.withdrawnBalance || 0
            ),

        totalEarned:
            Number(
                wallet.totalEarned || 0
            ),

        totalCommission:
            Number(
                wallet.totalCommission || 0
            ),

        totalSales:
            Number(
                wallet.totalSales || 0
            ),

        currency:
            wallet.currency || "PKR",

        walletStatus:
            wallet.walletStatus || "active"
    };
}


/*==================================================
FEATURE: FORMAT WALLET AMOUNT
==================================================*/

export function formatWalletAmount(
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
