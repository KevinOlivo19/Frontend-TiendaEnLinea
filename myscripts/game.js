/* STATE */
/* estado global del carrito */
let cart = [];

/* DATA */
/* datos del juego seleccionado */
const title = localStorage.getItem("selectedGame");
const games = JSON.parse(localStorage.getItem("gamesData")) || [];
const game = games.find(g => g.title === title);

/* DOM */
/* referencias a elementos del HTML */
const DOM = {
    cartCount: document.getElementById("cartCount"),

    cartPanel: document.getElementById("cartPanel"),
    cartOverlay: document.getElementById("cartOverlay"),
    cartItems: document.getElementById("cartItems"),
    cartTotal: document.getElementById("cartTotal"),
    closeCart: document.getElementById("closeCart"),
    openCart: document.querySelector(".navbar__cart"),
    clearCart: document.getElementById("clearCart"),

    title: document.getElementById("gameTitle"),
    image: document.getElementById("gameImage"),
    platform: document.getElementById("gamePlatform"),
    price: document.getElementById("gamePrice"),
    description: document.getElementById("gameDescription"),

    addBtn: document.getElementById("addToCartBtn"),
    buyBtn: document.getElementById("buyNowBtn")
};

/* STORAGE */
/* funciones para guardar y cargar carrito */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem("cart");
    if (saved) {
        cart = JSON.parse(saved);
    }
}

/* UI */
/* actualización visual del carrito */
function updateCartUI() {
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);
    DOM.cartCount.textContent = total;
}

function renderCart() {
    DOM.cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        DOM.cartItems.innerHTML += `
            <div class="cartPanel__item">
                <img src="${item.image}">
                <div class="cartPanel__info">
                    <p>${item.title}</p>
                    <p>$${item.price} MXN</p>
                    <div class="cartPanel__controls">
                        <button class="qtyBtn" data-action="minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qtyBtn" data-action="plus" data-index="${index}">+</button>
                    </div>
                    <p class="cartPanel__subtotal">$${subtotal} MXN</p>
                </div>
                <button class="cartPanel__remove" data-index="${index}">✕</button>
            </div>
        `;
    });

    DOM.cartTotal.textContent = `$${total} MXN`;
}

/* ANIMATION */
/* animación de imagen volando al carrito */
function flyToCart(imgElement) {
    const cart = document.querySelector('.navbar__cart');

    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const flyingImg = imgElement.cloneNode(true);
    flyingImg.classList.add('fly-image');

    flyingImg.style.top = imgRect.top + "px";
    flyingImg.style.left = imgRect.left + "px";
    flyingImg.style.width = imgRect.width + "px";
    flyingImg.style.height = imgRect.height + "px";

    document.body.appendChild(flyingImg);

    setTimeout(() => {
        flyingImg.style.top = cartRect.top + "px";
        flyingImg.style.left = cartRect.left + "px";
        flyingImg.style.width = "20px";
        flyingImg.style.height = "20px";
        flyingImg.style.opacity = "0.5";
    }, 10);

    setTimeout(() => {
        flyingImg.remove();
    }, 700);
}

/* INIT */
/* inicialización de la página */
function init() {
    loadCart();

    cart = cart.map(item => ({
        ...item,
        quantity: item.quantity || 1
    }));

    updateCartUI();

    if (!game) return;

    DOM.title.textContent = game.title;
    DOM.image.src = game.image;
    DOM.image.alt = game.title;
    DOM.platform.textContent = game.platform;
    DOM.price.textContent = `$${game.price} MXN`;

    DOM.description.textContent =
        `${game.title} es un juego increíble donde vivirás una experiencia llena de acción, exploración y desafíos. Disponible en ${game.platform}.`;
}
init();

/* CART EVENTS */
/* acciones relacionadas con el carrito */
DOM.addBtn.addEventListener("click", () => {

    if (DOM.image) {
        flyToCart(DOM.image);
    }

    const exists = cart.find(item => item.title === game.title);

    if (exists) exists.quantity++;
    else cart.push({ ...game, quantity: 1 });

    saveCart();
    updateCartUI();

    DOM.openCart.classList.remove("bump");
    void DOM.openCart.offsetWidth;
    DOM.openCart.classList.add("bump");

    setTimeout(() => {
        DOM.openCart.classList.remove("bump");
    }, 400);

    DOM.addBtn.textContent = "Agregado ✔";

    setTimeout(() => {
        DOM.addBtn.textContent = "Agregar al carrito";
    }, 1200);
});

/* BUY EVENT */
DOM.buyBtn.addEventListener("click", () => {
    const exists = cart.find(item => item.title === game.title);

    if (!exists) {
        cart.push({ ...game, quantity: 1 });
    }

    saveCart();

    const items = cart.map(item => ({
        name: item.title,
        price: item.price,
        quantity: item.quantity
    }));

    checkout(items);
});

/* CART CONTROLS */
/* botones de cantidad y eliminar */
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("qtyBtn")) {
        const index = e.target.dataset.index;
        const action = e.target.dataset.action;

        if (action === "plus") cart[index].quantity++;
        if (action === "minus") {
            cart[index].quantity--;
            if (cart[index].quantity <= 0) cart.splice(index, 1);
        }
        updateCartUI();
        saveCart();
        renderCart();
        return;
    }

    if (e.target.classList.contains("cartPanel__remove")) {
        const index = e.target.dataset.index;

        cart.splice(index, 1);

        updateCartUI();
        saveCart();
        renderCart();
        return;
    }
});

/* CLEAR CART */
/* vaciar carrito completo */
DOM.clearCart.addEventListener("click", () => {
    if (!cart.length) return;
    if (!confirm("¿Vaciar carrito?")) return;

    cart = [];

    updateCartUI();
    saveCart();
    renderCart();
});

/* CART PANEL */
/* abrir y cerrar panel del carrito */
DOM.openCart.addEventListener("click", () => {
    DOM.cartPanel.classList.add("active");
    renderCart();
});

DOM.closeCart.addEventListener("click", () => {
    DOM.cartPanel.classList.remove("active");
});

DOM.cartOverlay.addEventListener("click", () => {
    DOM.cartPanel.classList.remove("active");
});

/* NAVBAR SCROLL */
/* efecto visual al hacer scroll */
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});