
/* ==================================
   DIGITAL RECEIPT FUNCTIONALITY
================================== */

const CART_KEY = "studentSuppliesCart";
const RECEIPT_KEY = "studentSuppliesReceipt";
const PAYMENT_KEY = "studentSuppliesPaymentAmount";

const receiptContainer = document.getElementById("receipt-container");
const noReceipt = document.getElementById("no-receipt");
const receiptActions = document.querySelector(".receipt-actions");

const receiptReference = document.getElementById("receipt-reference");
const receiptDate = document.getElementById("receipt-date");
const receiptItems = document.getElementById("receipt-items");

const receiptTotal = document.getElementById("receipt-total");
const receiptPaid = document.getElementById("receipt-paid");
const receiptChange = document.getElementById("receipt-change");
const receiptMessage = document.getElementById("receipt-message");

const printButton = document.getElementById("print-receipt");
const newTransactionButton = document.getElementById("new-transaction");

// Format amounts as Philippine pesos
function formatMoney(amount) {
    return "₱" + amount.toFixed(2);
}

// Read the saved receipt
function getReceipt() {
    try {
        const savedReceipt = sessionStorage.getItem(RECEIPT_KEY);

        if (!savedReceipt) {
            return null;
        }

        const receipt = JSON.parse(savedReceipt);

        if (
            !receipt ||
            typeof receipt.reference !== "string" ||
            typeof receipt.dateTime !== "string" ||
            !Array.isArray(receipt.items) ||
            !Number.isFinite(receipt.total) ||
            !Number.isFinite(receipt.amountPaid) ||
            !Number.isFinite(receipt.change)
        ) {
            return null;
        }

        return receipt;
    } catch (error) {
        return null;
    }
}

// Display the receipt information
function displayReceipt() {
    if (!receiptContainer || !noReceipt || !receiptActions) {
        return;
    }
    const receipt = getReceipt();

    // If no successful payment exists, show a message
    if (!receipt) {
        receiptContainer.hidden = true;
        noReceipt.hidden = false;
        receiptActions.hidden = true;
        return;
    }

    receiptContainer.hidden = false;
    noReceipt.hidden = true;
    receiptActions.hidden = false;

    receiptReference.textContent = receipt.reference;
    receiptDate.textContent = receipt.dateTime;

    // Display each purchased product
    receiptItems.innerHTML = receipt.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatMoney(item.price)}</td>
            <td>${formatMoney(item.price * item.quantity)}</td>
        </tr>
    `).join("");

    receiptTotal.textContent = formatMoney(receipt.total);
    receiptPaid.textContent = formatMoney(receipt.amountPaid);
    receiptChange.textContent = formatMoney(receipt.change);

    receiptMessage.textContent = receipt.message;
}

// Print the digital receipt
if (printButton) printButton.addEventListener("click", function () {
    if (getReceipt()) {
        window.print();
    }
});

// Start a new transaction
if (newTransactionButton) newTransactionButton.addEventListener("click", function () {
    // Clear the old order and receipt information
    try {
        sessionStorage.removeItem(CART_KEY);
        sessionStorage.removeItem(RECEIPT_KEY);
        sessionStorage.removeItem(PAYMENT_KEY);
    } catch (error) {
        // Continue to the shopping page if browser storage is unavailable.
    }

    // Return to the Products page
    window.location.href = "products.html";
});

// Display the receipt when the page opens
displayReceipt();
