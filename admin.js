// admin.js

// Conexión a Firebase (ya inicializada en el HTML)
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
    const grupo = document.createElement('div');

    const titulo = document.createElement('h2');
    titulo.textContent = categoria;
    titulo.style.marginTop = '20px';
    titulo.style.color = '#7b4b94';
    grupo.appendChild(titulo);

    Object.entries(lista).forEach(([nombre, precio]) => {
      const div = document.createElement('div');
      div.className = 'producto-item';
      div.innerHTML = `
        <h3>${nombre}</h3>
        <p><strong>Precio:</strong> $${precio}</p>
        <div class="producto-botones">
          <button class="btn-editar" onclick="editarProducto('${categoria}', '${nombre}')">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto('${categoria}', '${nombre}')">Eliminar</button>
        </div>
      `;
      grupo.appendChild(div);
    });

    contenedor.appendChild(grupo);
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
