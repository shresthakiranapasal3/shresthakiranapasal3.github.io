let editId = null;


async function autoNepali(text){
 let url="https://inputtools.google.com/request?text="+encodeURIComponent(text)+"&itc=ne-t-i0-und&num=1";
 let r=await fetch(url);
 let d=await r.json();
 return d[1][0][1][0];
}



auth.onAuthStateChanged(user=>{
  if(user){
    loginBox.style.display="none";
    adminPanel.style.display="block";
    loadProducts();
  }else{
    adminPanel.style.display="none";
    loginBox.style.display="block";
  }
});


function login(){
 auth.signInWithEmailAndPassword(email.value,password.value)
 .catch(e=>alert(e.message));
}

async function addProduct(){

 let file=image.files[0];
 let imgURL="";

 if(file){
   let formData=new FormData();
   formData.append("file",file);
   formData.append("upload_preset","kirana_upload");

   let upload=await fetch("https://api.cloudinary.com/v1_1/dhpjzcuj3/image/upload",{
     method:"POST",
     body:formData
   });

   let data=await upload.json();
   imgURL=data.secure_url;
 }

 let nepali = await autoNepali(pname.value);

 let product={
  name_en:pname.value,
  name_np:nepali,
  price:parseFloat(price.value),
  category:category.value,
  brand:brand.value,
  sellType:sellType.value,
  featured:true,
  stock:true,
  created:Date.now()
 };

 if(imgURL!="") product.image = imgURL;

 if(editId){
   db.collection("products").doc(editId).update(product);
   alert("✏ Product Updated");
   editId=null;
 }else{
   product.image=imgURL;
   db.collection("products").add(product);
   alert("✅ Product Added");
 }

 clearForm();
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
function clearForm(){
 pname.value="";
 price.value="";
 brand.value="";
 image.value="";
 editId=null;
}


function toggleStock(id,cur){
 db.collection("products").doc(id).update({stock:!cur});
}
async function fixSellTypes(){
  let snap = await db.collection("products").get();

  snap.forEach(doc=>{
    let p = doc.data();
    let newType = p.sellType;

    if(p.sellType === "weight" || p.sellType === "liter"){
      newType = "kg";
    }

    if(newType !== p.sellType){
      db.collection("products").doc(doc.id).update({
        sellType: newType
      });
    }
  });

  alert("All sell types fixed to kg / piece");
}





