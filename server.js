/*==================================================
SMARTBAZAAR PRO 2
FEATURE: SECURE BACKEND API SERVER
FEATURE: FIREBASE AUTHENTICATION
FEATURE: JAZZCASH PAYMENT
FEATURE: PAYMENT VERIFICATION
FEATURE: ORDER FINALIZATION
FEATURE: SELLER FINANCE
FEATURE: WITHDRAWAL SYSTEM
==================================================*/

import "dotenv/config";

import express from "express";
import cors from "cors";

import {
    requireAuthentication
} from "./server-auth.js";

import {
    createAuthorizedJazzCashPayment,
    verifyAndFinalizeJazzCashPayment
} from "./payment-flow-service.js";

import {
    createWithdrawalRequest
} from "./withdrawal-service.js";


/*==================================================
SERVER INITIALIZATION
==================================================*/

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;


/*==================================================
CORS CONFIGURATION
==================================================*/

const allowedOrigin =
    process.env.FRONTEND_URL || "*";

app.use(
    cors({
        origin: allowedOrigin,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


/*==================================================
BODY PARSERS
==================================================*/

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


/*==================================================
HEALTH CHECK
==================================================*/

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            service:
                "SmartBazaar Pro 2 Backend",

            status:
                "online",

            timestamp:
                new Date().toISOString()

        });
    }
);


/*==================================================
FEATURE: CREATE JAZZCASH PAYMENT
==================================================*/

app.post(
    "/api/payments/jazzcash/create",

    requireAuthentication,

    async (req, res) => {

        try {

            const {
                orderId
            } = req.body;


            if (!orderId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Order ID is required."

                });
            }


            const result =
                await createAuthorizedJazzCashPayment({

                    orderId,

                    user:
                        req.user

                });


            return res.json(result);

        } catch (error) {

            console.error(
                "JazzCash create error:",
                error
            );


            return res.status(
                error.statusCode || 500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Unable to create JazzCash payment."

            });
        }
    }
);


/*==================================================
FEATURE: VERIFY JAZZCASH PAYMENT
==================================================*/

app.post(
    "/api/payments/jazzcash/verify",

    requireAuthentication,

    async (req, res) => {

        try {

            const {
                orderId,
                response
            } = req.body;


            if (!orderId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Order ID is required."

                });
            }


            if (
                !response ||
                typeof response !== "object"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "JazzCash payment response is required."

                });
            }


            const result =
                await verifyAndFinalizeJazzCashPayment({

                    orderId,

                    user:
                        req.user,

                    response

                });


            return res.json(result);

        } catch (error) {

            console.error(
                "JazzCash verification error:",
                error
            );


            return res.status(
                error.statusCode || 500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Unable to verify payment."

            });
        }
    }
);


/*==================================================
FEATURE: SELLER WITHDRAWAL REQUEST
==================================================*/

app.post(
    "/api/seller/withdrawals",

    requireAuthentication,

    async (req, res) => {

        try {

            const {
                amount,
                jazzCashNumber
            } = req.body;


            if (
                amount === undefined ||
                amount === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Withdrawal amount is required."

                });
            }


            if (!jazzCashNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        "JazzCash number is required."

                });
            }


            const result =
                await createWithdrawalRequest({

                    sellerId:
                        req.user.uid,

                    sellerEmail:
                        req.user.email || "",

                    amount:
                        Number(amount),

                    jazzCashNumber

                });


            return res.json({

                success: true,

                withdrawal:
                    result

            });

        } catch (error) {

            console.error(
                "Withdrawal request error:",
                error
            );


            return res.status(
                error.statusCode || 400
            ).json({

                success: false,

                message:
                    error.message ||
                    "Unable to create withdrawal request."

            });
        }
    }
);


/*==================================================
404 HANDLER
==================================================*/

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });
    }
);


/*==================================================
GLOBAL ERROR HANDLER
==================================================*/

app.use(
    (error, req, res, next) => {

        console.error(
            "Backend server error:",
            error
        );


        res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                "Internal server error."

        });
    }
);


/*==================================================
START SERVER
==================================================*/

app.listen(
    PORT,
    () => {

        console.log(
            "=========================================="
        );

        console.log(
            "SMARTBAZAAR PRO 2 BACKEND"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Environment: ${
                process.env.JAZZCASH_ENVIRONMENT ||
                "sandbox"
            }`
        );

        console.log(
            "=========================================="
        );

    }
);
