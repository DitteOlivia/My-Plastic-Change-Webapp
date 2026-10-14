/* ========================================
   SØG I KATEGORIER, NYHEDER OG PRODUKTER
======================================== */

(() => {
    const form = document.querySelector("#search-form");
    const input = document.querySelector("#search-input");
    const emptyMessage = document.querySelector("#search-empty");
    const status = document.querySelector("#search-status");

    if (!form || !input || !emptyMessage || !status) return;

    const items = document.querySelectorAll("[data-search-item]");
    const sections = document.querySelectorAll("[data-search-section]");
    const categories = document.querySelector(".search-categories");

    function normalizeText(text) {
        return text
            .toLocaleLowerCase("da-DK")
            .trim()
            .replace(/\s+/g, " ");
    }

    function filterContent() {
        const query = normalizeText(input.value);
        let visibleCount = 0;

        items.forEach((item) => {
            const content = normalizeText(item.textContent);
            const matches = content.includes(query);

            item.hidden = !matches;

            if (matches) {
                visibleCount += 1;
            }
        });

        sections.forEach((section) => {
            const visibleItems = section.querySelectorAll(
                "[data-search-item]:not([hidden])"
            );

            section.hidden = visibleItems.length === 0;
        });

        const visibleCategories = categories.querySelectorAll(
            "[data-search-item]:not([hidden])"
        );

        categories.hidden = visibleCategories.length === 0;
        emptyMessage.hidden = visibleCount > 0;

        status.textContent = query
            ? `${visibleCount} resultater for ${input.value.trim()}.`
            : "";

        document.querySelectorAll(".search-carousel").forEach(
            (carousel) => {
                carousel.scrollLeft = 0;
            }
        );
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        filterContent();
        input.blur();
    });

    input.addEventListener("input", filterContent);

    filterContent();
})();