// ================================
// 🔥 FIREBASE INITIALIZATION (TOP)
// ================================
const firebaseConfig = {
  apiKey: "AIzaSyAZM-X3el9Eug_FaNWQbixfB-rrHFt29_Q",
  authDomain: "shrestha-kirana-pasal.firebaseapp.com",
  projectId: "shrestha-kirana-pasal",
  storageBucket: "shrestha-kirana-pasal.firebasestorage.app",
  messagingSenderId: "621450478702",
  appId: "1:621450478702:web:6c54b7b4674bd5085ad27f",
  measurementId: "G-53VG3XNFQ5"
};

firebase.initializeApp(firebaseConfig);
// ================================
// ☁️ CLOUDINARY CONFIG
// ================================
const CLOUD_NAME = "dhpjzcuj3";
const UPLOAD_PRESET = "kirana_products";

const auth = firebase.auth();
const db = firebase.firestore();

// ================================
// 🔐 AUTH
// ================================
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginSection").classList.add("hidden");
      document.getElementById("dashboardSection").classList.remove("hidden");
      loadcategories();
    })
    .catch(err => {
      document.getElementById("loginError").innerText = err.message;
    });
}

function logout() {
  auth.signOut().then(() => location.reload());
}

// ================================
// 📁 category
// ================================
function addcategory() {
  const name_en = document.getElementById("cat_en").value.trim();
  const name_np = document.getElementById("cat_np").value.trim();

  if (!name_en || !name_np) {
    alert("Fill both category names");
    return;
  }

  db.collection("categories").add({
    name_en,
    name_np,
    active: true,
    order: Date.now(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("✅ category added");
    document.getElementById("cat_en").value = "";
    document.getElementById("cat_np").value = "";
    loadcategories();
  });
}

// ================================
// 🔄 LOAD categories
// ================================


function loadcategories() {
  const categoryDropdowns = [
    "sub_cat_parent",
    "type_parent",
    "product_category"
  ];

  categoryDropdowns.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "<option value=''>Select category</option>";
  });

  db.collection("categories")
    .where("active", "==", true)
    .orderBy("order")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const cat = doc.data().name_en;
        categoryDropdowns.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
      });
    });
}



// ================================
// 🧠 SAFE EVENT BINDING (VERY IMPORTANT)
// ================================
document.addEventListener("DOMContentLoaded", () => {

  const productcategory = document.getElementById("product_category");
  const productsubcategory = document.getElementById("product_subcategory");

  if (productcategory) {
    productcategory.addEventListener("change", function () {
      const category = this.value;
      const subSelect = document.getElementById("product_subcategory");
      const typeSelect = document.getElementById("product_type");

      subSelect.innerHTML = "<option value=''>Select subcategory</option>";
      typeSelect.innerHTML = "<option value=''>Select Type</option>";

      db.collection("subcategories")
        .where("category", "==", category)
        .where("active", "==", true)
        .orderBy("order")
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            subSelect.innerHTML +=
              `<option value="${doc.data().name_en}">${doc.data().name_en}</option>`;
          });
        });
    });
  }

  if (productsubcategory) {
    productsubcategory.addEventListener("change", function () {
      const category = document.getElementById("product_category").value;
      const subcategory = this.value;
      const typeSelect = document.getElementById("product_type");

      typeSelect.innerHTML = "<option value=''>Select Type</option>";

      db.collection("types")
        .where("category", "==", category)
        .where("subcategory", "==", subcategory)
        .where("active", "==", true)
        .orderBy("order")
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            typeSelect.innerHTML +=
              `<option value="${doc.data().name_en}">${doc.data().name_en}</option>`;
          });
        });
    });
  }

  // ================================
// 🔄 LOAD sub-categories FOR ADD TYPE
// ================================
const typecategorySelect = document.getElementById("type_parent");
const typesubcategorySelect = document.getElementById("type_sub_parent");

if (typecategorySelect && typesubcategorySelect) {
  typecategorySelect.addEventListener("change", function () {
    const category = this.value;

    typesubcategorySelect.innerHTML =
      "<option value=''>Select sub-category</option>";

    if (!category) return;

    db.collection("subcategories")
      .where("category", "==", category)
      .where("active", "==", true)
      .orderBy("order")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          typesubcategorySelect.innerHTML +=
            `<option value="${doc.data().name_en}">
              ${doc.data().name_en}
            </option>`;
        });
      });
  });
}



});


// ================================
// 🚧 TEMPORARY SAFE FUNCTIONS
// (Prevents JS from crashing)
// ================================
function addsubcategory() {
  const category = document.getElementById("sub_cat_parent").value;
  const name_en = document.getElementById("sub_en").value.trim();
  const name_np = document.getElementById("sub_np").value.trim();

  if (!category || !name_en || !name_np) {
    alert("Please fill all sub-category fields");
    return;
  }

  db.collection("subcategories").add({
    category,
    name_en,
    name_np,
    active: true,
    order: Date.now(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("✅ sub-category added");

    document.getElementById("sub_en").value = "";
    document.getElementById("sub_np").value = "";
  }).catch(err => {
    alert(err.message);
  });
}


function addType() {
  const category = document.getElementById("type_parent").value;
  const subcategory = document.getElementById("type_sub_parent").value;
  const name_en = document.getElementById("type_en").value.trim();
  const name_np = document.getElementById("type_np").value.trim();

  if (!category || !subcategory || !name_en || !name_np) {
    alert("Fill all type fields");
    return;
  }

  db.collection("types").add({
    category,
    subcategory,
    name_en,
    name_np,
    active: true,
    order: Date.now(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("✅ Type added successfully");
    document.getElementById("type_en").value = "";
    document.getElementById("type_np").value = "";
  });
}



function addProduct() {
  const category = document.getElementById("product_category").value;
  const subcategory = document.getElementById("product_subcategory").value;
  const type = document.getElementById("product_type").value;

  const name_en = document.getElementById("prod_en").value.trim();
  const name_np = document.getElementById("prod_np").value.trim();

  const qty = Number(document.getElementById("prod_qty").value);
  const unit = document.getElementById("prod_unit").value;

  const price = Number(document.getElementById("prod_price").value);
  const discount_price = Number(document.getElementById("prod_discount").value || 0);

  const imageFile = document.getElementById("prod_image").files[0];

  if (!category || !subcategory || !type ||
      !name_en || !name_np ||
      !qty || !unit || !price || !imageFile) {
    alert("Please fill all required product fields");
    return;
  }

  // 🔄 Upload image to Cloudinary
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (!data.secure_url) {
        alert("Image upload failed");
        return;
      }

      // 💾 Save product in Firestore
      return db.collection("products").add({
        category,
        subcategory,
        type,
        name_en,
        name_np,
        qty,
        unit,
        price,
        discount_price,
        image: data.secure_url,
        active: true,
        order: Date.now(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("✅ Product added successfully");

      // Clear form
      document.getElementById("prod_en").value = "";
      document.getElementById("prod_np").value = "";
      document.getElementById("prod_qty").value = "";
      document.getElementById("prod_unit").value = "";
      document.getElementById("prod_price").value = "";
      document.getElementById("prod_discount").value = "";
      document.getElementById("prod_image").value = "";
    })
    .catch(err => {
      console.error(err);
      alert(err.message);
    });
}
