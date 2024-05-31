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
      <button style="background-color:slateblue;border:none;padding:1rem 2rem">Add To Cart<button>
    `;
    productsContainer.appendChild(productCard);
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
    console.log('Cart:', cart);
  }
};

// Update cart count in the header
const updateCartCount = () => {
  const totalQuantity = cart.reduce((sum, product) => sum + (product.quantity || 1), 0);
  cartCountElement.textContent = totalQuantity.toString();
};

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

document.addEventListener('DOMContentLoaded', async () => {
  await fetchProducts();
  updateCartCount();
});
