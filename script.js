let products=[],cart=[],selected=null;
let lang ="en";


fetch("products.json").then(r=>r.json()).then(d=>{
 products=d;
 buildCategoryBar();
 showHome();
});

function buildCategoryBar(){
 let cats=[...new Set(products.map(p=>p.category))];
 let html=`<button onclick="showHome()">All</button>`;
 cats.forEach(c=>html+=`<button onclick="showCat('${c}')">${c}</button>`);
 categoryBar.innerHTML=html;
}

function buildCategories(){
 let cats=[...new Set(products.map(p=>p.category))];
 categories.innerHTML="<button onclick='showHome()'>Home</button>";
 cats.forEach(c=>categories.innerHTML+=`<button onclick="showCat('${c}')">${c}</button>`);
}


function showHome(){
 content.innerHTML=`<div class='grid'>${products.filter(p=>p.featured).map(card).join("")}</div>`;
}

function showCat(cat){
 let items=products.filter(p=>p.category==cat);
 let brands=[...new Set(items.map(p=>p.brand))];

 let filter=`<select onchange="filterBrand('${cat}',this.value)">
 <option value="all">All Brands</option>
 ${brands.map(b=>`<option>${b}</option>`).join("")}
 </select>`;

 content.innerHTML=filter+`<div class="grid">${items.map(card).join("")}</div>`;
}

function card(p){
 let name=lang=="en"?p.name_en:p.name_np;
 return `<div class='card'>
 <img src="${p.image}">
 <h4>${name}</h4>
 <p>Rs ${p.price}</p>
 <button onclick="openPopup('${p.id}')">${lang=="en"?"Add":"थप्नुहोस्"}</button>
 </div>`;
}


function openPopup(id){
 selected=products.find(p=>p.id==id);
 popupName.innerText=selected.name_en;
 popupQty.value=selected.sellType=="piece"?1:0.5;
 qtyPopup.classList.remove("hidden");
}

function changePopupQty(d){
 let q=parseFloat(popupQty.value);
 if(selected.sellType=="piece") q+=d;
 else q+=d*0.5;
 if(q>0) popupQty.value=q;
}

function closePopup(){qtyPopup.classList.add("hidden");}

function confirmAdd(){
 let q=parseFloat(popupQty.value);
 let item=cart.find(i=>i.id==selected.id);
 if(item) item.qty+=q;
 else cart.push({...selected,qty:q});
 closePopup();
 updateCart();
 toggleCart();
}

function updateCart(){
 let html="",total=0;
 cart.forEach(c=>{
   let t=c.qty*c.price; total+=t;
   html+=`<div class='cart-item'>${c.name_en} ${c.qty}</div>`;
 });
 cartItems.innerHTML=html;
 cartTotal.innerText=total.toFixed(2);
 cartCount.innerText=cart.length;
}

function toggleCart(){sideCart.classList.toggle("show");}

function orderWhatsApp(){
 let msg="Order from Shrestha Kirana Pasal\n";
 cart.forEach(c=>msg+=`${c.name_en} - ${c.qty}\n`);
 msg+=`Total Rs ${cartTotal.innerText}`;
 window.open("https://wa.me/9779767156270?text="+encodeURIComponent(msg));
}
function orderMessenger(){window.open("https://m.me/61584074571777")}
function orderCall(){window.open("tel:+9779767156270")}
function orderEmail(){window.open("mailto:shresthakiranapasal3@gmail.com")}
function filterBrand(cat,brand){
 let list=products.filter(p=>p.category==cat && (brand=="all"||p.brand==brand));
 content.innerHTML=`<div class="grid">${list.map(card).join("")}</div>`;
}
function toggleLang(){
 lang = lang=="en" ? "np" : "en";
 showHome();
}

