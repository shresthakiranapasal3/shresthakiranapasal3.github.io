auth.onAuthStateChanged(user=>{
  if(user){
    adminPanel.style.display="block";
    loadProducts();
  }
});

function login(){
 auth.signInWithEmailAndPassword(email.value,password.value)
 .catch(e=>alert(e.message));
}

function addProduct(){

  let file = image.files[0];
  let formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "kirana_upload");

  fetch("https://api.cloudinary.com/v1_1/dhpjzcuj3/image/upload", {
    method: "POST",
    body: formData
  })
  .then(r => r.json())
  .then(data => {

    let imgURL = data.secure_url;

    db.collection("products").add({
      name_en: pname.value,
      name_np: pname.value,   // we’ll auto convert later
      price: parseFloat(price.value),
      category: category.value,
      brand: brand.value,
      sellType: sellType.value,
      image: imgURL,
      featured: true
    });

    alert("✅ Product added");
  });
}


function loadProducts(){
 db.collection("products").onSnapshot(snap=>{
   let html="";
   snap.forEach(doc=>{
     let p=doc.data();
     html+=`${p.name_en} - Rs ${p.price} <button onclick="del('${doc.id}')">❌</button><br>`;
   });
   productList.innerHTML=html;
 });
}

function del(id){
 db.collection("products").doc(id).delete();
}

