
/* ==================================
   PRODUCTS PAGE FUNCTIONALITY
================================== */

// 1. Store the product information
const products = [
    {
        id: 1,
        name: "Ballpen",
        price: 12,
        emoji: "🖊️",
        description: "For notes and everyday writing."
    },
    {
        id: 2,
        name: "Pencil",
        price: 10,
        emoji: "✏️",
        description: "Perfect for writing and drawing."
    },
    {
        id: 3,
        name: "Notebook",
        price: 35,
        emoji: "📓",
        description: "Keep your lessons organized."
    },
    {
        id: 4,
        name: "Yellow Pad",
        price: 45,
        emoji: "📒",
        description: "Useful for activities and exercises."
    },
    {
        id: 5,
        name: "Eraser",
        price: 8,
        emoji: "🧽",
        description: "Correct pencil mistakes easily."
    },
    {
        id: 6,
        name: "Ruler",
        price: 15,
        emoji: "📏",
        description: "Measure and draw straight lines."
    }
];

// 2. Get the HTML elements we need
const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const cartMessage = document.getElementById("cart-message");
let cartMessageTimeout;

// 3. Load the existing cart from sessionStorage
function getCart() {
    try {
        const savedCart = sessionStorage.getItem("studentSuppliesCart");
        const cart = savedCart ? JSON.parse(savedCart) : [];

        return Array.isArray(cart) ? cart.filter(item =>
            item && Number.isInteger(item.id) &&
            typeof item.name === "string" &&
            Number.isFinite(item.price) && item.price >= 0 &&
            Number.isInteger(item.quantity) && item.quantity > 0
        ) : [];
    } catch (error) {
        return [];
    }
}

// 4. Save the cart and update its item count
function updateCart(cart = getCart()) {
    try {
        sessionStorage.setItem("studentSuppliesCart", JSON.stringify(cart));
    } catch (error) {
        // Keep the page usable when browser storage is unavailable.
    }

    // Count total quantities, not just different products
    const totalQuantity = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }
}

// 5. Display all six products
function displayProducts() {
    productList.innerHTML = products.map(product => `
        <article class="product-card">

            <div class="product-visual">
                <span class="product-emoji" aria-hidden="true">
                    ${product.emoji}
                </span>
            </div>

            <h3 class="product-name">${product.name}</h3>

            <p class="product-description">
                ${product.description}
            </p>

            <div class="product-bottom">
                <span class="product-price">
                    ₱${product.price.toFixed(2)}
                </span>

                <button
                    type="button"
                    class="add-button"
                    data-product-id="${product.id}">
                    + Add to Cart
                </button>
            </div>

        </article>
    `).join("");
}

// 6. Add a product to the cart
function addToCart(productId) {
    const product = products.find(
        item => item.id === productId
    );

    if (!product) {
        return;
    }

    const cart = getCart();

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    updateCart(cart);

    // Show notification at the top
    const cartMessage = document.getElementById("cart-message");

    if (cartMessage) {
        cartMessage.textContent =
            `✓ ${product.name} added to your cart successfully!`;

        cartMessage.hidden = false;
        window.clearTimeout(cartMessageTimeout);
        cartMessageTimeout = window.setTimeout(() => {
            cartMessage.hidden = true;
            cartMessage.textContent = "";
        }, 3000);

        // Scroll to the notification
        cartMessage.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// Render products and connect the Add to Cart buttons.
if (productList) {
    displayProducts();
    productList.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-product-id]");
        if (button) {
            addToCart(Number(button.dataset.productId));
        }
    });
}

updateCart();
