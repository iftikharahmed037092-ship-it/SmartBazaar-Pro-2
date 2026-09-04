/*==================================================
SMARTBAZAAR PRO 2
FEATURE: WITHDRAWAL HISTORY
FILE: withdrawal-history.js
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
FEATURE: WITHDRAWAL PATH
==================================================*/

const WITHDRAWALS_PATH =
    "withdrawals";


/*==================================================
FEATURE: GET CURRENT SELLER
==================================================*/

function getCurrentSeller() {

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login to view withdrawal history."
        );
    }

    return user;
}


/*==================================================
FEATURE: GET WITHDRAWAL HISTORY
==================================================*/

export async function getWithdrawalHistory() {

    const user =
        getCurrentSeller();


    const withdrawalsRef =
        ref(
            database,
            WITHDRAWALS_PATH
        );


    const withdrawalsQuery =
        query(
            withdrawalsRef,

            orderByChild(
                "sellerId"
            ),

            equalTo(
                user.uid
            )
        );


    const snapshot =
        await get(
            withdrawalsQuery
        );


    if (!snapshot.exists()) {
        return [];
    }


    const data =
        snapshot.val();


    const withdrawals =
        Object.entries(data)

            .map(
                ([key, withdrawal]) => ({

                    firebaseKey:
                        key,

                    ...withdrawal
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


    return withdrawals;
}


/*==================================================
FEATURE: CALCULATE WITHDRAWAL SUMMARY
==================================================*/

export function calculateWithdrawalSummary(
    withdrawals = []
) {

    let pending = 0;

    let processing = 0;

    let completed = 0;

    let failed = 0;

    let cancelled = 0;


    withdrawals.forEach(
        withdrawal => {

            const amount =
                Number(
                    withdrawal.amount || 0
                );


            switch (
                String(
                    withdrawal.status || ""
                ).toLowerCase()
            ) {

                case "pending":
                    pending += amount;
                    break;

                case "processing":
                    processing += amount;
                    break;

                case "completed":
                    completed += amount;
                    break;

                case "failed":
                    failed += amount;
                    break;

                case "cancelled":
                    cancelled += amount;
                    break;
            }
        }
    );


    return {

        pending:
            Number(
                pending.toFixed(2)
            ),

        processing:
            Number(
                processing.toFixed(2)
            ),

        completed:
            Number(
                completed.toFixed(2)
            ),

        failed:
            Number(
                failed.toFixed(2)
            ),

        cancelled:
            Number(
                cancelled.toFixed(2)
            ),

        totalRequests:
            withdrawals.length
    };
}


/*==================================================
FEATURE: WITHDRAWAL STATUS LABEL
==================================================*/

export function getWithdrawalStatusLabel(
    status
) {

    switch (
        String(status || "")
            .toLowerCase()
    ) {

        case "pending":
            return "Pending";

        case "processing":
            return "Processing";

        case "completed":
            return "Completed";

        case "failed":
            return "Failed";

        case "cancelled":
            return "Cancelled";

        default:
            return "Unknown";
    }
}


/*==================================================
FEATURE: FORMAT WITHDRAWAL AMOUNT
==================================================*/

export function formatWithdrawalAmount(
    amount
) {

    const value =
        Number(amount || 0);


    return `PKR ${value.toLocaleString(
        "en-PK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;
}
