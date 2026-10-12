
/* ==================================
   CASH PAYMENT FUNCTIONALITY
================================== */

const CART_KEY = "studentSuppliesCart";
const RECEIPT_KEY = "studentSuppliesReceipt";
const PAYMENT_KEY = "studentSuppliesPaymentAmount";

const paymentForm = document.getElementById("payment-form");
const amountPaidInput = document.getElementById("amount-paid");
const paymentTotal = document.getElementById("payment-total");
const paymentError = document.getElementById("payment-error");
const confirmButton = document.getElementById("confirm-payment");

let cart = [];

function getStoredValue(key) {
    try {
        return sessionStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function setStoredValue(key, value) {
    try {
        sessionStorage.setItem(key, value);
    } catch (error) {
        // Ignore storage errors so the page can still work.
    }
}

// Format an amount in Philippine pesos
function formatMoney(amount) {
    if (!Number.isFinite(amount)) {
        return "₱0.00";
    }

    return "₱" + amount.toFixed(2);
}

// Convert pesos to integer centavos
function toCents(amount) {
    return Math.round(amount * 100);
}

// Load and validate the saved cart
function loadCart() {
    try {
        const savedCart = getStoredValue(CART_KEY);
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart.filter(item =>
            item &&
            Number.isInteger(item.id) &&
            typeof item.name === "string" &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );
    } catch (error) {
        return [];
    }
}

// Calculate the total in centavos
function calculateTotalCents() {
    return cart.reduce((total, item) => {
        return total + toCents(item.price) * item.quantity;
    }, 0);
}

// Display the amount due
function displayTotal() {
    if (!paymentTotal || !confirmButton || !paymentError || !amountPaidInput) {
        return;
    }

    const totalCents = calculateTotalCents();
    const cartIsEmpty = cart.length === 0;

    paymentTotal.textContent = formatMoney(totalCents / 100);
    confirmButton.disabled = cartIsEmpty;
    amountPaidInput.disabled = cartIsEmpty;

    if (cartIsEmpty) {
        paymentError.textContent =
            "Your cart is empty. Please add products first.";
    } else {
        paymentError.textContent = "";
    }
}

if (amountPaidInput) {
    // Save the current input so it can be cleared for a new transaction
    amountPaidInput.addEventListener("input", function () {
        setStoredValue(PAYMENT_KEY, amountPaidInput.value);
        paymentError.textContent = "";
    });
}

if (paymentForm && amountPaidInput && paymentError) {
    // Handle payment confirmation
    paymentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        paymentError.textContent = "";

        // Check the cart again before accepting payment
        cart = loadCart();

        if (cart.length === 0) {
            paymentError.textContent =
                "Your cart is empty. Please add products first.";
            displayTotal();
            return;
        }

        // 1. Check if the entered value is a valid number
        if (amountPaidInput.validity.badInput) {
            paymentError.textContent =
                "Please enter a valid numeric payment amount.";
            return;
        }

        // 2. Check if the field is empty
        const enteredValue = String(amountPaidInput.value).trim();

        if (enteredValue === "") {
            paymentError.textContent =
                "Payment amount is required.";
            return;
        }

        const amountPaid = Number(enteredValue);

        // 3. Check for invalid numbers
        if (!Number.isFinite(amountPaid)) {
            paymentError.textContent =
                "Please enter a valid numeric payment amount.";
            return;
        }

        // 4. Check for negative payment
        if (amountPaid < 0) {
            paymentError.textContent =
                "Payment amount cannot be negative.";
            return;
        }

        const amountPaidCents = toCents(amountPaid);
        const totalCents = calculateTotalCents();

        // 5. Check if payment is sufficient
        if (amountPaidCents < totalCents) {
            paymentError.textContent =
                "Insufficient payment. Please enter an amount equal to or greater than " +
                formatMoney(totalCents / 100) + ".";
            return;
        }

        // 6. Calculate change
        const changeCents = amountPaidCents - totalCents;

        // Generate a transaction reference number
        const now = new Date();

        const transactionReference =
            "SS-" +
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            "-" +
            now.getTime().toString().slice(-6);

        // Save the receipt information
        const receipt = {
            reference: transactionReference,
            dateTime: now.toLocaleString("en-PH"),
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            total: totalCents / 100,
            amountPaid: amountPaidCents / 100,
            change: changeCents / 100,
            message: "Payment confirmed successfully!"
        };

        setStoredValue(RECEIPT_KEY, JSON.stringify(receipt));
        setStoredValue(PAYMENT_KEY, enteredValue);

        // Go to the Digital Receipt page
        window.location.href = "receipt.html";
    });
}

// Initialize the page
cart = loadCart();
displayTotal();
