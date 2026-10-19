/* ========================================
   INTRODUKTION TIL CHALLENGES
======================================== */

(() => {
    const intro = document.querySelector("#challenge-intro");

    if (!intro) return;

    const title = intro.querySelector("#challenge-intro-title");
    const progressIndicator = intro.querySelector(
        "#challenge-intro-progress"
    );

    const panels = intro.querySelectorAll(
        ".challenge-intro__panel"
    );

    const dots = intro.querySelectorAll(
        ".challenge-intro__dot"
    );

    const nextButton = intro.querySelector(
        "#challenge-intro-next"
    );

    const backButton = intro.querySelector(
        "#challenge-intro-back"
    );

    const finishButton = intro.querySelector(
        "#challenge-intro-finish"
    );

    const dayOneButton = document.querySelector(
        '.challenge-day[data-day="1"]'
    );

    function showIntroStep(step, moveFocus = true) {
        title.textContent = step === 1
            ? "My Plastic Challenge"
            : "3x Point!";

        panels.forEach((panel) => {
            panel.hidden = Number(panel.dataset.introStep) !== step;
        });

        // Prikkerne viser, hvor langt brugeren er kommet.
        dots.forEach((dot, index) => {
            dot.classList.toggle(
                "challenge-intro__dot--active",
                index < step
            );
        });

        progressIndicator.setAttribute(
            "aria-label",
            `Trin ${step} af 2`
        );

        intro.scrollTop = 0;

        if (moveFocus) {
            title.focus({ preventScroll: true });
        }
    }

    function openIntroIfNeeded() {
        const progress = getProgress();

        if (progress.challengeIntroSeen || intro.open) return;

        showIntroStep(1, false);

        intro.showModal();

        document.documentElement.classList.add(
            "challenge-intro-open"
        );

        title.focus({ preventScroll: true });
    }

    nextButton.addEventListener("click", () => {
        showIntroStep(2);
    });

    backButton.addEventListener("click", () => {
        showIntroStep(1);
    });

    finishButton.addEventListener("click", () => {
        const progress = getProgress();

        // Gemmes i samme objekt som point og streak.
        // Profilens nulstilling sletter derfor også denne værdi.
        progress.challengeIntroSeen = true;

        try {
            localStorage.setItem(
                progressKey,
                JSON.stringify(progress)
            );
        } catch {
            // Introduktionen kan stadig lukkes, hvis browseren
            // ikke tillader lagring. Den kan da blive vist igen.
        }

        intro.close();
    });

    // Introduktionen afsluttes via "Start challenge".
    intro.addEventListener("cancel", (event) => {
        event.preventDefault();
    });

    intro.addEventListener("close", () => {
        document.documentElement.classList.remove(
            "challenge-intro-open"
        );

        if (dayOneButton) {
            dayOneButton.focus({ preventScroll: true });
        }
    });

    // Kører også, hvis siden gendannes via browserens tilbageknap.
    window.addEventListener("pageshow", openIntroIfNeeded);

    openIntroIfNeeded();
})();