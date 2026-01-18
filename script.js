// ================= GLOBAL STATE =================
let selectedcategory = "";
let selectedsubcategory = "";
let selectedType = "";
let cart = [];

// ================= category BAR =================
db.collection("categories")
  .where("active", "==", true)
  .orderBy("order")
  .onSnapshot(snapshot => {
    const box = document.getElementById("categories");
    box.innerHTML = "";

    snapshot.forEach(doc => {
      const name = doc.data().name_en;

      const btn = document.createElement("button");
      btn.innerText = name;

      btn.onclick = () => {
        selectedcategory = name;
        selectedsubcategory = "";
        selectedType = "";

        loadsubcategories();
        loadProducts();
      };

      box.appendChild(btn);
    });
  });

// ================= subcategory BAR =================
function loadsubcategories() {
  const box = document.getElementById("subcategories");
  box.innerHTML = "";

  if (!selectedcategory) return;

  db.collection("subcategories")
    .where("category", "==", selectedcategory)
    .where("active", "==", true)
    .orderBy("order")
    .onSnapshot(snapshot => {
      snapshot.forEach(doc => {
        const name = doc.data().name_en;

        const btn = document.createElement("button");
        btn.innerText = name;

        btn.onclick = () => {
          selectedsubcategory = name;
          selectedType = "";

          loadTypes();
          loadProducts();
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
    .onSnapshot(snapshot => {
      snapshot.forEach(doc => {
        const name = doc.data().name_en;

        const btn = document.createElement("button");
        btn.innerText = name;

        btn.onclick = () => {
          selectedType = name;
          loadProducts();
        };

        box.appendChild(btn);
      });
    });
}

// ================= PRODUCTS =================
function loadProducts() {
  let query = db.collection("products").where("active", "==", true);

  if (selectedcategory)
    query = query.where("category", "==", selectedcategory);

  if (selectedsubcategory)
    query = query.where("subcategory", "==", selectedsubcategory);

  if (selectedType)
    query = query.where("type", "==", selectedType);

  query.onSnapshot(snapshot => {
    const box = document.getElementById("products");
    box.innerHTML = "";

    snapshot.forEach(doc => {
      const p = doc.data();

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

          <button onclick='addToCart({
            id: "${doc.id}",
            name_en: "${p.name_en}",
            price: ${p.price},
            discount_price: ${p.discount_price || "null"}
          })'>
            Add to Cart
          </button>
        </div>
      `;
    });
  });
}

// ================= CART =================
function addToCart(product, qty = 1) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty });

  renderCart();
}

function renderCart() {
  const box = document.getElementById("sideCartItems");
  const totalBox = document.getElementById("sideCartTotal");

  box.innerHTML = "";
  let total = 0;

  cart.forEach(i => {
    const price = i.discount_price || i.price;
    total += price * i.qty;

    box.innerHTML += `
      <div class="cart-item">
        <span>${i.name_en} × ${i.qty}</span>
        <span>Rs ${price * i.qty}</span>
      </div>
    `;
  });

  totalBox.innerText = total;
  document.getElementById("cartCount").innerText = cart.length;
}

function toggleCart() {
  document.getElementById("sideCart").classList.toggle("show");
}
