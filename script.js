let products=[],cart=[],selected=null,currentCategory=null;

// 🔥 Load products from Firebase
db.collection("products").onSnapshot(snapshot=>{
  products = [];
  snapshot.forEach(doc=>{
    let p = doc.data();
    p.id = doc.id;

    if(p.stock !== false){   // hide out of stock
      products.push(p);
    }
  });

  buildCategoryBar();
  showHome();
});


let lang ="en";


function buildCategoryBar(){
 let cats=[...new Set(products.map(p=>p.category))];

 let html = `<button onclick="showHome()">All</button>`;

 cats.forEach(c=>{
   html += `<button onclick="showCat('${c}')">${c}</button>`;
 });

 document.getElementById("categoryBar").innerHTML = html;
}



function showHome(){
  currentCategory = null;
  content.innerHTML = `<div class='grid'>${products.filter(p=>p.featured).map(card).join("")}</div>`;
}



function showCat(cat){
currentCategory = cat;
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
popupName.innerText = lang=="en" ? selected.name_en : selected.name_np;
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
    let q = parseFloat(popupQty.value);

    let item = cart.find(i=>i.id==selected.id);
    if(item) item.qty += q;
    else cart.push({...selected,qty:q});

    closePopup();
    updateCart();

    // Show cart briefly
    sideCart.classList.add("show");
    setTimeout(()=>{
        sideCart.classList.remove("show");
    }, 1200);
}


function updateCart(){
 let box=document.getElementById("cartItems");
 let totalBox=document.getElementById("cartTotal");

 if(cart.length===0){
   box.innerHTML="No items yet";
   totalBox.innerHTML="0";
   return;
 }

 let html="", total=0;

 cart.forEach((i,index)=>{
   let name = lang=="en" ? i.name_en : i.name_np;
   let sub = i.price * i.qty;
   total += sub;

   html += `
   <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
     <span>${name} x ${i.qty} = Rs ${sub}</span>
     <button onclick="removeItem(${index})" title="Remove">🗑</button>

   </div>`;
 });

 box.innerHTML = html;
 totalBox.innerText = total;
}


function removeItem(i){
 cart.splice(i,1);
 updateCart();
}


function toggleCart(){
  sideCart.classList.toggle("show");
}

function sendOrder(platform){
    if(cart.length===0){
        alert(lang==="np"?"कार्ट खाली छ":"Cart is empty");
        return;
    }

    let note = document.getElementById("noteBox").value || "No note";


    let msg = "🛒 New Order / नयाँ अर्डर%0A%0A";
    let grand = 0;

    cart.forEach(i=>{
        let total = i.price * i.qty;
        grand += total;
        let pname = lang=="en" ? i.name_en : i.name_np;
msg += `${pname} x ${i.qty} = Rs ${total}%0A`;

    });

    msg += `%0A💰 Grand Total / कुल जम्मा: Rs ${grand}`;
    msg += `%0A📝 Note: ${note}`;

    msg += `%0Aकृपया अर्डर पुष्टि गर्नुहोस्।`;

  firebase.firestore().collection("orders").add({
  items: cart.map(i => (lang=="en"?i.name_en:i.name_np) + " x " + i.qty).join(", "),
  total: grand,
  time: Date.now(),
  platform: platform
});


    if(platform==="wa"){
        window.open("https://wa.me/9779767156270?text="+msg,"_blank");
    }
    if(platform==="ms"){
        window.open("https://m.me/100077109782734?ref="+encodeURIComponent(msg),"_blank");

    }
}


function orderWhatsApp(){
    sendOrder("wa");
}


function orderMessenger(){
    sendOrder("ms");
}




function orderCall(){
  window.open("tel:+9779767156270")
}


function orderEmail(){
window.open("mailto:shresthakiranapasal3@gmail.com")
}


function filterBrand(cat,brand){
 let list=products.filter(p=>p.category==cat && (brand=="all"||p.brand==brand));
 content.innerHTML=`<div class="grid">${list.map(card).join("")}</div>`;
}




function toggleLang(){
  lang = lang=="en" ? "np" : "en";

  // Re-render current view
  if(currentCategory){
    showCat(currentCategory);
  }else{
    showHome();
  }

  updateCart();
}







