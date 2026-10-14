/* ========================================
   PROFIL: NULSTIL POINT, STREAK OG QUIZ
======================================== */

(() => {
    const openButton = document.querySelector("#open-reset-dialog");
    const dialog = document.querySelector("#profile-reset-dialog");

    if (!openButton || !dialog) return;

    const confirmButton = document.querySelector("#confirm-reset");
    const cancelButton = document.querySelector("#cancel-reset");
    const notice = document.querySelector("#profile-reset-notice");
    const errorMessage = document.querySelector("#reset-error");

    openButton.addEventListener("click", () => {
        errorMessage.hidden = true;
        notice.hidden = true;

        dialog.showModal();

        document.documentElement.classList.add(
            "challenge-modal-open"
        );
    });

    cancelButton.addEventListener("click", () => {
        dialog.close();
    });

    confirmButton.addEventListener("click", () => {
        try {
            // Fjern kun appens gemte fremskridt.
            // Dette nulstiller også dag 1 og quizresultatet.
            localStorage.removeItem(progressKey);

            updateProgressBars();
            dialog.close();

            notice.textContent =
                "Dine point og streak er nulstillet. " +
                "Du kan starte fra dag 1 igen.";

            notice.hidden = false;
        } catch {
            errorMessage.textContent =
                "Nulstillingen kunne ikke gemmes. Prøv igen.";

            errorMessage.hidden = false;
        }
    });

    dialog.addEventListener("close", () => {
        document.documentElement.classList.remove(
            "challenge-modal-open"
        );

        openButton.focus({ preventScroll: true });
    });

    // Opdatér tallene, hvis profilen åbnes via browserens tilbageknap.
    window.addEventListener("pageshow", () => {
        updateProgressBars();
    });
})();