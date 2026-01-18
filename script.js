// ================= GLOBAL STATE =================
let selectedcategory = "all";
let selectedsubcategory = "";
let selectedType = "";

let allProducts = [];
let cart = [];

// ================= category BAR =================
db.collection("categories")
  .where("active", "==", true)
  .orderBy("order")
  .onSnapshot(snapshot => {
    const box = document.getElementById("categories");
    box.innerHTML = "";

    // ALL BUTTON (DEFAULT)
    const allBtn = document.createElement("button");
    allBtn.innerText = "All";
    allBtn.classList.add("active");
    allBtn.onclick = () => {
      selectedcategory = "all";
      selectedsubcategory = "";
      selectedType = "";
      setActiveButton(box, allBtn);
      clearsubAndType();
      renderProducts();
    };
    box.appendChild(allBtn);

    snapshot.forEach(doc => {
      const name = doc.data().name_en.toLowerCase();
      const btn = document.createElement("button");
      btn.innerText = doc.data().name_en;

      btn.onclick = () => {
        selectedcategory = name;
        selectedsubcategory = "";
        selectedType = "";
        setActiveButton(box, btn);
        loadsubcategories();
        renderProducts();
      };

      box.appendChild(btn);
    });
  });

// ================= subcategory BAR =================
function loadsubcategories() {
  const box = document.getElementById("subcategories");
  box.innerHTML = "";

  if (!selectedcategory || selectedcategory === "all") return;

  db.collection("subcategories")
    .where("category", "==", selectedcategory)
    .where("active", "==", true)
    .orderBy("order")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const name = doc.data().name_en.toLowerCase();
        const btn = document.createElement("button");
        btn.innerText = doc.data().name_en;

        btn.onclick = () => {
          selectedsubcategory = name;
          selectedType = "";
          setActiveButton(box, btn);
          loadTypes();
          renderProducts();
        };

        box.appendChild(btn);
      });
    });
}

// ================= TYPE BAR =================
function loadTypes() {
  const box = document.getElementById("types");
  box.innerHTML = "";

  if (!selectedcategory || !selectedsubcategory) return;

  db.collection("types")
    .where("category", "==", selectedcategory)
    .where("subcategory", "==", selectedsubcategory)
    .where("active", "==", true)
    .orderBy("order")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const name = doc.data().name_en.toLowerCase();
        const btn = document.createElement("button");
        btn.innerText = doc.data().name_en;

        btn.onclick = () => {
          selectedType = name;
          setActiveButton(box, btn);
          renderProducts();
        };

        box.appendChild(btn);
      });
    });
}

// ================= LOAD PRODUCTS ONCE =================
db.collection("products")
  .where("active", "==", true)
  .onSnapshot(snapshot => {
    allProducts = [];
    snapshot.forEach(doc => {
      const p = doc.data();
      allProducts.push({
        id: doc.id,
        ...p,
        category: p.category.toLowerCase(),
        subcategory: p.subcategory.toLowerCase(),
        type: p.type.toLowerCase()
      });
    });
    renderProducts();
  });

// ================= RENDER PRODUCTS =================
function renderProducts() {
  const box = document.getElementById("products");
  box.innerHTML = "";

  let filtered = allProducts;

  if (selectedcategory !== "all") {
    filtered = filtered.filter(p => p.category === selectedcategory);
  }

  if (selectedsubcategory) {
    filtered = filtered.filter(p => p.subcategory === selectedsubcategory);
  }

  if (selectedType) {
    filtered = filtered.filter(p => p.type === selectedType);
  }

  if (filtered.length === 0) {
    box.innerHTML = "<p style='padding:15px'>No products found</p>";
    return;
  }

  filtered.forEach(p => {
    box.innerHTML += `
      <div class="product-card">
        <img src="${p.image}">
        <h4>${p.name_en}</h4>
        <small>${p.name_np}</small>
        <p>${p.qty} ${p.unit}</p>

        ${
          p.discount_price
            ? `<p class="price-cut">Rs ${p.price}</p>
               <p class="discount">Rs ${p.discount_price}</p>`
            : `<p class="discount">Rs ${p.price}</p>`
        }

        <button onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    `;
  });
}

// ================= CART =================
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });

  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  renderCart();
}

function renderCart() {
  const box = document.getElementById("sideCartItems");
  const totalBox = document.getElementById("sideCartTotal");
  const countBox = document.getElementById("cartCount");

  box.innerHTML = "";
  let total = 0;

  cart.forEach(i => {
    const price = i.discount_price || i.price;
    total += price * i.qty;

    box.innerHTML += `
      <div class="cart-item">
        <span>${i.name_en}</span>
        <div class="cart-controls">
          <button class="minus" onclick="changeQty('${i.id}', -1)">−</button>
          <span>${i.qty}</span>
          <button class="plus" onclick="changeQty('${i.id}', 1)">+</button>
          <button class="remove" onclick="changeQty('${i.id}', -${i.qty})">✖</button>
        </div>
      </div>
    `;
  });

  totalBox.innerText = total;
  countBox.innerText = cart.length;
}

function toggleCart() {
  document.getElementById("sideCart").classList.toggle("show");
}

// ================= ORDER ACTIONS =================
function orderWhatsApp() {
  alert("WhatsApp order will be handled here.");
}

function orderMessenger() {
  alert("Messenger order will be handled here.");
}

function orderCall() {
  window.location.href = "tel:+9779767156270";
}

// ================= HELPERS =================
function setActiveButton(container, activeBtn) {
  Array.from(container.children).forEach(btn =>
    btn.classList.remove("active")
  );
  activeBtn.classList.add("active");
}

function clearsubAndType() {
  document.getElementById("subcategories").innerHTML = "";
  document.getElementById("types").innerHTML = "";
}
