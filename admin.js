let products = {};
let editandoProductoId = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarDesdeFirebase();

  document.getElementById('admin-form').addEventListener('submit', async e => {
    e.preventDefault();

    const categoria = document.getElementById('admin-categoria').value.trim();
    const nombre = document.getElementById('admin-nombre').value.trim();
    const precio = parseFloat(document.getElementById('admin-precio').value.trim());
    const archivo = document.getElementById('admin-file').files[0];
    const id = `${categoria}-${nombre}`;

    if (!categoria || !nombre || isNaN(precio)) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    let mediaURL = editandoProductoId?.mediaURL || null;

    if (archivo) {
      if (mediaURL) {
        try {
          const refAntiguo = storage.refFromURL(mediaURL);
          await refAntiguo.delete();
        } catch (err) {
          console.warn("No se pudo eliminar el archivo anterior:", err.message);
        }
      }

      const refNuevo = storage.ref(`productos/${id}/${archivo.name}`);
      const snapshot = await refNuevo.put(archivo);
      mediaURL = await snapshot.ref.getDownloadURL();
    }

    db.collection("productos")
      .doc(id)
      .set({ categoria, nombre, precio, mediaURL })
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
    products[data.categoria][data.nombre] = {
      precio: data.precio,
      mediaURL: data.mediaURL || null
    };
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

    Object.entries(lista).forEach(([nombre, datos]) => {
      const div = document.createElement('div');
      div.className = 'admin-producto';

      let mediaHTML = '';
      if (datos.mediaURL) {
        const esImagen = datos.mediaURL.match(/\.(jpeg|jpg|png|gif)$/i);
        mediaHTML = esImagen
          ? `<img src="${datos.mediaURL}" />`
          : `<video src="${datos.mediaURL}" controls></video>`;
      }

      div.innerHTML = `
        <div style="flex: 1;">
          <strong>${nombre}</strong> - $${datos.precio}<br/>
          ${mediaHTML}
        </div>
        <div style="display: flex; gap: 4px;">
          <button onclick="editarProducto('${categoria}', '${nombre}')">✏️</button>
          <button onclick="eliminarProducto('${categoria}', '${nombre}')">🗑️</button>
        </div>
      `;
      contenedor.appendChild(div);
    });
  });
}

function editarProducto(categoria, nombre) {
  const datos = products[categoria][nombre];
  document.getElementById('admin-categoria').value = categoria;
  document.getElementById('admin-nombre').value = nombre;
  document.getElementById('admin-precio').value = datos.precio;
  editandoProductoId = { categoria, nombre, mediaURL: datos.mediaURL };
  document.getElementById('cancelar-edicion').style.display = 'inline-block';
}

function eliminarProducto(categoria, nombre) {
  const confirmar = confirm(`¿Eliminar el producto "${nombre}" de la categoría "${categoria}"?`);
  if (!confirmar) return;

  const id = `${categoria}-${nombre}`;
  const producto = products[categoria][nombre];

  if (producto.mediaURL) {
    try {
      const ref = storage.refFromURL(producto.mediaURL);
      ref.delete().catch(console.warn);
    } catch (err) {
      console.warn("No se pudo eliminar media:", err.message);
    }
  }

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
