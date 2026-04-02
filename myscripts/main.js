// estado global de la app
let cart = [];
let currentGames = [];
let showingAll = false;

// guardar carrito en localStorage
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// cargar carrito desde localStorage
function loadCart() {
    const saved = localStorage.getItem("cart");
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// base de datos de juegos
const games = [
    { title: "Hollow Knight Delux edition", platform: "pc", price: 27, image: "assets/images/Jolounai.jpg" },
    { title: "Elden Ring", platform: "pc", price: 1200, image: "assets/images/Elden.jpg" },
    { title: "Left 4 Dead", platform: "pc", price: 500, image: "assets/images/Leforded.jpg" },
    { title: "Fall Out", platform: "pc", price: 800, image: "assets/images/Falau.jpg" },
    { title: "Residen Evil 4", platform: "pc", price: 1300, image: "assets/images/Residen.jpg" },

    { title: "Black Ops 3", platform: "xbox", price: 1800, image: "assets/images/Bo3.jpg" },
    { title: "Gears of War", platform: "xbox", price: 900, image: "assets/images/gears.jpg" },
    { title: "GTA 5", platform: "xbox", price: 1200, image: "assets/images/GiTiEi.jpg" },
    { title: "Halo Infinite", platform: "xbox", price: 1300, image: "assets/images/Halo.jpg" },
    { title: "Red Dead Reedemption 2", platform: "xbox", price: 1100, image: "assets/images/Red.jpg" },

    { title: "God of War", platform: "playstation", price: 1500, image: "assets/images/GOW.jpg" },
    { title: "Spider-Man", platform: "playstation", price: 1250, image: "assets/images/espoderman.jpg" },
    { title: "The Last of Us", platform: "playstation", price: 1850, image: "assets/images/Telasofas.jpg" },
    { title: "Astro Bot", platform: "playstation", price: 600, image: "assets/images/astro.jpeg" },
    { title: "Detroit Become Human", platform: "playstation", price: 1500, image: "assets/images/Ditroi.jpg" },

    { title: "The Legend Zelda Breath of the Wild", platform: "nintendo", price: 3900, image: "assets/images/Deleyenofzelda.jpg" },
    { title: "Mario Kart 8", platform: "nintendo", price: 2800, image: "assets/images/mariocarros.jpg" },
    { title: "Mario Odyssey", platform: "nintendo", price: 4700, image: "assets/images/MarioOdysi.jpg" },
    { title: "Smash Bros Ultimate", platform: "nintendo", price: 8750, image: "assets/images/mariomadrazos.jpg" },
    { title: "Pokemon Violeta", platform: "nintendo", price: 150, image: "assets/images/pokemon.jpg" }
];

// referencias al DOM
const DOM = {
    grid: document.getElementById("productsGrid"),
    loadMoreBtn: document.getElementById("loadMoreBtn"),
    cartCount: document.getElementById("cartCount"),

    cartPanel: document.getElementById("cartPanel"),
    cartOverlay: document.getElementById("cartOverlay"),
    cartItems: document.getElementById("cartItems"),
    cartTotal: document.getElementById("cartTotal"),

    closeCart: document.getElementById("closeCart"),
    openCart: document.querySelector(".navbar__cart"),
    clearCart: document.getElementById("clearCart"),

    modal: document.getElementById("purchaseModal"),
    closeModal: document.getElementById("closeModal"),
    checkoutBtn: document.querySelector(".cartPanel__checkout"),

    searchInput: document.querySelector(".navbar__search")
};

// ordenar juegos alfabéticamente
function sortGames(list) {
    return list.sort((a, b) => a.title.localeCompare(b.title));
}

// buscador de juegos
function searchGames(query) {
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
        return sortGames([...games]);
    }

    return sortGames(
        games.filter(game =>
            game.title.toLowerCase().includes(normalized) ||
            game.platform.toLowerCase().includes(normalized)
        )
    );
}

// resaltar coincidencias del buscador
function highlight(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

// navegar a página del juego
function goToGame(title) {
    localStorage.setItem("selectedGame", title);
    localStorage.setItem("gamesData", JSON.stringify(games));

    window.location.href = "game.html";
}

// crear tarjeta de juego
function createCard(game) {
    const query = DOM.searchInput.value || "";

    return `
    <article class="card" data-title="${game.title}">
      <div class="card__image">
        <img src="${game.image}" alt="${game.title}">
        <span class="card__platform">${game.platform}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${highlight(game.title, query)}</h3>
        <p class="card__region">GLOBAL</p>
        <p class="card__price">$${game.price} MXN</p>
        <button class="card__button" data-title="${game.title}">
          Agregar al carrito
        </button>
      </div>
    </article>
  `;
}

// mostrar skeleton de carga
function showSkeletons(count = 5) {
    DOM.grid.innerHTML = "";

    for (let i = 0; i < count; i++) {
        DOM.grid.innerHTML += `<div class="card skeleton"></div>`;
    }
}

// renderizar juegos
function renderGames(list) {
    const fragment = document.createDocumentFragment();

    list.forEach((game, index) => {
        const temp = document.createElement("div");
        temp.innerHTML = createCard(game);

        const card = temp.firstElementChild;

        card.style.animationDelay = `${index * 0.05}s`;

        fragment.appendChild(card);
    });
    DOM.grid.innerHTML = "";
    DOM.grid.appendChild(fragment);
}

// actualizar contador del carrito
function updateCartUI() {
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);

    DOM.cartCount.textContent = total > 9 ? "9+" : total;

    if (total > 0) {
        DOM.openCart.classList.add("has-items");
    } else {
        DOM.openCart.classList.remove("has-items");
    }
}

// renderizar carrito
function renderCart() {
    DOM.cartItems.innerHTML = "";

    if (cart.length === 0) {
        DOM.cartItems.innerHTML =
            `<p class="cart__empty">No hay productos en el carrito</p>`;

        DOM.cartTotal.textContent = "$0 MXN";
        return;
    }

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

// inicializar aplicación
function init() {
    loadCart();

    cart = cart.map(item => ({
        ...item,
        quantity: item.quantity || 1
    }));

    updateCartUI();

    const sorted = sortGames([...games]);

    currentGames = sorted;

    showSkeletons();

    setTimeout(() => {
        renderGames(sorted.slice(0, 5));
    }, 400);
}
init();

// botón ver más
DOM.loadMoreBtn.addEventListener("click", () => {
    showSkeletons();

    setTimeout(() => {
        if (!showingAll) {
            renderGames(currentGames);
            DOM.loadMoreBtn.textContent = "Mostrar menos";
        } else {
            renderGames(currentGames.slice(0, 5));
            DOM.loadMoreBtn.textContent = "Ver más";
        }
        showingAll = !showingAll;
    }, 300);
});

// filtro por plataforma
document.querySelectorAll(".platforms__item").forEach(btn => {
    btn.addEventListener("click", () => {
        const platform = btn.dataset.platform;

        document
            .querySelectorAll(".platforms__item")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        currentGames =
            platform === "all"
                ? sortGames([...games])
                : sortGames(games.filter(g => g.platform === platform));

        showSkeletons();

        setTimeout(() => {
            renderGames(currentGames.slice(0, 5));
        }, 300);

        showingAll = false;
        DOM.loadMoreBtn.textContent = "Ver más";
    });
});

// eventos globales
document.addEventListener("click", (e) => {
    // agregar al carrito
    if (e.target.classList.contains("card__button")) {
        const card = e.target.closest(".card");
        const img = card.querySelector("img");

        if (img) flyToCart(img);

        e.stopPropagation();

        const title = e.target.dataset.title;
        const game = games.find(g => g.title === title);

        const exists = cart.find(item => item.title === title);

        if (exists) exists.quantity++;
        else cart.push({ ...game, quantity: 1 });

        updateCartUI();
        saveCart();

        e.target.disabled = true;

        e.target.textContent = "Agregado ✔";

        setTimeout(() => {
            e.target.disabled = false;
            e.target.textContent = "Agregar al carrito";
        }, 1200);

        return;
    }

    // click en tarjeta
    const card = e.target.closest(".card");

    if (card && !e.target.classList.contains("card__button")) {
        const title = card.dataset.title;
        goToGame(title);

        return;
    }

    // botones cantidad
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

    // eliminar item
    if (e.target.classList.contains("cartPanel__remove")) {
        const index = e.target.dataset.index;

        cart.splice(index, 1);

        updateCartUI();
        saveCart();
        renderCart();
    }
});

// vaciar carrito
DOM.clearCart.addEventListener("click", () => {
    if (!cart.length) return;

    if (!confirm("¿Vaciar carrito?")) return;

    cart = [];

    updateCartUI();
    saveCart();
    renderCart();
});

// abrir carrito
DOM.openCart.addEventListener("click", () => {
    DOM.cartPanel.classList.add("active");
    renderCart();
});

// cerrar carrito
DOM.closeCart.addEventListener("click", () => {
    DOM.cartPanel.classList.remove("active");

});

DOM.cartOverlay.addEventListener("click", () => {
    DOM.cartPanel.classList.remove("active");
});

// compra
DOM.checkoutBtn.addEventListener("click", () => {
    if (!cart.length) return;

    const items = cart.map(item => ({
        name: item.title,
        price: item.price,
        quantity: item.quantity
    }));

    checkout(items);
});

// cerrar modal
DOM.closeModal.addEventListener("click", () => {
    DOM.modal.classList.remove("active");
});

// animación imagen al carrito
function flyToCart(imgElement) {
    const cartIcon = document.querySelector(".navbar__cart");

    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyingImg = imgElement.cloneNode(true);

    flyingImg.classList.add("fly-image");

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

// efecto scroll navbar
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// buscador
DOM.searchInput.addEventListener("input", (e) => {
    const value = e.target.value;

    currentGames = searchGames(value);

    showSkeletons();

    setTimeout(() => {
        renderGames(currentGames.slice(0, 5));
    }, 200);
    showingAll = false;
    DOM.loadMoreBtn.textContent = "Ver más";
});

// vista previa del carrito
function updateCartPreview() {

    const preview = document.getElementById("cartPreview");

    if (!preview) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    preview.innerHTML = "";

    if (cart.length === 0) {
        preview.innerHTML = "<p>Carrito vacío</p>";
        return;
    }

    cart.slice(0, 4).forEach(game => {

        const item = document.createElement("div");
        item.className = "cart-preview__item";

        item.innerHTML = `
            <img src="${game.image}" alt="">
            <span class="cart-preview__title">${game.title}</span>
        `;

        preview.appendChild(item);

    });

}

const preview = document.getElementById("cartPreview");
const previewItems = document.getElementById("cartPreviewItems");
const previewTotal = document.getElementById("cartPreviewTotal");

function renderCartPreview() {
    if (!previewItems || !previewTotal) return;

    previewItems.innerHTML = "";

    if (!cart.length) {
        previewItems.innerHTML = "<p class='cart__empty'>Carrito vacío</p>";
        previewTotal.textContent = "$0 MXN";
        return;
    }

    let total = 0;

    cart.slice(0, 3).forEach(item => {
        total += item.price * item.quantity;

        previewItems.innerHTML += `
            <div class="preview-item">
                <img src="${item.image}">
                <div>
                    <p>${item.title}</p>
                    <small>x${item.quantity}</small>
                </div>
            </div>
        `;
    });

    previewTotal.textContent = `$${total} MXN`;
}

/* mostrar preview */
if (DOM.openCart && preview) {
    DOM.openCart.addEventListener("mouseenter", () => {
        renderCartPreview();
        preview.classList.add("active");
    });

    DOM.openCart.addEventListener("mouseleave", () => {
        preview.classList.remove("active");
    });
}

const heroBuyBtn = document.getElementById("heroBuyBtn");

if (heroBuyBtn) {
    heroBuyBtn.addEventListener("click", () => {
        console.log("CLICK DETECTADO");

        if (!cart.length) {
            alert("Tu carrito está vacío");
            return;
        }

        const items = cart.map(item => ({
            name: item.title,
            price: item.price,
            quantity: item.quantity
        }));

        checkout(items);
    });
}