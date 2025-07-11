let cart = [];
let total = 0;

function addToCart(itemName, price) {
  cart.push({ name: itemName, price: price });
  total += price;

  document.getElementById("cart-count").textContent = cart.length;

  const sidebar = document.getElementById("cart-sidebar");
  if (sidebar) sidebar.classList.remove("hidden");

  const itemList = document.getElementById("cart-items");
  if (itemList) {
    itemList.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
      itemList.appendChild(li);
    });
  }

  const totalPrice = document.getElementById("total-price");
  if (totalPrice) {
    totalPrice.textContent = total.toFixed(2);
  }
}

// AUTHENTICATION FUNCTIONS

function toggleAuth() {
  const modal = document.getElementById("authModal");
  modal.style.display = modal.style.display === "none" ? "flex" : "none";
}

function register() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  if (!email.includes("@") || !email.includes(".")) {
    alert("Please enter a valid email address.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(user => {
      user.user.sendEmailVerification();
      alert("Verification email sent!");
    })
    .catch(error => alert(error.message));
}


function login() {
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Login successful"))
    .catch(error => alert(error.message));
}

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => alert("Google login success"))
    .catch(error => alert(error.message));
}
