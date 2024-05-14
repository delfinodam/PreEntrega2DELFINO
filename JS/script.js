document.addEventListener("DOMContentLoaded", function() {

    const cartToggle = document.getElementById('cart-toggle');
    const cartContainer = document.getElementById('cart-container');
    const cartCount = document.getElementById('cart-count');
    let itemCount = 0;
    let cart = [];

    cartToggle.addEventListener('click', function(event) {
        console.log('Clic en el icono del carrito');
        event.preventDefault();
        cartContainer.classList.toggle('hidden');
    });

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const product = this.dataset.product; 
            const productName = getProductDetails(product).name; 
            const productPrice = getProductDetails(product).price; 
            const existingProductIndex = cart.findIndex(item => item.name === productName);
            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push({ name: productName, price: productPrice, quantity: 1 });
            }
            updateCartUI(cart); 
            updateCartNotification(); 
            saveCartToLocalStorage(); 
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Your item has been added to the cart",
                showConfirmButton: false,
                timer: 1000
            });
        });
    });

    const clearCartBtn = document.getElementById('clear-cart-btn');
    clearCartBtn.addEventListener('click', clearCart);
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', function(event) {
        // Desplazar suavemente hasta la parte de mensajes
        const messagesSection = document.getElementById('contact');
        messagesSection.scrollIntoView({ behavior: 'smooth' });
        const cartDetails = generateCartDetails(); 
        const messageField = document.getElementById('message');
        messageField.value = cartDetails;
    });

    function clearCart() {
        cart = []; 
        updateCartUI(cart); 
        itemCount = 0; 
        updateCartNotification(); 
        saveCartToLocalStorage();
    }

    function getProductDetails(productId) {
        const products = {
            "four": { name: "4GB", price: 10 },
            "ten": { name: "10GB", price: 20 },
            "twenty-five": { name: "15GB", price: 25 },
            "forty": { name: "40GB", price: 40 }
        };
        return products[productId];
    }

    function updateCartNotification() {
        itemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        cartCount.textContent = itemCount;
    }

    function updateCartUI(cart) {
        const cartItemsElement = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
    
        cartItemsElement.innerHTML = '';
    
        cart.forEach(item => {
            const li = document.createElement('li');
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.value = item.quantity || 1;
            quantityInput.min = 1;
            quantityInput.addEventListener('change', function() {
                const newQuantity = parseInt(this.value);
                if (!isNaN(newQuantity) && newQuantity >= 1) {
                    item.quantity = newQuantity;
                    updateCartUI(cart);
                    updateCartNotification();
                    saveCartToLocalStorage();
                } else {
                    this.value = item.quantity || 1;
                }
            });
            const itemPrice = item.price * (item.quantity || 1);
            li.textContent = `${item.name} - Price: ${itemPrice} USD`; 
            li.appendChild(quantityInput);
            cartItemsElement.appendChild(li);
        });
    
        const totalPrice = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
        cartTotalElement.textContent = totalPrice + " USD";
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadJSON(callback) {
        fetch("../data.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => callback(data))
            .catch(error => console.error('Error loading JSON:', error));
    }

    function updateCards(plans) {
        let cards = document.querySelectorAll('.four, .ten, .twenty-five, .forty');
        cards.forEach(function (card, index) {
            let plan = plans[index];
            card.querySelector('.card-title h3').innerText = plan.name;
            card.querySelector('.duration p').innerText = 'Valid for: ' + plan.duration;
            card.querySelector('.cost h5').innerText = plan.cost;
            card.querySelector('.duration img').src = plan.image_duration;

            let includesList = card.querySelector('.includes-list ul');
            includesList.innerHTML = ''; 
            plan.includes.forEach(function (include) {
                let li = document.createElement('li');
                li.innerHTML = include;
                includesList.appendChild(li);
            });

            let whatsappLi = document.createElement('li');
            let whatsappImg = document.createElement('img');
            whatsappImg.src = plan.image_whatsapp;
            whatsappImg.alt = "Whatsapp";
            whatsappLi.appendChild(whatsappImg);
            whatsappLi.innerHTML += "Free messages";
            includesList.appendChild(whatsappLi);

            let socialMediaDiv = document.createElement('div');
            socialMediaDiv.className = 'social-media-icons';

            
            plan.social_media.forEach(function (socialMedia) {
                let socialMediaImg = document.createElement('img');
                socialMediaImg.src = plan["image_" + socialMedia.toLowerCase()];
                socialMediaImg.alt = socialMedia;
                socialMediaDiv.appendChild(socialMediaImg);
            });

            includesList.appendChild(socialMediaDiv);
        });
    }

    function generateCartDetails() {
        let cartDetails = "I want to order:\n";
        cart.forEach(item => {
            cartDetails += `${item.name} - Quantity: ${item.quantity} - Total: ${item.price * item.quantity} USD\n`;
        });
        return cartDetails;
    }

    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
    }

    loadJSON(function (data) {
        updateCards(data.plans);
    });

    updateCartUI(cart); 
    updateCartNotification(); 
});

