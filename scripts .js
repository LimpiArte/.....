const products = {
            "Glade aerosol": 3200,
            "Baygon mata mosca y mosquito": 4500,
            "Raid": 5000,
            "Glade limpia inodoro adhesivo": 2000,
            "Glade pastilla inodoro ch canasta": 1300,
            "Cepillo mano Glady": 1000,
            "Osram lámpara luz led": 2000,
            "Esponja 2X1 con lana de acero": 1200,
            "Esponja GO": 800,
            "Esponja acanalada": 1000,
            "Esponja acero chica": 700,
            "Esponja acero grande": 900,
            "Trapo piso": 800,
            "Rejilla": 1000,
            "Repasador toalla": 1500,
            "Odol crema dental": 2300,
            "Broches madera": 1200,
            "Cabo madera": 1200,
            "Escobillón": 2800,
            "Detergente envasado Cif x300": 2200,
            "Detergente envasado Magistral x300": 2800,
            "Detergente envasado gigante x500": 1600,
            "Cloro": 900,
            "Perfumina": 700,
            "Lysofort, BB": 800,
            "Limpia vidrio": 1500,
            "Banda negra": 3000,
            "Jabón líquido Skip": 1300,
            "Jabón líquido Ariel": 1500,
            "Perfume textil Berc": 3800,
            "Perfume textil Arpee": 3000,
            "Detergente tipo mao": 1500,
            "Desengrasante": 1400,
            "Suavizante celeste": 2000,
            "Shampoo tipo Pantene": 2000,
            "shampoo plusbelle": 4300,
            "Acondicionador tipo Pantene": 2000,
            "Creolina": 5000,
            "Jabón líquido de mano": 2700,
            "Papel higienico Campanita texturado": 1700,
            "Papel higienico Campanita soft": 1900,
            "Papel higienico Campanita Plus": 2300,
            "Servilleta Campanita": 2500,
            "Servilleta You": 2000,
            "Servilleta x70un": 1500,
            "Sahumerios 10x": 1500,
            "Jabón Duc Ind": 800,
            "Jabón de tocador Kenia x3": 1900,
            "Jabón de tocador Sequence x3": 1900,
            "Jabón de tocador Sequence x1": 700,
            "Desodorante en crema": 2800,
            "Talco Retona Efficient": 3000,
            "Toallitas femeninas Doncella": 900,
            "Toallitas femeninas Lady Soft": 1500,
            "Protector Diario Doncella": 1000,
            "Gillette Ultra Grip x3": 1900
        };

        const productRows = document.getElementById("product-rows");

        Object.entries(products).forEach(([product, price]) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${product}</td>
                <td>$${price}</td>
                <td>
                    <div class="contador">
                        <button onclick="adjustCount('${product}', -1)">-</button>
                        <span id="${product}">0</span>
                        <button onclick="adjustCount('${product}', 1)">+</button>
                    </div>
                </td>
            `;

            productRows.appendChild(row);
        });

        let total = 0;

        function adjustCount(product, change) {
            const countElement = document.getElementById(product);
            let currentCount = parseInt(countElement.innerText);
            currentCount += change;

            if (currentCount < 0) currentCount = 0;
            countElement.innerText = currentCount;

            updateTotal();
            updateProductList(product, currentCount);
        }

        function updateTotal() {
            total = 0;

            Object.entries(products).forEach(([product, price]) => {
                const count = parseInt(document.getElementById(product).innerText);
                total += count * price;
            });

            document.getElementById("total").innerText = total;
        }

        function updateProductList(product, count) {
            const list = document.getElementById("product-list");
            const productListItem = document.getElementById(`${product}-item`);

            if (count > 0) {
                if (!productListItem) {
                    const listItem = document.createElement("li");
                    listItem.id = `${product}-item`;
                    listItem.innerText = `${product} x ${count} - $${products[product] * count}`;
                    list.appendChild(listItem);
                } else {
                    productListItem.innerText = `${product} x ${count} - $${products[product] * count}`;
                }
            } else if (productListItem) {
                list.removeChild(productListItem);
            }
        }

        function generateWhatsAppMessage() {
            const list = document.getElementById("product-list");
            const items = list.querySelectorAll("li");
            const total = document.getElementById("total").innerText;

            if (items.length === 0) {
                alert("No has seleccionado ningún producto.");
                return null;
            }

            let message = "Hola, me gustaría realizar el siguiente pedido:\n\n";

            items.forEach(item => {
                message += `- ${item.innerText}\n`;
            });

            message += `\nTotal: $${total}`;
            return message;
        }

        document.getElementById("send-whatsapp").addEventListener("click", () => {
            const message = generateWhatsAppMessage();
            if (message) {
                const phoneNumber = "5493541399892"; // Reemplaza con el número de teléfono del negocio
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, "_blank");
            }
        });

