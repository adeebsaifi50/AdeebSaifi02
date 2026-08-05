/* ==========================================
   DYNAMIC CONTACT FORM VALIDATION & INTERACTIVE LABELS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initContactForm();
});

function initContactForm() {
    const form = document.getElementById("premium-contact-form");
    if (!form) return;

    const fields = [
        { id: "contact-name", validation: (val) => val.trim().length >= 2, errorMsg: "Name must be at least 2 characters long." },
        { id: "contact-email", validation: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), errorMsg: "Please enter a valid email address." },
        { id: "contact-message", validation: (val) => val.trim().length >= 10, errorMsg: "Message must be at least 10 characters long." }
    ];

    // Real-time dynamic checks as user types
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;

        // Add blur / input listeners
        input.addEventListener("input", () => {
            validateField(input, field);
        });

        input.addEventListener("blur", () => {
            validateField(input, field);
        });
    });

    // Form Submission check
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let isAllValid = true;

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                const isValid = validateField(input, field);
                if (!isValid) isAllValid = false;
            }
        });

        if (isAllValid) {
            handleFormSuccess(form);
        }
    });
}

function validateField(input, field) {
    const value = input.value;
    const isValid = field.validation(value);
    const errorContainer = input.parentElement.querySelector(".form-error");

    if (isValid) {
        input.style.borderColor = "var(--color-secondary)";
        if (errorContainer) {
            errorContainer.style.display = "none";
        }
    } else {
        input.style.borderColor = "var(--color-danger)";
        if (errorContainer) {
            errorContainer.innerText = field.errorMsg;
            errorContainer.style.display = "block";
        }
    }

    return isValid;
}

function handleFormSuccess(form) {
    const successMsg = form.querySelector(".form-success-msg");
    const submitBtn = form.querySelector(".btn-submit");

    // Clear and disable form fields
    const inputs = form.querySelectorAll(".form-control");
    inputs.forEach(input => {
        input.value = "";
        input.disabled = true;
        input.style.borderColor = "var(--border-color)";
    });

    if (submitBtn) submitBtn.disabled = true;

    if (successMsg) {
        successMsg.style.display = "block";
        successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Optional timeout to re-enable
    setTimeout(() => {
        if (successMsg) successMsg.style.display = "none";
        inputs.forEach(input => input.disabled = false);
        if (submitBtn) submitBtn.disabled = false;
    }, 10000);
}
