/*==================================================
SMARTBAZAAR PRO 2
FEATURE: COMMON PAGE TRANSITION SYSTEM
==================================================*/

(function () {

    "use strict";


    /*==================================================
    FEATURE: CONFIGURATION
    ==================================================*/

    const TRANSITION_TIME = 340;


    /*==================================================
    FEATURE: TARGET PAGE OVERLAY
    ==================================================*/

    function createTransitionLayer() {

        if (
            document.getElementById(
                "smartBazaarPageTransition"
            )
        ) {

            return document.getElementById(
                "smartBazaarPageTransition"
            );

        }


        const layer =
            document.createElement("div");

        layer.id =
            "smartBazaarPageTransition";


        document.body.appendChild(layer);


        return layer;

    }


    /*==================================================
    FEATURE: GET CURRENT PAGE
    ==================================================*/

    function getCurrentPage() {

        let page =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (!page) {

            page = "index.html";

        }


        return page;

    }


    /*==================================================
    FEATURE: NORMALIZE URL
    ==================================================*/

    function normalizeURL(url) {

        try {

            const target =
                new URL(
                    url,
                    window.location.href
                );


            return target;

        } catch (error) {

            return null;

        }

    }


    /*==================================================
    FEATURE: CHECK INTERNAL PAGE
    صرف اپنے Website کے Pages
    ==================================================*/

    function isInternalPage(url) {

        const target =
            normalizeURL(url);

        if (!target) {

            return false;

        }


        return (
            target.origin ===
            window.location.origin
        );

    }


    /*==================================================
    FEATURE: SHOULD USE TRANSITION
    ==================================================*/

    function shouldTransition(url) {

        const target =
            normalizeURL(url);

        if (!target) {

            return false;

        }


        if (!isInternalPage(url)) {

            return false;

        }


        /*
         Anchor links:
         #products وغیرہ کے لیے Page Transition نہیں۔
        */

        if (
            target.pathname ===
                window.location.pathname &&
            target.search ===
                window.location.search &&
            target.hash
        ) {

            return false;

        }


        /*
         Same exact page پر دوبارہ Transition نہیں۔
        */

        if (
            target.href ===
            window.location.href
        ) {

            return false;

        }


        return true;

    }


    /*==================================================
    FEATURE: NAVIGATION
    ==================================================*/

    function navigateToPage(
        url,
        direction = "forward"
    ) {

        if (!shouldTransition(url)) {

            window.location.href = url;

            return;

        }


        const layer =
            createTransitionLayer();


        /*
         پہلے direction صاف کریں
        */

        layer.classList.remove(
            "sb-transition-forward",
            "sb-transition-backward",
            "sb-transition-active"
        );


        /*
         Browser کو classes update کرنے کا موقع
        */

        void layer.offsetWidth;


        layer.classList.add(
            "sb-transition-active"
        );


        if (
            direction === "backward"
        ) {

            layer.classList.add(
                "sb-transition-backward"
            );

        } else {

            layer.classList.add(
                "sb-transition-forward"
            );

        }


        /*
         Animation مکمل ہونے کے بعد
         Target Page load ہوگا۔
        */

        window.setTimeout(
            function () {

                window.location.href = url;

            },
            TRANSITION_TIME
        );

    }


    /*==================================================
    FEATURE: INTERCEPT INTERNAL LINKS
    ==================================================*/

    function handleLinkClick(event) {

        /*
         صرف Left Click
        */

        if (
            event.button !== 0
        ) {

            return;

        }


        /*
         Ctrl / Cmd / Shift / Alt
         Browser کا default behavior رہے۔
        */

        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {

            return;

        }


        const link =
            event.target.closest("a");


        if (!link) {

            return;

        }


        /*
         Download links کو نہ روکیں۔
        */

        if (
            link.hasAttribute("download")
        ) {

            return;

        }


        /*
         Target="_blank" وغیرہ
        */

        if (
            link.target &&
            link.target !== "_self"
        ) {

            return;

        }


        const href =
            link.getAttribute("href");


        if (
            !href ||
            href === "#" ||
            href.startsWith("javascript:")
        ) {

            return;

        }


        /*
         Anchor:
         #products
        #categories
        وغیرہ
        */

        if (
            href.startsWith("#")
        ) {

            return;

        }


        if (
            !shouldTransition(href)
        ) {

            return;

        }


        event.preventDefault();


        navigateToPage(
            href,
            "forward"
        );

    }


    /*==================================================
    FEATURE: BROWSER BACK / FORWARD
    ==================================================*/

    function handlePopState() {

        /*
         Browser Back پر Page already history
         کے مطابق load ہوگا۔

         ہم یہاں artificial multi-page
         carousel نہیں بناتے۔
        */

        const layer =
            createTransitionLayer();


        layer.classList.remove(
            "sb-transition-forward",
            "sb-transition-backward",
            "sb-transition-active"
        );


        void layer.offsetWidth;


        layer.classList.add(
            "sb-transition-active",
            "sb-transition-backward"
        );


        window.setTimeout(
            function () {

                layer.classList.remove(
                    "sb-transition-active",
                    "sb-transition-backward"
                );

            },
            TRANSITION_TIME
        );

    }


    /*==================================================
    FEATURE: INITIALIZATION
    ==================================================*/

    function initializePageTransition() {

        createTransitionLayer();


        /*
         تمام Internal Links ایک ہی جگہ handle ہوں گے۔
        */

        document.addEventListener(
            "click",
            handleLinkClick,
            true
        );


        window.addEventListener(
            "popstate",
            handlePopState
        );

    }


    /*==================================================
    FEATURE: START
    ==================================================*/

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePageTransition
        );

    } else {

        initializePageTransition();

    }


})();
