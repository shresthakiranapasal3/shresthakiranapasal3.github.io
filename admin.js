async function autoNepali(text){
 let url="https://inputtools.google.com/request?text="+encodeURIComponent(text)+"&itc=ne-t-i0-und&num=1";
 let r=await fetch(url);
 let d=await r.json();
 return d[1][0][1][0];
}



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
let editId=null;

async function addProduct(){

 let file=image.files[0];
 let formData=new FormData();

 formData.append("file",file);
 formData.append("upload_preset","kirana_upload");

 let upload=await fetch("https://api.cloudinary.com/v1_1/dhpjzcuj3/image/upload",{
  method:"POST",
  body:formData
 });
 let data=await upload.json();

 let imgURL=data.secure_url;

 let nepali = await autoNepali(pname.value);

 let product={
  name_en:pname.value,
  name_np:nepali,
  price:parseFloat(price.value),
  category:category.value,
  brand:brand.value,
  sellType:sellType.value,
  image:imgURL,
  featured:true,
  stock:true,
  created:Date.now()
 };

 if(editId){
  db.collection("products").doc(editId).update(product);
  editId=null;
  alert("✏ Updated");
 }else{
  db.collection("products").add(product);
  alert("✅ Added");
 }
}

function loadProducts(){
 db.collection("products").onSnapshot(snap=>{
  let html="";
  snap.forEach(doc=>{
   let p=doc.data();
   html+=`
   <div style="border:1px solid #ccc;padding:6px;margin:4px">
    <img src="${p.image}" width="40">
    ${p.name_en}
    <button onclick="edit('${doc.id}')">✏</button>
    <button onclick="toggleStock('${doc.id}',${p.stock})">
     ${p.stock?"❌ Out":"✅ In"}
    </button>
    <button onclick="del('${doc.id}')">🗑</button>
   </div>`;
  });
  productList.innerHTML=html;
 });
}

function edit(id){
 db.collection("products").doc(id).get().then(d=>{
  let p=d.data();
  pname.value=p.name_en;
  price.value=p.price;
  category.value=p.category;
  brand.value=p.brand;
  sellType.value=p.sellType;
  editId=id;
 });
}

function toggleStock(id,cur){
 db.collection("products").doc(id).update({stock:!cur});
}




