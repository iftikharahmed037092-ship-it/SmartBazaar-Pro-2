/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FONT AWESOME ICON LOADING SYSTEM
==================================================*/

(function () {

    "use strict";


    /*==================================================
    FEATURE: ROOT
    ==================================================*/

    const root =
        document.documentElement;


    /*==================================================
    FEATURE: INITIAL STATE
    ==================================================*/

    root.classList.add(
        "sb-icon-loading"
    );


    /*==================================================
    FEATURE: FONT AWESOME CHECK
    ==================================================*/

    function checkFontAwesome() {

        /*
         Font Awesome کی معروف font family
         browser میں available ہے یا نہیں۔
        */

        if (
            document.fonts &&
            document.fonts.check
        ) {

            const solidReady =
                document.fonts.check(
                    '16px "Font Awesome 6 Free"'
                );

            const brandsReady =
                document.fonts.check(
                    '16px "Font Awesome 6 Brands"'
                );


            if (
                solidReady ||
                brandsReady
            ) {

                markIconsReady();

                return true;

            }

        }


        return false;

    }


    /*==================================================
    FEATURE: MARK ICONS READY
    ==================================================*/

    function markIconsReady() {

        root.classList.remove(
            "sb-icon-loading",
            "sb-icons-failed"
        );


        root.classList.add(
            "sb-icons-ready"
        );

    }


    /*==================================================
    FEATURE: FALLBACK
    ==================================================*/

    function markIconsFailed() {

        root.classList.remove(
            "sb-icon-loading"
        );


        root.classList.add(
            "sb-icons-failed"
        );

    }


    /*==================================================
    FEATURE: WAIT FOR FONTS
    ==================================================*/

    if (
        document.fonts &&
        document.fonts.ready
    ) {

        document.fonts.ready.then(
            function () {

                if (
                    !checkFontAwesome()
                ) {

                    /*
                     بعض browser میں
                     document.fonts.check()
                     فوراً صحیح result نہیں دیتا۔
                    */

                    setTimeout(
                        function () {

                            if (
                                !checkFontAwesome()
                            ) {

                                markIconsReady();

                            }

                        },
                        100
                    );

                }

            }
        );

    } else {

        /*
         Old browser fallback
        */

        setTimeout(
            markIconsReady,
            500
        );

    }


    /*==================================================
    FEATURE: MAXIMUM WAIT
    Website کو کبھی indefinitely hide نہیں کرنا۔
    ==================================================*/

    setTimeout(
        function () {

            if (
                root.classList.contains(
                    "sb-icon-loading"
                )
            ) {

                markIconsFailed();

            }

        },
        1500
    );


})();
