/* ========================================
   PRODUKT: STØRRELSE OG POINT
======================================== */

(() => {
    const addButton = document.querySelector("#add-product-to-cart");
    const dialog = document.querySelector("#missing-points-dialog");

    if (!addButton || !dialog) return;

    const dialogText = document.querySelector("#missing-points-text");
    const closeButton = document.querySelector("#close-points-dialog");
    const cancelButton = document.querySelector("#cancel-points-dialog");
    const message = document.querySelector("#product-message");

    const productPrice = 1000;

    addButton.addEventListener("click", () => {
        message.hidden = true;

        const progress = getProgress();
        const missingPoints = Math.max(
            0,
            productPrice - progress.points
        );

        if (missingPoints > 0) {
            dialogText.textContent =
                `Du har ${progress.points} point og mangler ` +
                `${missingPoints} point for at købe dette produkt.`;

            dialog.showModal();

            document.documentElement.classList.add(
                "challenge-modal-open"
            );

            return;
        }

        const selectedSize = document.querySelector(
            'input[name="product-size"]:checked'
        );

        if (!selectedSize) {
            message.textContent = "Vælg en størrelse først.";
            message.hidden = false;
            return;
        }

        message.textContent =
            "Du har nok point og har valgt størrelse " +
            selectedSize.value +
            ". Kurvens funktion er endnu ikke klar.";

        message.hidden = false;
    });

    closeButton.addEventListener("click", () => {
        dialog.close();
    });

    cancelButton.addEventListener("click", () => {
        dialog.close();
    });

    dialog.addEventListener("close", () => {
        document.documentElement.classList.remove(
            "challenge-modal-open"
        );

        addButton.focus({ preventScroll: true });
    });
})();


/* ========================================
   PRODUKTBILLEDER: SWIPE OG PRIKKER
======================================== */

(() => {
    const gallery = document.querySelector("#product-gallery");

    const dots = document.querySelectorAll(
        ".product-page__dot[data-image-index]"
    );

    if (!gallery || dots.length === 0) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let scrollFrame = null;

    function updateDots() {
        const width = gallery.clientWidth;

        if (!width) return;

        const index = Math.max(
            0,
            Math.min(
                dots.length - 1,
                Math.round(gallery.scrollLeft / width)
            )
        );

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === index;

            dot.classList.toggle(
                "product-page__dot--active",
                isActive
            );

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    function showImage(index) {
        gallery.scrollTo({
            left: index * gallery.clientWidth,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showImage(Number(dot.dataset.imageIndex));
        });
    });

    gallery.addEventListener("scroll", () => {
        if (scrollFrame !== null) return;

        scrollFrame = requestAnimationFrame(() => {
            updateDots();
            scrollFrame = null;
        });
    }, { passive: true });

    gallery.addEventListener("keydown", (event) => {
        if (
            event.key !== "ArrowRight" &&
            event.key !== "ArrowLeft"
        ) {
            return;
        }

        event.preventDefault();

        const currentIndex = Math.round(
            gallery.scrollLeft / gallery.clientWidth
        );

        const direction = event.key === "ArrowRight" ? 1 : -1;

        const nextIndex = Math.max(
            0,
            Math.min(dots.length - 1, currentIndex + direction)
        );

        showImage(nextIndex);
    });

    window.addEventListener("resize", () => {
        const activeDot = document.querySelector(
            ".product-page__dot--active[data-image-index]"
        );

        const index = activeDot
            ? Number(activeDot.dataset.imageIndex)
            : 0;

        gallery.scrollTo({
            left: index * gallery.clientWidth,
            behavior: "auto"
        });

        updateDots();
    });

    updateDots();
})();