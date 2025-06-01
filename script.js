
document.addEventListener('DOMContentLoaded', () => {
    startAutoplay();
    updateCarousel();
    cargarDesdeFirebase();
});

// === CONEXIÓN FIREBASE ===
let products = {};

async function cargarDesdeFirebase() {
    const snapshot = await db.collection("productos").get();
    products = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        if (!products[data.categoria]) products[data.categoria] = {};
        products[data.categoria][data.nombre] = data.precio;
    });

    renderProductosAdmin?.();
    cargarProductos();
}

// === SISTEMA DE BÚSQUEDA ===
function performSearch() {
    const query = document.querySelector('.search-box').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    const results = [];
    for (const category in products) {
        for (const product in products[category]) {
            if (product.toLowerCase().includes(query)) {
                results.push({
                    product: product,
                    price: products[category][product],
                    category: category
                });
            }
        }
    }

    if (results.length > 0) {
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.innerHTML = `
                <div class="product-name">${result.product}</div>
                <div class="product-category">${result.category}</div>
                <div class="product-price">$${result.price}</div>
            `;

            div.addEventListener('click', () => {
                mostrarProductoEnLista(result);
                resultsContainer.style.display = 'none';
            });

            resultsContainer.appendChild(div);
        });
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.innerHTML = '<div class="no-results">No se encontraron productos</div>';
        resultsContainer.style.display = 'block';
    }
}

document.querySelector('.search-box').addEventListener('input', performSearch);

function mostrarProductoEnLista(producto) {
    const detallesCategorias = document.querySelectorAll('details');
    detallesCategorias.forEach(detalle => {
        const tituloCategoria = detalle.querySelector('summary').textContent.trim();
        if (tituloCategoria === producto.category) {
            detalle.open = true;
        }
    });

    const productId = slugify(producto.product);
    const productoElemento = document.getElementById(productId);
    if (productoElemento) {
        setTimeout(() => {
            productoElemento.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });

            productoElemento.closest('tr').style.background = '#fffaed';
            setTimeout(() => {
                productoElemento.closest('tr').style.background = '';
            }, 2000);
        }, 100);
    }
}

// === CARRUSEL ===
const carouselContent = document.querySelector('.carousel-content');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');
let autoPlayInterval;
let currentIndex = 0;

function updateCarousel() {
    const itemWidth = document.querySelector('.carousel-item').offsetWidth;
    carouselContent.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
}

function nextSlide() {
    const totalItems = document.querySelectorAll('.carousel-item').length;
    currentIndex = (currentIndex + 1) % totalItems;
    updateCarousel();
}

function prevSlide() {
    const totalItems = document.querySelectorAll('.carousel-item').length;
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
}

function startAutoplay() {
    autoPlayInterval = setInterval(nextSlide, 3000);
}

function resetAutoplay() {
    clearInterval(autoPlayInterval);
    startAutoplay();
}

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
});

nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
});

// === PRODUCTOS Y CARRITO ===
let carrito = {};
let total = 0;

function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function cargarProductos() {
    const container = document.getElementById('categorias-container');
    container.innerHTML = '';

    Object.entries(products).forEach(([categoria, productos]) => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = categoria;

        const table = document.createElement('table');
        const tbody = document.createElement('tbody');

        Object.entries(productos).forEach(([producto, precio]) => {
            const tr = document.createElement('tr');
            const productId = slugify(producto);

            tr.innerHTML = `
                <td id="${productId}">${producto}</td>
                <td>$${precio}</td>
                <td>
                    <div class="contador">
                        <button onclick="ajustarCantidad('${productId}', -1)">-</button>
                        <span id="contador-${productId}">0</span>
                        <button onclick="ajustarCantidad('${productId}', 1)">+</button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        details.appendChild(summary);
        details.appendChild(table);
        container.appendChild(details);
    });
}

function ajustarCantidad(productId, cambio) {
    const contador = document.getElementById(`contador-${productId}`);
    let cantidad = parseInt(contador.textContent) || 0;
    cantidad = Math.max(0, cantidad + cambio);
    contador.textContent = cantidad;

    actualizarCarrito(productId, cantidad);
    actualizarTotal();
}

function actualizarCarrito(productId, cantidad) {
    const productoNombre = Object.entries(products)
        .flatMap(([_, productos]) => Object.keys(productos))
        .find(nombre => slugify(nombre) === productId);

    if (cantidad > 0) {
        carrito[productId] = {
            nombre: productoNombre,
            precio: obtenerPrecioProducto(productoNombre),
            cantidad: cantidad
        };
    } else {
        delete carrito[productId];
    }
    actualizarLista();
}

function obtenerPrecioProducto(nombre) {
    for (const categoria in products) {
        if (products[categoria][nombre]) {
            return products[categoria][nombre];
        }
    }
    return 0;
}

function actualizarTotal() {
    total = Object.values(carrito).reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalContainer = document.getElementById('total');
    if (totalContainer) {
        totalContainer.textContent = total;
    }
}

function actualizarLista() {
    const lista = document.getElementById('product-list');
    if (!lista) return;
    lista.innerHTML = '';

    Object.values(carrito).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.nombre}</span>
            <span>
                x${item.cantidad}
                <span class="precio-total">$${item.precio * item.cantidad}</span>
            </span>
        `;
        lista.appendChild(li);
    });
}

// === WHATSAPP ===
document.getElementById('send-whatsapp')?.addEventListener('click', () => {
    if (total === 0) {
        alert("¡Tu carrito está vacío!");
        return;
    }

    const mensaje = `🚀 Pedido LimpiArte 🚀\n\n${
        Object.values(carrito).map(item =>
            `${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}`
        ).join('\n')
    }\n\nTotal: $${total}`;

    window.open(`https://wa.me/5493541399892?text=${encodeURIComponent(mensaje)}`, '_blank');
});

// === PANEL ADMIN FIREBASE ===
let editandoProductoId = null;

function renderProductosAdmin() {
    const contenedor = document.getElementById('admin-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    Object.entries(products).forEach(([categoria, lista]) => {
        const titulo = document.createElement('h3');
        titulo.textContent = categoria;
        contenedor.appendChild(titulo);

        Object.entries(lista).forEach(([nombre, precio]) => {
            const div = document.createElement('div');
            div.className = 'admin-producto';

            div.innerHTML = `
                <span><strong>${nombre}</strong> - $${precio}</span>
                <button onclick="editarProducto('${categoria}', '${nombre}')">✏️</button>
                <button onclick="eliminarProducto('${categoria}', '${nombre}')">🗑️</button>
            `;

            contenedor.appendChild(div);
        });
    });
}

function editarProducto(categoria, nombre) {
    const precio = products[categoria][nombre];
    document.getElementById('admin-categoria').value = categoria;
    document.getElementById('admin-nombre').value = nombre;
    document.getElementById('admin-precio').value = precio;

    editandoProductoId = { categoria, nombre };
    document.getElementById('cancelar-edicion').style.display = 'inline-block';
}

function eliminarProducto(categoria, nombre) {
    if (confirm(`¿Eliminar "${nombre}" de "${categoria}"?`)) {
        db.collection("productos")
          .doc(`${categoria}-${nombre}`)
          .delete()
          .then(cargarDesdeFirebase);
    }
}

document.getElementById('admin-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const categoria = document.getElementById('admin-categoria').value.trim();
    const nombre = document.getElementById('admin-nombre').value.trim();
    const precio = parseInt(document.getElementById('admin-precio').value.trim());

    if (!categoria || !nombre || isNaN(precio)) return;

    db.collection("productos")
      .doc(`${categoria}-${nombre}`)
      .set({ categoria, nombre, precio })
      .then(() => {
          cargarDesdeFirebase();
          e.target.reset();
          editandoProductoId = null;
          document.getElementById('cancelar-edicion').style.display = 'none';
      });
});

document.getElementById('cancelar-edicion')?.addEventListener('click', () => {
    document.getElementById('admin-form').reset();
    editandoProductoId = null;
    document.getElementById('cancelar-edicion').style.display = 'none';
});

// Cerrar resultados al hacer clic afuera
document.addEventListener('click', (e) => {
    const resultsContainer = document.getElementById('search-results');
    if (!e.target.closest('.search-box') && !e.target.closest('.search-result')) {
        resultsContainer.style.display = 'none';
    }
});