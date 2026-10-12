
/* ==================================
   SHOPPING CART FUNCTIONALITY
================================== */

// 1. Get the HTML elements
const cartItemsContainer = document.getElementById("cart-items");
const emptyCartMessage = document.getElementById("empty-cart");
const cartItemCount = document.getElementById("cart-item-count");

const summaryQuantity = document.getElementById("summary-quantity");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");

const checkoutButton = document.getElementById("checkout-button");
const cartStatus = document.getElementById("cart-status");

const CART_KEY = "studentSuppliesCart";

// 2. Format numbers as Philippine pesos
function formatMoney(amount) {
    return "₱" + amount.toFixed(2);
}

// 3. Read the saved cart
function getCart() {
    try {
        const savedCart = sessionStorage.getItem(CART_KEY);
        const cart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(cart)) {
            return [];
        }

        // Keep only valid cart items
        return cart.filter(item =>
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

// 4. Save cart changes
function saveCart(cart) {
    try {
        sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        if (cartStatus) {
            cartStatus.textContent = "Unable to save cart changes in this browser.";
        }
    }
}

// 5. Display all cart items
function displayCart() {
    const cart = getCart();

    // Show the empty message if there are no items
    emptyCartMessage.hidden = cart.length !== 0;

    // Hide the cart item area when empty
    cartItemsContainer.hidden = cart.length === 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "";
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            const subtotal = item.price * item.quantity;

            return `
                <article class="cart-item">

                    <div class="cart-item-left">
                        <h3 class="cart-item-name">
                            ${item.name}
                        </h3>

                        <p class="cart-item-price">
                            ${formatMoney(item.price)} each
                        </p>
                    </div>

                    <div class="cart-item-right">

                        <p class="cart-item-subtotal">
                            ${formatMoney(subtotal)}
                        </p>

                        <div class="cart-item-controls">

                            <div class="quantity-controls">
                                <button
                                    type="button"
                                    class="quantity-button"
                                    data-action="decrease"
                                    data-id="${item.id}"
                                    aria-label="Decrease ${item.name} quantity">
                                    −
                                </button>

                                <span class="quantity-value">
                                    ${item.quantity}
                                </span>

                                <button
                                    type="button"
                                    class="quantity-button"
                                    data-action="increase"
                                    data-id="${item.id}"
                                    aria-label="Increase ${item.name} quantity">
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                class="remove-button"
                                data-action="remove"
                                data-id="${item.id}">
                                Remove
                            </button>

                        </div>

                    </div>

                </article>
            `;
        }).join("");
    }

    // Update the item count label
    const totalQuantity = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    cartItemCount.textContent =
        `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;

    // Calculate the subtotal
    const subtotal = cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Update the order summary
    summaryQuantity.textContent = totalQuantity;
    summarySubtotal.textContent = formatMoney(subtotal);
    summaryTotal.textContent = formatMoney(subtotal);

    // Checkout stays disabled until payment is implemented
    checkoutButton.disabled = cart.length === 0;
}

// 6. Change a product's quantity
function changeQuantity(productId, change) {
    const cart = getCart();

    const item = cart.find(product => product.id === productId);

    if (!item) {
        return;
    }

    item.quantity += change;

    // If quantity reaches zero, remove the item
    const updatedCart = cart.filter(product => product.quantity > 0);

    saveCart(updatedCart);
    displayCart();

    if (item.quantity <= 0) {
        cartStatus.textContent = "Item removed from your cart.";
    } else {
        cartStatus.textContent =
            `${item.name} quantity updated to ${item.quantity}.`;
    }
}

// 7. Remove an item completely
function removeItem(productId) {
    const cart = getCart();

    const itemToRemove = cart.find(item => item.id === productId);

    if (!itemToRemove) {
        return;
    }

    const updatedCart = cart.filter(item => item.id !== productId);

    saveCart(updatedCart);
    displayCart();

    cartStatus.textContent =
        `${itemToRemove.name} removed from your cart.`;
}

// 8. Handle clicks on quantity and remove buttons
if (cartItemsContainer) cartItemsContainer.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "increase") {
        changeQuantity(productId, 1);
    } else if (action === "decrease") {
        changeQuantity(productId, -1);
    } else if (action === "remove") {
        removeItem(productId);
    }
});

// 9. Display the cart when the page loads
displayCart();

/* Proceed to the Payment page */
if (checkoutButton) checkoutButton.addEventListener("click", function () {
    const cart = getCart();

    if (cart.length === 0) {
        return;
    }

    window.location.href = "payment.html";
});
