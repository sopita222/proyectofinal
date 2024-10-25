
// Clase Producto
class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

// Clase Carrito
class Cart {
    constructor() {
        const storedCart = localStorage.getItem('cart');
        this.items = storedCart ? JSON.parse(storedCart) : [];
    }

    addProduct(product, quantity = 1) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ product, quantity });
        }
        this.updateStorage();
        this.renderCart();
        Toastify({
            text: `${product.name} añadido al carrito`,
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "#4CAF50",
            }
        }).showToast();
    }

    viewCart() {
        const cartContainer = document.getElementById('cart-container');
        cartContainer.innerHTML = '';

        if (this.items.length === 0) {
            cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
        } else {
            let cartSummary = '';
            this.items.forEach(item => {
                cartSummary += `<p>${item.quantity}x ${item.product.name} - $${item.product.price * item.quantity}</p>`;
            });
            cartSummary += `<p>Total: $${this.getTotal()}</p>`;
            cartContainer.innerHTML = cartSummary;
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }

    clearCart() {
        this.items = [];
        this.updateStorage();
        this.renderCart();
        Toastify({
            text: "Carrito vaciado",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "#FF0000",
            }
        }).showToast();
    }

    updateStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    renderCart() {
        this.viewCart();
    }
}

// Clase Tienda
class Store {
    constructor() {
        this.products = [];
    }

    // Cargar productos desde un archivo JSON
    async loadProducts() {
        try {
            const response = await fetch('productos.json');
            const data = await response.json();
            this.products = data.map(product => new Product(product.id, product.name, product.price));
            renderProducts();
        } catch (error) {
            console.error('Error al cargar los productos:', error);
        }
    }

    getProducts() {
        return this.products;
    }
}

// Inicializa la tienda y el carrito
const store = new Store();
const cart = new Cart();

function renderProducts() {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = ''; 
    store.getProducts().forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('col-md-3', 'mb-4');
        productDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">$${product.price}</p>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">Añadir al carrito</button>
                </div>
            </div>
        `;
        productContainer.appendChild(productDiv);
    });

    // Agregar eventos a los botones "Añadir al carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.getAttribute('data-id'));
            const product = store.getProducts().find(p => p.id === productId);
            cart.addProduct(product);
        });
    });
}


store.loadProducts();

document.getElementById('view-cart').addEventListener('click', () => {
    cart.renderCart();
});

document.getElementById('clear-cart').addEventListener('click', () => {
    cart.clearCart();
});
    