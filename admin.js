// ================================
// 🔥 FIREBASE (already initialized in firebase.js)
// ================================
const categorySelects = document.querySelectorAll(".category-select");
const subcategorySelects = document.querySelectorAll(".subcategory-select");
const typeSelects = document.querySelectorAll(".type-select");

// ================================
// 📦 LOAD categories
// ================================
function loadcategories() {
  db.collection("categories")
    .where("active", "==", true)
    .get()
    .then(snapshot => {
      categorySelects.forEach(select => {
        select.innerHTML = `<option value="">Select category</option>`;
        snapshot.forEach(doc => {
          const c = doc.data();
          select.innerHTML += `<option value="${c.name_en}">${c.name_en}</option>`;
        });
      });
    });
}

// ================================
// 📦 LOAD subcategories (STRING MATCH)
// ================================
function loadsubcategories(categoryName) {
  subcategorySelects.forEach(select => {
    select.innerHTML = `<option value="">Select sub-category</option>`;
  });
  typeSelects.forEach(select => {
    select.innerHTML = `<option value="">Select type</option>`;
  });

  if (!categoryName) return;

  db.collection("subcategories")
    .where("active", "==", true)
    .where("category", "==", categoryName)
    .get()
    .then(snapshot => {
      subcategorySelects.forEach(select => {
        snapshot.forEach(doc => {
          const s = doc.data();
          select.innerHTML += `<option value="${s.name_en}">${s.name_en}</option>`;
        });
      });
    });
}

// ================================
// 📦 LOAD TYPES (STRING MATCH)
// ================================
function loadTypes(categoryName, subcategoryName) {
  typeSelects.forEach(select => {
    select.innerHTML = `<option value="">Select type</option>`;
  });

  if (!categoryName || !subcategoryName) return;

  db.collection("types")
    .where("active", "==", true)
    .where("category", "==", categoryName)
    .where("subcategory", "==", subcategoryName)
    .get()
    .then(snapshot => {
      typeSelects.forEach(select => {
        snapshot.forEach(doc => {
          const t = doc.data();
          select.innerHTML += `<option value="${t.name_en}">${t.name_en}</option>`;
        });
      });
    });
}

// ================================
// 🔄 EVENT BINDINGS
// ================================
categorySelects.forEach(select => {
  select.addEventListener("change", e => {
    loadsubcategories(e.target.value);
  });
});

subcategorySelects.forEach(select => {
  select.addEventListener("change", e => {
    const category =
      e.target.closest("section").querySelector(".category-select").value;
    loadTypes(category, e.target.value);
  });
});

// ================================
// ➕ ADD subcategory
// ================================
document.getElementById("addsubcategoryBtn")?.addEventListener("click", () => {
  const category = document.getElementById("subcategorycategory").value;
  const nameEn = document.getElementById("subcategoryNameEn").value.trim();
  const nameNp = document.getElementById("subcategoryNameNp").value.trim();

  if (!category || !nameEn) return alert("Missing fields");

  db.collection("subcategories")
    .where("category", "==", category)
    .where("name_en", "==", nameEn)
    .get()
    .then(snap => {
      if (!snap.empty) return alert("sub-category already exists");

      db.collection("subcategories").add({
        category,
        name_en: nameEn,
        name_np: nameNp,
        active: true
      }).then(() => {
        alert("sub-category added");
        loadsubcategories(category);
      });
    });
});

// ================================
// ➕ ADD TYPE
// ================================
document.getElementById("addTypeBtn")?.addEventListener("click", () => {
  const category = document.getElementById("typecategory").value;
  const subcategory = document.getElementById("typesubcategory").value;
  const nameEn = document.getElementById("typeNameEn").value.trim();
  const nameNp = document.getElementById("typeNameNp").value.trim();

  if (!category || !subcategory || !nameEn) return alert("Missing fields");

  db.collection("types")
    .where("category", "==", category)
    .where("subcategory", "==", subcategory)
    .where("name_en", "==", nameEn)
    .get()
    .then(snap => {
      if (!snap.empty) return alert("Type already exists");

      db.collection("types").add({
        category,
        subcategory,
        name_en: nameEn,
        name_np: nameNp,
        active: true
      }).then(() => {
        alert("Type added");
        loadTypes(category, subcategory);
      });
    });
});

// ================================
// 🚀 INIT
// ================================
window.addEventListener("DOMContentLoaded", () => {
  loadcategories();
});


// ================================
// 🔐 ADMIN LOGIN
// ================================
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("dashboardSection").classList.remove("hidden");
    })
    .catch(err => {
      alert(err.message);
    });
}

