/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: EXPRESS SERVER
FEATURE: JAZZCASH PAYMENT API
FEATURE: JAZZCASH VERIFICATION API
==================================================*/

import express from "express";

import cors from "cors";

import {
    createJazzCashPayment
} from "./jazzcash-create-payment.js";

import {
    verifyJazzCashPayment
} from "./jazzcash-verify-payment.js";


/*==================================================
FEATURE: EXPRESS APP
==================================================*/

const app =
    express();


/*==================================================
FEATURE: SERVER CONFIG
==================================================*/

const PORT =
    process.env.PORT || 3000;


/*==================================================
FEATURE: MIDDLEWARE
==================================================*/

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "*"
    })
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended:
            true
    })
);


/*==================================================
FEATURE: HEALTH CHECK
==================================================*/

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success:
                true,

            service:
                "SmartBazaar Pro 2 Backend",

            status:
                "online"

        });

    }
);


/*==================================================
FEATURE: CREATE JAZZCASH PAYMENT
==================================================*/

app.post(
    "/api/payments/jazzcash/create",
    async (
        req,
        res
    ) => {

        try {

            const result =
                await createJazzCashPayment(
                    req.body
                );


            res.json(
                result
            );

        }

        catch (error) {

            console.error(
                "JazzCash create error:",
                error
            );


            res.status(
                400
            )
            .json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to create JazzCash payment."

            });

        }

    }
);


/*==================================================
FEATURE: JAZZCASH RETURN / VERIFY
==================================================*/

app.post(
    "/api/payments/jazzcash/verify",
    async (
        req,
        res
    ) => {

        try {

            const result =
                await verifyJazzCashPayment(
                    req.body
                );


            /*
             * IMPORTANT:
             *
             * At this stage we return the verified
             * payment result.
             *
             * Firebase order/payment/wallet updates
             * must be performed by a secure server-side
             * transaction layer.
             */


            res.json(
                result
            );

        }

        catch (error) {

            console.error(
                "JazzCash verification error:",
                error
            );


            res.status(
                400
            )
            .json({

                success:
                    false,

                verified:
                    false,

                paymentStatus:
                    "failed",

                message:
                    error.message ||
                    "Unable to verify JazzCash payment."

            });

        }

    }
);


/*==================================================
FEATURE: 404
==================================================*/

app.use(
    (
        req,
        res
    ) => {

        res.status(
            404
        )
        .json({

            success:
                false,

            message:
                "API endpoint not found."

        });

    }
);


/*==================================================
FEATURE: ERROR HANDLER
==================================================*/

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
            error
        );


        res.status(
            500
        )
        .json({

            success:
                false,

            message:
                "Internal server error."

        });

    }
);


/*==================================================
FEATURE: START SERVER
==================================================*/

app.listen(
    PORT,
    () => {

        console.log(
            `SmartBazaar Pro 2 backend running on port ${PORT}`
        );

    }
);
