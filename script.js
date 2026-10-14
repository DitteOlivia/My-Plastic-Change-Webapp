/* ========================================
   1. POINT OG STREAK
======================================== */

const progressKey = "plastic-change-progress";

function getProgress() {
    const defaultProgress = {
        points: 0,
        streak: 0,
        dayOneCompleted: false,
        dayOneQuizCompleted: false,
        dayOneQuizCorrectAnswers: 0
    };

    try {
        const savedProgress = localStorage.getItem(progressKey);

        return savedProgress
            ? { ...defaultProgress, ...JSON.parse(savedProgress) }
            : defaultProgress;
    } catch {
        return defaultProgress;
    }
}

function updateProgressBars() {
    const progress = getProgress();

    const pointsElement = document.querySelector("#user-points");
    const streakElement = document.querySelector("#user-streak");

    if (pointsElement) {
        pointsElement.textContent = progress.points;
    }

    if (streakElement) {
        streakElement.textContent = progress.streak;
    }
}

function completeDayOne() {
    const progress = getProgress();

    // Belønningen gives kun én gang.
    if (!progress.dayOneCompleted) {
        progress.points += 50;
        progress.streak += 1;
        progress.dayOneCompleted = true;

        localStorage.setItem(progressKey, JSON.stringify(progress));
    }

    updateProgressBars();
}

function completeDayOneQuiz(correctAnswers) {
    const progress = getProgress();

    // Quizresultatet og bonuspoint gemmes kun én gang.
    if (!progress.dayOneQuizCompleted) {
        progress.dayOneQuizCompleted = true;
        progress.dayOneQuizCorrectAnswers = correctAnswers;

        if (correctAnswers === 3) {
            progress.points += 25;
        }

        localStorage.setItem(progressKey, JSON.stringify(progress));
    }

    updateProgressBars();
}

updateProgressBars();

window.addEventListener("pageshow", updateProgressBars);


/* ========================================
   2. SCROLL PÅ FORSIDEN
======================================== */

const challengeButton = document.querySelector(
    "#hero-challenge-button"
);

const challengesSection = document.querySelector(".challenges");

if (challengeButton && challengesSection) {
    challengeButton.addEventListener("click", () => {
        challengesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}


/* ========================================
   3. BESKED VED DAG 2
======================================== */

(() => {
    const dayTwoButton = document.querySelector(
        '.challenge-day[data-day="2"]'
    );

    const dayTwoMessage = document.querySelector("#day-2-message");

    if (!dayTwoButton || !dayTwoMessage) return;

    function closeDayTwoMessage() {
        dayTwoMessage.hidden = true;
        dayTwoButton.setAttribute("aria-expanded", "false");
    }

    dayTwoButton.addEventListener("click", () => {
        const shouldOpen = dayTwoMessage.hidden;

        dayTwoMessage.hidden = !shouldOpen;
        dayTwoButton.setAttribute("aria-expanded", String(shouldOpen));
    });

    document.addEventListener("click", (event) => {
        if (
            !dayTwoButton.contains(event.target) &&
            !dayTwoMessage.contains(event.target)
        ) {
            closeDayTwoMessage();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDayTwoMessage();
        }
    });
})();


/* ========================================
   4. DAG 1: POPUP, KAMERA OG QUIZ
======================================== */

(() => {
    const dayOneButton = document.querySelector(
        '.challenge-day[data-day="1"]'
    );

    const modal = document.querySelector("#day-1-modal");

    if (!dayOneButton || !modal) return;

    const closeButton = modal.querySelector(".challenge-modal__close");
    const title = modal.querySelector("#day-1-title");
    const steps = modal.querySelector(".challenge-modal__steps");
    const dots = modal.querySelectorAll(".challenge-modal__dot");
    const panels = modal.querySelectorAll(".challenge-modal__panel");

    const readyButton = modal.querySelector("#day-1-ready");
    const cameraButton = modal.querySelector("#open-camera");
    const retakeButton = modal.querySelector("#retake-challenge-photo");
    const photoInput = modal.querySelector("#challenge-photo-input");
    const preview = modal.querySelector("#challenge-photo-preview");
    const errorMessage = modal.querySelector("#challenge-photo-error");

    const confirmPhotoButton = modal.querySelector(
        "#confirm-challenge-photo"
    );

    const startQuizButton = modal.querySelector("#start-challenge-quiz");
    const skipQuizButton = modal.querySelector("#skip-challenge-quiz");
    const resultNextButton = modal.querySelector("#quiz-result-next");

    let photoUrl = null;
    let quizCorrectAnswers = 0;
    let quizTransitionTimer = null;

    const answeredQuizSteps = new Set();

    const quizQuestions = [
        { step: 5, correctAnswer: "A", nextStep: 6 },
        { step: 6, correctAnswer: "B", nextStep: 7 },
        { step: 7, correctAnswer: "C", nextStep: null }
    ];


    /* VIS DET VALGTE TRIN */

    function showStep(step, moveFocus = true) {
        const titles = {
            1: "Dagens challenge",
            2: "Tag et billede",
            3: "Billede klar!",
            4: "Challenge gennemført!",
            5: "Quiz",
            6: "Quiz",
            7: "Quiz",
            8: "Godt gået!",
            9: "Challenge fuldført!"
        };

        modal.classList.toggle(
            "challenge-modal--completed",
            step === 4
        );

        modal.classList.toggle(
            "challenge-modal--quiz",
            step >= 5 && step <= 7
        );

        modal.classList.toggle(
            "challenge-modal--result",
            step === 8 || step === 9
        );

        title.textContent = titles[step];
        title.setAttribute("tabindex", "-1");

        panels.forEach((panel) => {
            panel.hidden = Number(panel.dataset.step) !== step;
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle(
                "challenge-modal__dot--active",
                index < step
            );
        });

        if (step <= 4) {
            steps.setAttribute("aria-label", `Trin ${step} af 4`);
        }

        errorMessage.hidden = true;
        modal.scrollTop = 0;

        if (moveFocus) {
            title.focus({ preventScroll: true });
        }
    }


    /* NULSTIL DET AKTUELLE QUIZFORLØB */

    function resetQuiz() {
        clearTimeout(quizTransitionTimer);
        quizTransitionTimer = null;

        quizCorrectAnswers = 0;
        answeredQuizSteps.clear();

        modal.querySelectorAll(".challenge-quiz__answer").forEach(
            (button) => {
                button.disabled = false;

                button.classList.remove(
                    "challenge-quiz__answer--correct",
                    "challenge-quiz__answer--wrong"
                );
            }
        );
    }


    /* VIS QUIZRESULTAT */

    function showQuizResult(correctAnswers, moveFocus = true) {
        if (correctAnswers === 3) {
            showStep(8, moveFocus);
        } else {
            // Erstattes senere med en selvstændig resultatpopup.
            showStep(7, moveFocus);

            modal.querySelectorAll(
                '[data-step="7"] .challenge-quiz__answer'
            ).forEach((button) => {
                button.disabled = true;
            });

            errorMessage.textContent =
                "Bedre held næste gang! Du fik " +
                correctAnswers +
                " ud af 3 rigtige. Du beholder dine 50 challengepoint " +
                "og 1 streak. Prøv igen i morgen.";

            errorMessage.hidden = false;
        }
    }


    /* REGISTRER SVAR OG VIS FARVE */

    quizQuestions.forEach((question) => {
        const answerButtons = modal.querySelectorAll(
            `[data-step="${question.step}"] .challenge-quiz__answer`
        );

        answerButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (answeredQuizSteps.has(question.step)) return;
                if (getProgress().dayOneQuizCompleted) return;

                answeredQuizSteps.add(question.step);

                const isCorrect =
                    button.dataset.answer === question.correctAnswer;

                if (isCorrect) {
                    quizCorrectAnswers += 1;
                }

                button.classList.add(
                    isCorrect
                        ? "challenge-quiz__answer--correct"
                        : "challenge-quiz__answer--wrong"
                );

                answerButtons.forEach((answer) => {
                    answer.disabled = true;
                });

                if (question.nextStep === null) {
                    completeDayOneQuiz(quizCorrectAnswers);
                }

                quizTransitionTimer = setTimeout(() => {
                    quizTransitionTimer = null;

                    if (!modal.open) return;

                    if (question.nextStep !== null) {
                        showStep(question.nextStep);
                    } else {
                        showQuizResult(quizCorrectAnswers);
                    }
                }, 1500);
            });
        });
    });


    /* RYD DET VALGTE BILLEDE */

    function clearPhoto() {
        if (photoUrl) {
            URL.revokeObjectURL(photoUrl);
            photoUrl = null;
        }

        preview.removeAttribute("src");
        preview.hidden = true;
        photoInput.value = "";
    }


    /* ÅBN KAMERA ELLER BILLEDVÆLGER */

    function openCamera() {
        errorMessage.hidden = true;
        photoInput.value = "";
        photoInput.click();
    }


    /* ÅBN DAG 1 FRA DET GEMTE FREMSKRIDT */

    dayOneButton.addEventListener("click", () => {
        if (modal.open) return;

        const lockedMessage = document.querySelector("#day-2-message");

        const dayTwoButton = document.querySelector(
            '.challenge-day[data-day="2"]'
        );

        if (lockedMessage) {
            lockedMessage.hidden = true;
        }

        if (dayTwoButton) {
            dayTwoButton.setAttribute("aria-expanded", "false");
        }

        clearPhoto();
        resetQuiz();
        updateProgressBars();

        const progress = getProgress();

        if (progress.dayOneQuizCompleted) {
            showQuizResult(progress.dayOneQuizCorrectAnswers, false);
        } else if (progress.dayOneCompleted) {
            // Billedet er allerede godkendt: vis quiztilbuddet.
            showStep(4, false);
        } else {
            // Ingen gennemført challenge: start fra begyndelsen.
            showStep(1, false);
        }

        modal.showModal();

        document.documentElement.classList.add(
            "challenge-modal-open"
        );
    });


    /* JEG ER KLAR */

    readyButton.addEventListener("click", () => {
        showStep(2);
    });


    /* ÅBEN KAMERA / TAG ET NYT BILLEDE */

    cameraButton.addEventListener("click", openCamera);
    retakeButton.addEventListener("click", openCamera);


    /* VIS DET VALGTE BILLEDE */

    photoInput.addEventListener("change", () => {
        const photo = photoInput.files[0];

        if (!photo) return;

        if (photo.type && !photo.type.startsWith("image/")) {
            errorMessage.textContent = "Vælg venligst et billede.";
            errorMessage.hidden = false;
            return;
        }

        if (photoUrl) {
            URL.revokeObjectURL(photoUrl);
        }

        photoUrl = URL.createObjectURL(photo);
        preview.src = photoUrl;
        preview.hidden = false;

        showStep(3);
    });


    /* GODKEND BILLEDET OG GEM CHALLENGEN */

    confirmPhotoButton.addEventListener("click", () => {
        if (!photoUrl) return;

        completeDayOne();
        showStep(4);
    });


    /* TAG QUIZZEN */

    if (startQuizButton) {
        startQuizButton.addEventListener("click", () => {
            const progress = getProgress();

            if (!progress.dayOneCompleted) return;

            if (progress.dayOneQuizCompleted) {
                showQuizResult(progress.dayOneQuizCorrectAnswers);
                return;
            }

            resetQuiz();
            showStep(5);
        });
    }


    /* NEJ TAK TIL QUIZZEN */

    if (skipQuizButton) {
        skipQuizButton.addEventListener("click", () => {
            // Challengepointene er allerede gemt.
            modal.close();
        });
    }


    /* VIDERE TIL DEN SAMLEDE BELØNNING */

    if (resultNextButton) {
        resultNextButton.addEventListener("click", () => {
            const progress = getProgress();

            if (
                progress.dayOneQuizCompleted &&
                progress.dayOneQuizCorrectAnswers === 3
            ) {
                showStep(9);
            }
        });
    }


    /* LUK VIA KRYDSET */

    closeButton.addEventListener("click", () => {
        modal.close();
    });


    /* OPRYDNING VED LUKNING */

    modal.addEventListener("close", () => {
        clearTimeout(quizTransitionTimer);
        quizTransitionTimer = null;

        document.documentElement.classList.remove(
            "challenge-modal-open"
        );

        clearPhoto();
        dayOneButton.focus({ preventScroll: true });
    });
})();