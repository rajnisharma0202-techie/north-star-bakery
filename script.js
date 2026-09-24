/* North Star Bakery - Touchstone 4 JavaScript */

const productCatalog = [
    { id: "sourdough", name: "Country Sourdough", category: "Bread" },
    { id: "rosemary", name: "Rosemary Sea Salt Bread", category: "Bread" },
    { id: "croissant", name: "Butter Croissant", category: "Pastry" },
    { id: "danish", name: "Seasonal Fruit Danish", category: "Pastry" }
];

let savedFavorites = [];

const storageKey = "northStarBakeryFavorites";

function loadFavorites() {
    const storedFavorites = localStorage.getItem(storageKey);
    if (!storedFavorites) {
        savedFavorites = [];
        return false;
    }

    try {
        const parsedFavorites = JSON.parse(storedFavorites);
        savedFavorites = Array.isArray(parsedFavorites) ? parsedFavorites : [];
        return savedFavorites.length > 0;
    } catch (error) {
        savedFavorites = [];
        return false;
    }
}

function saveFavorites() {
    localStorage.setItem(storageKey, JSON.stringify(savedFavorites));
}

function getProduct(productId) {
    return productCatalog.find((product) => product.id === productId);
}

function updateFavoriteButtons() {
    document.querySelectorAll("[data-favorite-id]").forEach((button) => {
        const productId = button.dataset.favoriteId;
        const isFavorite = savedFavorites.includes(productId);
        button.textContent = isFavorite ? "Remove favorite" : "Save favorite";
        button.setAttribute("aria-pressed", String(isFavorite));
    });
}

function renderFavorites(message) {
    const list = document.querySelector("#favorites-list");
    const count = document.querySelector("#favorites-count");
    const status = document.querySelector("#favorite-status");

    if (!list || !count || !status) return;

    list.innerHTML = "";

    if (savedFavorites.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No favorites saved yet.";
        list.appendChild(emptyItem);
    } else {
        savedFavorites.forEach((productId) => {
            const product = getProduct(productId);
            if (!product) return;
            const item = document.createElement("li");
            item.textContent = `${product.name} (${product.category})`;
            list.appendChild(item);
        });
    }

    count.textContent = String(savedFavorites.length);
    status.textContent = message || "";
    updateFavoriteButtons();
}

function toggleFavorite(productId) {
    const product = getProduct(productId);
    if (!product) return;

    if (savedFavorites.includes(productId)) {
        savedFavorites = savedFavorites.filter((id) => id !== productId);
        saveFavorites();
        renderFavorites(`${product.name} was removed from your favorites.`);
    } else {
        savedFavorites.push(productId);
        saveFavorites();
        renderFavorites(`${product.name} was saved as a favorite.`);
    }
}

function setupFavorites() {
    const favoritesSection = document.querySelector("#favorite-products");
    if (!favoritesSection) return;

    const restored = loadFavorites();

    document.querySelectorAll("[data-favorite-id]").forEach((button) => {
        button.addEventListener("click", () => toggleFavorite(button.dataset.favoriteId));
    });

    if (restored) {
        renderFavorites(`Your ${savedFavorites.length} saved favorite${savedFavorites.length === 1 ? " was" : "s were"} restored from this browser.`);
    } else {
        renderFavorites("");
    }
}

const validationMessages = {
    nameRequired: "Please enter your name.",
    nameShort: "Name must be at least 2 characters.",
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email address.",
    dateRequired: "Please choose a pickup date.",
    datePast: "Pickup date cannot be in the past.",
    detailsRequired: "Please describe the item you want.",
    detailsShort: "Please give at least 10 characters of item details."
};

function showFieldError(field, message) {
    const errorElement = document.querySelector(`#${field.id}-error`);
    if (errorElement) errorElement.textContent = message;
    field.classList.add("input-error");
    field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field) {
    const errorElement = document.querySelector(`#${field.id}-error`);
    if (errorElement) errorElement.textContent = "";
    field.classList.remove("input-error");
    field.removeAttribute("aria-invalid");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(form) {
    const nameField = form.querySelector("#customer-name");
    const emailField = form.querySelector("#email");
    const dateField = form.querySelector("#pickup-date");
    const detailsField = form.querySelector("#item-details");
    const fields = [nameField, emailField, dateField, detailsField];

    fields.forEach(clearFieldError);
    let isValid = true;

    if (!nameField.value.trim()) {
        showFieldError(nameField, validationMessages.nameRequired);
        isValid = false;
    } else if (nameField.value.trim().length < 2) {
        showFieldError(nameField, validationMessages.nameShort);
        isValid = false;
    }

    if (!emailField.value.trim()) {
        showFieldError(emailField, validationMessages.emailRequired);
        isValid = false;
    } else if (!isValidEmail(emailField.value.trim())) {
        showFieldError(emailField, validationMessages.emailInvalid);
        isValid = false;
    }

    if (!dateField.value) {
        showFieldError(dateField, validationMessages.dateRequired);
        isValid = false;
    } else {
        const selectedDate = new Date(`${dateField.value}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            showFieldError(dateField, validationMessages.datePast);
            isValid = false;
        }
    }

    if (!detailsField.value.trim()) {
        showFieldError(detailsField, validationMessages.detailsRequired);
        isValid = false;
    } else if (detailsField.value.trim().length < 10) {
        showFieldError(detailsField, validationMessages.detailsShort);
        isValid = false;
    }

    return isValid;
}

function setupFormValidation() {
    const form = document.querySelector("#preorder-form");
    if (!form) return;

    const formStatus = document.querySelector("#form-status");
    const fields = form.querySelectorAll("input, select, textarea");

    fields.forEach((field) => {
        field.addEventListener("input", () => clearFieldError(field));
        field.addEventListener("change", () => clearFieldError(field));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        formStatus.textContent = "";

        if (!validateForm(form)) {
            formStatus.textContent = "Please correct the highlighted fields before submitting.";
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        formStatus.textContent = "Your request passed validation and is ready for the bakery to review.";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupFavorites();
    setupFormValidation();
});
