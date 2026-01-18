// ================= AUTH =================
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("dashboardSection").classList.remove("hidden");
    loadAllSelectors();
    loadProducts();
  }
});

function login() {
  firebase.auth().signInWithEmailAndPassword(
    email.value,
    password.value
  ).catch(err => {
    loginError.innerText = err.message;
  });
}

function logout() {
  firebase.auth().signOut();
}

// ================= HELPERS =================
function normalize(v) {
  return v.trim().toLowerCase();
}

// ================= CATEGORY =================
async function addCategory() {
  const en = normalize(cat_en.value);
  if (!en) return alert("Category required");

  const snap = await db.collection("categories")
    .where("name_en", "==", en).get();

  if (!snap.empty) return alert("Category already exists");

  await db.collection("categories").add({
    name_en: en,
    name_np: cat_np.value.trim(),
    active: true,
    order: Date.now()
  });

  alert("Category added");
  cat_en.value = cat_np.value = "";
  loadAllSelectors();
}

// ================= SUBCATEGORY =================
async function addSubcategory() {
  const cat = normalize(sub_cat_parent.value);
  const en = normalize(sub_en.value);
  if (!cat || !en) return alert("Missing fields");

  const snap = await db.collection("subcategories")
    .where("category", "==", cat)
    .where("name_en", "==", en)
    .get();

  if (!snap.empty) return alert("Subcategory already exists");

  await db.collection("subcategories").add({
    category: cat,
    name_en: en,
    name_np: sub_np.value.trim(),
    active: true,
    order: Date.now()
  });

  alert("Subcategory added");
  sub_en.value = sub_np.value = "";
  loadAllSelectors();
}

// ================= TYPE =================
async function addType() {
  const cat = normalize(type_parent.value);
  const sub = normalize(type_sub_parent.value);
  const en = normalize(type_en.value);
  if (!cat || !sub || !en) return alert("Missing fields");

  const snap = await db.collection("types")
    .where("category", "==", cat)
    .where("subcategory", "==", sub)
    .where("name_en", "==", en)
    .get();

  if (!snap.empty) return alert("Type already exists");

  await db.collection("types").add({
    category: cat,
    subcategory: sub,
    name_en: en,
    name_np: type_np.value.trim(),
    active: true,
    order: Date.now()
  });

  alert("Type added");
  type_en.value = type_np.value = "";
  loadAllSelectors();
}

// ================= PRODUCT =================
let editId = null;

async function addOrUpdateProduct() {
  const data = {
    category: normalize(product_category.value),
    subcategory: normalize(product_subcategory.value),
    type: normalize(product_type.value),
    name_en: normalize(prod_en.value),
    name_np: prod_np.value.trim(),
    qty: Number(prod_qty.value),
    unit: prod_unit.value,
    price: Number(prod_price.value),
    discount_price: prod_discount.value ? Number(prod_discount.value) : null,
    active: true
  };

  if (!data.name_en) return alert("Product name required");

  // DUPLICATE CHECK
  if (!editId) {
    const snap = await db.collection("products")
      .where("category", "==", data.category)
      .where("name_en", "==", data.name_en)
      .get();

    if (!snap.empty) return alert("Product already exists");
  }

  // IMAGE
  if (prod_image.files[0]) {
    const form = new FormData();
    form.append("file", prod_image.files[0]);
    form.append("upload_preset", "shrestha_kirana");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dkqk2v0rw/image/upload",
      { method: "POST", body: form }
    );

    const img = await res.json();
    data.image = img.secure_url;
  }

  if (editId) {
    await db.collection("products").doc(editId).update(data);
    alert("Product updated");
  } else {
    await db.collection("products").add(data);
    alert("Product added");
  }

  resetProductForm();
  loadProducts();
}

// ================= LOAD PRODUCTS =================
function loadProducts() {
  db.collection("products").onSnapshot(snap => {
    productList.innerHTML = "";
    snap.forEach(doc => {
      const p = doc.data();
      productList.innerHTML += `
        <div class="product-row">
          <img src="${p.image}">
          <div class="product-info">
            <b>${p.name_en}</b><br>
            Rs ${p.discount_price || p.price}
          </div>
          <div class="product-actions">
            <button class="edit" onclick="editProduct('${doc.id}')">Edit</button>
            <button class="delete" onclick="deleteProduct('${doc.id}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

// ================= EDIT / DELETE =================
async function editProduct(id) {
  const doc = await db.collection("products").doc(id).get();
  const p = doc.data();
  editId = id;

  product_category.value = p.category;
  product_subcategory.value = p.subcategory;
  product_type.value = p.type;
  prod_en.value = p.name_en;
  prod_np.value = p.name_np;
  prod_qty.value = p.qty;
  prod_unit.value = p.unit;
  prod_price.value = p.price;
  prod_discount.value = p.discount_price || "";
}

async function deleteProduct(id) {
  if (!confirm("Delete product permanently?")) return;
  await db.collection("products").doc(id).delete();
}

// ================= LOAD SELECTORS =================
function loadAllSelectors() {
  loadCategories("sub_cat_parent");
  loadCategories("type_parent");
  loadCategories("product_category");

  loadSubcategories("product_category", "product_subcategory");
  loadSubcategories("type_parent", "type_sub_parent");

  loadTypes();
}

function loadCategories(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = "<option value=''>Select Category</option>";

  db.collection("categories").get().then(snap => {
    snap.forEach(d => {
      sel.innerHTML += `<option value="${d.data().name_en}">
        ${d.data().name_en}
      </option>`;
    });
  });
}

function loadSubcategories(catId, subId) {
  document.getElementById(catId).onchange = e => {
    const sel = document.getElementById(subId);
    sel.innerHTML = "<option value=''>Select Subcategory</option>";

    db.collection("subcategories")
      .where("category", "==", normalize(e.target.value))
      .get()
      .then(snap => {
        snap.forEach(d => {
          sel.innerHTML += `<option value="${d.data().name_en}">
            ${d.data().name_en}
          </option>`;
        });
      });
  };
}

function loadTypes() {
  product_subcategory.onchange = () => {
    product_type.innerHTML = "<option value=''>Select Type</option>";

    db.collection("types")
      .where("subcategory", "==", normalize(product_subcategory.value))
      .get()
      .then(snap => {
        snap.forEach(d => {
          product_type.innerHTML += `<option value="${d.data().name_en}">
            ${d.data().name_en}
          </option>`;
        });
      });
  };
}

// ================= RESET =================
function resetProductForm() {
  editId = null;
  prod_en.value = prod_np.value = "";
  prod_qty.value = prod_price.value = prod_discount.value = "";
  prod_image.value = "";
}
