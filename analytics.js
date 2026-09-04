/* ==================================================
SMARTBAZAAR PRO 2
FEATURE: ANALYTICS SYSTEM
FILE: analytics.js
PURPOSE: ANALYTICS PREVIEW LOADING SYSTEM
================================================== */

"use strict";


/* ==================================================
ANALYTICS PREVIEW INITIALIZATION
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const loadingScreen =
        document.getElementById("analyticsLoading");

    const refreshButton =
        document.getElementById("analyticsRefreshBtn");


    /* ==============================================
       HIDE LOADING SCREEN
       After 2.5 Seconds
    ============================================== */

    if (loadingScreen) {

        setTimeout(() => {

            loadingScreen.classList.add("hidden");

        }, 2500);

    }


    /* ==============================================
       REFRESH BUTTON
    ============================================== */

    if (refreshButton) {

        refreshButton.addEventListener("click", () => {

            if (!loadingScreen) return;

            loadingScreen.classList.remove("hidden");

            setTimeout(() => {

                loadingScreen.classList.add("hidden");

            }, 2500);

        });

    }


    /* ==============================================
       PERIOD BUTTONS
       Preview Only
    ============================================== */

    const periodButtons =
        document.querySelectorAll(".period-btn");

    const selectedPeriodText =
        document.getElementById("selectedPeriodText");


    periodButtons.forEach(button => {

        button.addEventListener("click", () => {

            periodButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            if (selectedPeriodText) {

                selectedPeriodText.textContent =
                    button.textContent.trim();

            }

        });

    });


    /* ==============================================
       CHART PERIOD BUTTONS
       Preview Only
    ============================================== */

    const chartButtons =
        document.querySelectorAll(".chart-period-btn");


    chartButtons.forEach(button => {

        button.addEventListener("click", () => {

            chartButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

        });

    });

});
