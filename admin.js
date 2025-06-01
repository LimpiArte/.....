// admin.js

// Conexión a Firebase (ya inicializada en admin.html)
let products = {};
let editandoProductoId = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarDesdeFirebase();

  document.getElementById('admin-form').addEventListener('submit', e => {
    e.preventDefault();

    const categoria = document.getElementById('admin-categoria').value.trim();
    const nombre = document.getElementById('admin-nombre').value.trim();
    const precio = parseFloat(document.getElementById('admin-precio').value.trim());

    if (!categoria || !nombre || isNaN(precio)) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    const id = `${categoria}-${nombre}`;

    db.collection("productos")
      .doc(id)
      .set({ categoria, nombre, precio })
      .then(() => {
        alert("Producto guardado correctamente.");
        cargarDesdeFirebase();
        e.target.reset();
        document.getElementById('cancelar-edicion').style.display = 'none';
        editandoProductoId = null;
      })
      .catch(error => {
        alert("Error al guardar: " + error.message);
      });
  });

  document.getElementById('cancelar-edicion').addEventListener('click', () => {
    document.getElementById('admin-form').reset();
    document.getElementById('cancelar-edicion').style.display = 'none';
    editandoProductoId = null;
  });
});

async function cargarDesdeFirebase() {
  const snapshot = await db.collection("productos").get();
  products = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!products[data.categoria]) products[data.categoria] = {};
    products[data.categoria][data.nombre] = data.precio;
  });

  renderProductosAdmin();
}

function renderProductosAdmin() {
  const contenedor = document.getElementById('admin-productos');
  contenedor.innerHTML = '';

  if (Object.keys(products).length === 0) {
    contenedor.innerHTML = "<p>No hay productos cargados.</p>";
    return;
  }

  Object.entries(products).forEach(([categoria, lista]) => {
    const titulo = document.createElement('h3');
    titulo.textContent = categoria;
    contenedor.appendChild(titulo);

    Object.entries(lista).forEach(([nombre, precio]) => {
      const div = document.createElement('div');
      div.className = 'admin-producto';
      div.style.marginBottom = '10px';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';

      div.innerHTML = `
        <span><strong>${nombre}</strong> - $${precio}</span>
        <div>
          <button onclick="editarProducto('${categoria}', '${nombre}')">✏️</button>
          <button onclick="eliminarProducto('${categoria}', '${nombre}')">🗑️</button>
        </div>
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
  const confirmar = confirm(`¿Eliminar el producto "${nombre}" de la categoría "${categoria}"?`);
  if (!confirmar) return;

  const id = `${categoria}-${nombre}`;

  db.collection("productos")
    .doc(id)
    .delete()
    .then(() => {
      alert("Producto eliminado.");
      cargarDesdeFirebase();
    })
    .catch(error => {
      alert("Error al eliminar: " + error.message);
    });
}