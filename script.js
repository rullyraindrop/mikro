let cart = [];
let total = 0;

function addToCart(itemName, price) {
  cart.push({ name: itemName, price: price });
  total += price;

  document.getElementById("cart-count").textContent = cart.length;

  const sidebar = document.getElementById("cart-sidebar");
  sidebar.classList.remove("hidden");

  const itemList = document.getElementById("cart-items");
  itemList.innerHTML = "";
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
    itemList.appendChild(li);
  });

  document.getElementById("total-price").textContent = total.toFixed(2);
}
