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
 let file=image.files[0];
 let ref=storage.ref("products/"+file.name);

 ref.put(file).then(()=>{
   ref.getDownloadURL().then(url=>{
     db.collection("products").add({
       name_en:pname.value,
       name_np:pname.value,
       price:parseFloat(price.value),
       category:category.value,
       brand:brand.value,
       sellType:sellType.value,
       image:url,
       featured:true
     });
   });
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
