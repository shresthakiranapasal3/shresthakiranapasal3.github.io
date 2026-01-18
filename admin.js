// ================= AUTH =================
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    initAdmin();
  }
});

function login() {
  firebase.auth()
    .signInWithEmailAndPassword(email.value, password.value)
    .catch(err => loginError.innerText = err.message);
}

function logout() {
  firebase.auth().signOut();
}

// ================= HELPERS =================
function normalize(v) {
  return v ? v.trim().toLowerCase() : "";
}

// ================= INIT =================
function initAdmin() {
  loadCategories();
  loadProducts();
}

// ================= LOAD CATEGORIES =================
function loadCategories() {
  db.collection("categories")
    .where("active", "==", true)
    .orderBy("order")
    .onSnapshot(snap => {

      sub_cat_parent.innerHTML = "";
      type_parent.innerHTML = "";
      product_category.innerHTML = "";

      snap.forEach(doc => {
        const c = doc.data().name_en;

        sub_cat_parent.innerHTML += `<option value="${c}">${c}</option>`;
        type_parent.innerHTML += `<option value="${c}">${c}</option>`;
        product_category.innerHTML += `<option value="${c}">${c}</option>`;
      });

      // AUTO LOAD DEPENDENCIES
      loadSubcategoriesForProduct();
      loadSubcategoriesForType();
    });
}

// ================= SUBCATEGORIES =================
function loadSubcategoriesForProduct() {
  const cat = normalize(product_category.value);
  product_subcategory.innerHTML = "";

  if (!cat) return;

  db.collection("subcategories")
    .where("category", "==", cat)
    .where("active", "==", true)
    .orderBy("order")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        product_subcategory.innerHTML +=
          `<option value="${doc.data().name_en}">${doc.data().name_en}</option>`;
      });
      loadTypesForProduct();
    });
}

function loadSubcategoriesForType() {
  const cat = normalize(type_parent.value);
  type_sub_parent.innerHTML = "";

  if (!cat) return;

  db.collection("subcategories")
    .where("category", "==", cat)
    .where("active", "==", true)
    .orderBy("order")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        type_sub_parent.innerHTML +=
          `<option value="${doc.data().name_en}">${doc.data().name_en}</option>`;
      });
    });
}

// ================= TYPES =================
function loadTypesForProduct() {
  const sub = normalize(product_subcategory.value);
  product_type.innerHTML = "";

  if (!sub) return;

  db.collection("types")
    .where("subcategory", "==", sub)
    .where("active", "==", true)
    .orderBy("order")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        product_type.innerHTML +=
          `<option value="${doc.data().name_en}">${doc.data().name_en}</option>`;
      });
    });
}

// ================= EVENT BINDINGS =================
product_category.onchange = loadSubcategoriesForProduct;
product_subcategory.onchange = loadTypesForProduct;
type_parent.onchange = loadSubcategoriesForType;

// ================= ADD CATEGORY =================
async function addCategory() {
  const en = normalize(cat_en.value);
  if (!en) return alert("Category required");

  const dup = await db.collection("categories")
    .where("name_en", "==", en).get();
  if (!dup.empty) return alert("Category already exists");

  await db.collection("categories").add({
    name_en: en,
    name_np: cat_np.value.trim(),
    active: true,
    order: Date.now()
  });

  cat_en.value = cat_np.value = "";
}

// ================= ADD SUBCATEGORY =================
async function addSubcategory() {
  const cat = normalize(sub_cat_parent.value);
  const en = normalize(sub_en.value);
  if (!cat || !en) return alert("Missing fields");

  const dup = await db.collection("subcategories")
    .where("category", "==", cat)
    .where("name_en", "==", en).get();
  if (!dup.empty) return alert("Subcategory already exists");

  await db.collection("subcategories").add({
    category: cat,
    name_en: en,
    name_np: sub_np.value.trim(),
    active: true,
    order: Date.now()
  });

  sub_en.value = sub_np.value = "";
}

// ================= ADD TYPE =================
async function addType() {
  const cat = normalize(type_parent.value);
  const sub = normalize(type_sub_parent.value);
  const en = normalize(type_en.value);
  if (!cat || !sub || !en) return alert("Missing fields");

  const dup = await db.collection("types")
    .where("category", "==", cat)
    .where("subcategory", "==", sub)
    .where("name_en", "==", en).get();
  if (!dup.empty) return alert("Type already exists");

  await db.collection("types").add({
    category: cat,
    subcategory: sub,
    name_en: en,
    name_np: type_np.value.trim(),
    active: true,
    order: Date.now()
  });

  type_en.value = type_np.value = "";
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

  if (!editId) {
    const dup = await db.collection("products")
      .where("category", "==", data.category)
      .where("name_en", "==", data.name_en).get();
    if (!dup.empty) return alert("Product already exists");
  }

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
  } else {
    await db.collection("products").add(data);
  }

  resetProductForm();
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
        </div>`;
    });
  });
}

// ================= EDIT / DELETE =================
async function editProduct(id) {
  const doc = await db.collection("products").doc(id).get();
  const p = doc.data();
  editId = id;

  product_category.value = p.category;
  await loadSubcategoriesForProduct();
  product_subcategory.value = p.subcategory;
  await loadTypesForProduct();
  product_type.value = p.type;

  prod_en.value = p.name_en;
  prod_np.value = p.name_np;
  prod_qty.value = p.qty;
  prod_unit.value = p.unit;
  prod_price.value = p.price;
  prod_discount.value = p.discount_price || "";
}

async function deleteProduct(id) {
  if (!confirm("Delete this product permanently?")) return;
  await db.collection("products").doc(id).delete();
}

// ================= RESET =================
function resetProductForm() {
  editId = null;
  prod_en.value = prod_np.value = "";
  prod_qty.value = prod_price.value = prod_discount.value = "";
  prod_image.value = "";
}
