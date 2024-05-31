
interface Product {
  id?: string;
  name: string;
  category: string;
  brand: string;
  imageUrl: string;
  description: string;
  price: number;
  quantity?: number;
}

let products: Product[] = [];
let cart: Product[] = JSON.parse(localStorage.getItem('cart') || '[]');
const productsContainer = document.querySelector('.productsContainer') as HTMLElement | null;
const cartContainer = document.querySelector('.cartContainer') as HTMLElement | null;
let cartCountElement = document.querySelector('.cart-count') as HTMLElement;

// Fetch products from the API
const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3000/products');
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    products = await response.json();
    console.log(products);
    renderProducts();
  } catch (error) {
    console.error("Failed to fetch products", error);
  }
};

// Render products in the productsContainer
const renderProducts = () => {
  if (!productsContainer) {
    console.error("Products container not found");
    return;
  }

  productsContainer.innerHTML = ''; // Clear previous content
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" class="card-image">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p>Price: Kshs.${product.price}</p>
      <button class='addToCartBtn cart-btn' data-id='${product.id}'>Add To Cart</button>
    `;
    productsContainer.appendChild(productCard);
  });

  // Add event listeners to the "Add To Cart" buttons
  const addToCartButtons = document.querySelectorAll('.addToCartBtn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });
};

// Add product to cart
const addToCart = (event: Event) => {
  const button = event.target as HTMLButtonElement;
  const productId = button.getAttribute('data-id');
  const product = products.find(p => p.id === productId);

  if (product) {
    const cartProduct = cart.find(p => p.id === productId);
    if (cartProduct) {
      cartProduct.quantity = (cartProduct.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    saveCart();
    renderCartItems();
    console.log('Cart:', cart);
  }
};

// Remove product from cart
const removeCartItem = (productId: string) => {
  const productIndex = cart.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    cart.splice(productIndex, 1);
    updateCartCount();
    saveCart();
    renderCartItems();
    console.log('Cart:', cart);
  }
};

// Render cart items in the cartContainer
const renderCartItems = () => {
  if (!cartContainer) {
    console.error("Cart container not found");
    return;
  }
  cartContainer.innerHTML = ''; // Clear previous content
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    const totalPrice = item.price * (item.quantity || 1);

    cartItem.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" class="cart-image">
      <p style="margin-top:5px;">Price: Kshs. ${item.price}</p>
      <p style="margin-top:5px;">Quantity: ${item.quantity}</p>
      <h2 style="margin-top:5px;">Total Price: Kshs. ${totalPrice}</h2>
      <button class="removeCartItemBtn cart-btn" data-id='${item.id}'>Remove</button>
      <button class="cart-btn">Checkout</button>
    `;
    cartContainer.appendChild(cartItem);
  });

  // Add event listeners to the "Remove" buttons
  const removeCartItemButtons = document.querySelectorAll('.removeCartItemBtn');
  removeCartItemButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const button = event.target as HTMLButtonElement;
      const productId = button.getAttribute('data-id');
      if (productId) {
        removeCartItem(productId);
      }
    });
  });
};

// Update cart count in the header
const updateCartCount = () => {
  if (cartCountElement) {
    const totalQuantity = cart.reduce((sum, product) => sum + (product.quantity || 1), 0);
    cartCountElement.textContent = totalQuantity.toString();
  }
};

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

document.addEventListener('DOMContentLoaded', async () => {
  await fetchProducts();
  updateCartCount();
  renderCartItems();
});