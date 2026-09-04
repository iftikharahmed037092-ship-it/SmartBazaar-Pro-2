/*==================================================
SMARTBAZAAR PRO 2
BACKEND
FEATURE: JAZZCASH CONFIGURATION
FEATURE: SECURE CREDENTIAL MANAGEMENT
==================================================*/

/*
 * IMPORTANT:
 *
 * NEVER put these values in frontend files.
 *
 * Use environment variables.
 */

const JAZZCASH_CONFIG = {

    merchantId:
        process.env.JAZZCASH_MERCHANT_ID || "",

    password:
        process.env.JAZZCASH_PASSWORD || "",

    integritySalt:
        process.env.JAZZCASH_INTEGRITY_SALT || "",

    /*
     * Keep sandbox enabled until your merchant
     * account and production credentials are ready.
     */

    environment:
        process.env.JAZZCASH_ENVIRONMENT || "sandbox",

    sandboxUrl:
        process.env.JAZZCASH_SANDBOX_URL ||
        "https://sandbox.jazzcash.com.pk/",

    productionUrl:
        process.env.JAZZCASH_PRODUCTION_URL ||
        "https://payments.jazzcash.com.pk/",

    currency:
        "PKR",

    version:
        process.env.JAZZCASH_VERSION || "2.0",

    language:
        "EN",

    transactionExpiryMinutes:
        30

};


/*==================================================
FEATURE: GET ACTIVE JAZZCASH URL
==================================================*/

function getJazzCashBaseUrl() {

    if (
        JAZZCASH_CONFIG.environment ===
        "production"
    ) {

        return JAZZCASH_CONFIG.productionUrl;

    }

    return JAZZCASH_CONFIG.sandboxUrl;

}


/*==================================================
FEATURE: VALIDATE CONFIGURATION
==================================================*/

function validateJazzCashConfig() {

    const required = [

        [
            "JAZZCASH_MERCHANT_ID",
            JAZZCASH_CONFIG.merchantId
        ],

        [
            "JAZZCASH_PASSWORD",
            JAZZCASH_CONFIG.password
        ],

        [
            "JAZZCASH_INTEGRITY_SALT",
            JAZZCASH_CONFIG.integritySalt
        ]

    ];


    const missing =
        required
            .filter(
                item =>
                    !item[1]
            )
            .map(
                item =>
                    item[0]
            );


    return {

        valid:
            missing.length === 0,

        missing:
            missing

    };

}


export {

    JAZZCASH_CONFIG,

    getJazzCashBaseUrl,

    validateJazzCashConfig

};
