let data=JSON.parse(localStorage.products||"[]");
function add(){
 data.push({name_en:name.value,price:price.value});
 localStorage.products=JSON.stringify(data);
 alert("Saved");
}
