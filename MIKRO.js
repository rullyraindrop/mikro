document.addEventListener('DOMContentLoaded', function() {
    // Cart functionality
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    let cart = [];
    
    // Open/close cart
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    // Add to cart
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.parentElement;
            const title = product.querySelector('h3').textContent;
            const price = product.querySelector('p').textContent;
            const imgSrc = product.querySelector('img').src;
            
            addItemToCart(title, price, imgSrc);
            updateCart();
        });
    });
    
    function addItemToCart(title, price, imgSrc) {
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.title === title);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                title,
                price,
                imgSrc,
                quantity: 1
            });
        }
    }
    
    function updateCart() {
        // Clear cart display
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        
        // Add each item to cart display
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            
            cartItemElement.innerHTML = `
                <img src="${item.imgSrc}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price} x ${item.quantity}</div>
                    <div class="remove-item">Remove</div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
            
            // Calculate total
            const priceNumber = parseFloat(item.price.replace('$', ''));
            total += priceNumber * item.quantity;
            
            // Add remove functionality
            const removeButton = cartItemElement.querySelector('.remove-item');
            removeButton.addEventListener('click', () => {
                removeItemFromCart(item.title);
            });
        });
        
        // Update total and count
        cartTotal.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    function removeItemFromCart(title) {
        cart = cart.filter(item => item.title !== title);
        updateCart();
    }
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
        } else {
            alert(`Order placed! Total: $${cartTotal.textContent.split('$')[1]}`);
            cart = [];
            updateCart();
        }
    });
});