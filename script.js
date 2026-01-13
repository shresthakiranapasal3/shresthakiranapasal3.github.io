let currentLang = "en";

function setLang(lang) {
  currentLang = lang;
  displayProducts();
}

async function loadProducts() {
  const res = await fetch("products.json");
  return await res.json();
}

function formatPrice(product, qty) {
  if (product.category === "weight" || product.category === "liter") {
    return "Rs " + (qty * parseFloat(product["price_per_" + (product.category === "weight" ? "kg" : "l")])).toFixed(2);
  }
  if (product.category === "piece") {
    return "Rs " + (qty * parseFloat(product.price_per_pc)).toFixed(2);
  }
  return "Rs 0";
}

function renderQtyButtons(product) {
  let html = "";
  if (product.category === "weight") {
    html += `<div class="quantity-options">
            <button onclick="selectQty('${product.id}', 0.5)">0.5kg</button>
            <button onclick="selectQty('${product.id}', 1)">1kg</button>
            <button onclick="selectQty('${product.id}', 1.5)">1.5kg</button>
            <button onclick="selectQty('${product.id}', 2)">2kg</button>
            <button onclick="selectQty('${product.id}', 3)">3kg</button>
            <button onclick="selectQty('${product.id}', 5)">5kg</button>
            <div><input type="number" id="custom-${product.id}" placeholder="Other kg"></div>
            </div>`;
  }
  if (product.category === "liter") {
    html += `<div class="quantity-options">
            <button onclick="selectQty('${product.id}', 0.5)">0.5L</button>
            <button onclick="selectQty('${product.id}', 1)">1L</button>
            <button onclick="selectQty('${product.id}', 2)">2L</button>
            <div><input type="number" id="custom-${product.id}" placeholder="Other L"></div>
            </div>`;
  }
  if (product.category === "piece") {
    html += `<div class="quantity-options">
            <button onclick="selectQty('${product.id}', 1)">1pc</button>
            <button onclick="selectQty('${product.id}', 2)">2pc</button>
            <button onclick="selectQty('${product.id}', 5)">5pc</button>
            <div><input type="number" id="custom-${product.id}" placeholder="Other pcs"></div>
            </div>`;
  }
  return html;
}

let selectedQty = {};

function selectQty(id, qty) {
  selectedQty[id] = qty;
  displayProducts();
}

async function displayProducts() {
  let products = await loadProducts();
  let container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach(product => {
    let qty = selectedQty[product.id] || 0;
    let price = qty > 0 ? formatPrice(product, qty) : "";

    container.innerHTML += `
      <div class="product">
        <img src="${product.image}" alt="${product["name_" + currentLang]}">
        <h2>${product["name_" + currentLang]}</h2>
        ${renderQtyButtons(product)}
        <p>${price ? "Total: " + price : ""}</p>
        <button class="order-btn" onclick="orderProduct('${product.id}')">
          ${currentLang === "en" ? "Order" : "अर्डर"}
        </button>
      </div>
    `;
  });
}

function orderProduct(id) {
  let products = JSON.parse(JSON.stringify(window.productsCache || []));
  let product = products.find(p => p.id === id);
  let qty = selectedQty[id];
  if (!qty || qty === 0) {
    alert("Please select quantity first.");
    return;
  }

  let message = `${product["name_en"]} - ${qty} ${
    product.category === "piece" ? "pcs" : product.category === "liter" ? "L" : "kg"
  } = ${formatPrice(product, qty)}`;

  window.open(
    "https://wa.me/?text=" + encodeURIComponent("Order from Shrestha Kirana Pasal:\n" + message)
  );
}

displayProducts();
