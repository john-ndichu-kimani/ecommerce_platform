interface Product {
  id?: string;
  name: string;
  category: string;
  brand: string;
  imageUrl: string;
  description: string;
  price: number;
}

class APIService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async postProduct(product: Product): Promise<void> {
    const response = await fetch(`${this.apiUrl}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error("Failed to post product");
    }
  }

  async fetchProducts(): Promise<Product[]> {
    const response = await fetch(`${this.apiUrl}/products`);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data;
  }

  async fetchProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.apiUrl}/products/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const data = await response.json();
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product with id ${id}`);
    }
  }

  async updateProduct(
    productId: string,
    updatedFields: Partial<Product>
  ): Promise<void> {
    const response = await fetch(`${this.apiUrl}/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product with id ${productId}`);
    }
  }
}

class ProductsManager {
  private productsContainer: HTMLElement;
  private apiService: APIService;
  private products: Product[] = [];
  currentProductId: string | null = null;

  constructor(productsContainer: HTMLElement, apiService: APIService) {
    this.apiService = apiService;
    this.productsContainer = productsContainer;
  }

  async addProduct(product: Product): Promise<void> {
    await this.apiService.postProduct(product);
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.products = await this.apiService.fetchProducts();
     this.renderProducts();
  }

  async loadSingleProduct(id: string): Promise<void> {
    await this.apiService.fetchProduct(id);
    window.location.href = `/frontend/product.html?id=${id}`;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.apiService.deleteProduct(id);
    await this.loadProducts();
  }

  async updateProduct(
    productId: string,
    updatedFields: Partial<Product>
  ): Promise<void> {
    await this.apiService.updateProduct(productId, updatedFields);
    await this.loadProducts();
  }

  private renderProducts(): void {
    const productsTable = this.productsContainer.querySelector(".productsTable") as HTMLTableElement;
    productsTable.innerHTML = `
      <tr>
        <th>Product ID</th>
        <th>Name</th>
        <th>Category</th>
        <th>Brand</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    `;

    this.products.forEach((product) => {
      const productRow = document.createElement("tr");
      productRow.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.brand}</td>
        <td>kshs.${product.price}</td>
        <td>
          <button class="view-btn" data-id="${product.id}"><ion-icon name="eye-outline"></ion-icon></button>
          <button class="edit-btn" data-id="${product.id}"><ion-icon name="create-outline"></ion-icon></button>
          <button class="delete-btn" data-id="${product.id}"><ion-icon name="trash-outline"></ion-icon></button>
        </td>
      `;

      productsTable.appendChild(productRow);

      const viewButton = productRow.querySelector(
        ".view-btn"
      ) as HTMLButtonElement;
      const editButton = productRow.querySelector(
        ".edit-btn"
      ) as HTMLButtonElement;
      const deleteButton = productRow.querySelector(
        ".delete-btn"
      ) as HTMLButtonElement;

      viewButton.addEventListener("click", () => {
        this.loadSingleProduct(product.id!);

        
      });

      editButton.addEventListener("click", () => {
        this.openEditModal(product);
      });

      deleteButton.addEventListener("click", () => {
        this.deleteProduct(product.id!);
      });
    });
  }

  private openEditModal(product: Product): void {
    const modalOverlay = document.querySelector(
      ".modal-overlay"
    ) as HTMLDivElement;
    const nameTxt = document.getElementById("nameInput") as HTMLInputElement;
    const categoryTxt = document.getElementById(
      "categoryInput"
    ) as HTMLInputElement;
    const brandTxt = document.getElementById("brandInput") as HTMLInputElement;
    const descriptionTxt = document.getElementById(
      "descriptionInput"
    ) as HTMLTextAreaElement;
    const priceTxt = document.getElementById("priceInput") as HTMLInputElement;
    const imageTxt = document.getElementById("imageInput") as HTMLInputElement;
    const productForm = document.querySelector(
      ".product-form"
    ) as HTMLFormElement;

    nameTxt.value = product.name;
    categoryTxt.value = product.category;
    brandTxt.value = product.brand;
    descriptionTxt.value = product.description;
    priceTxt.value = product.price.toString();
    imageTxt.value = product.imageUrl;

    modalOverlay.style.display = "block";
    this.currentProductId = product.id!;

    productForm.onsubmit = async (e) => {
      e.preventDefault();

      const updatedProduct: Product = {
        id: product.id,
        name: nameTxt.value.trim(),
        category: categoryTxt.value.trim(),
        brand: brandTxt.value.trim(),
        description: descriptionTxt.value.trim(),
        price: parseFloat(priceTxt.value.trim()),
        imageUrl: imageTxt.value.trim(),
      };

      await this.updateProduct(product.id!, updatedProduct);
      modalOverlay.style.display = "none";
      this.currentProductId = null;
    };

    const closeBtn = document.querySelector(".close-icon") as HTMLSpanElement;
    closeBtn.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      this.currentProductId = null;
    });
  }
}

document.addEventListener("DOMContentLoaded" , async () => {

  const apiUrl = "http://localhost:3000";
  const apiService = new APIService(apiUrl);


  const productsContainer = document.querySelector(".productsContainer") as HTMLElement;
  const productDetailsContainer = document.getElementById("product-details") as HTMLElement;

  
  const productManager = new ProductsManager(productsContainer, apiService);

  // Check if the URL contains a product ID
  const urlParams = new URLSearchParams(window.location.search);
  const productId = (urlParams.get("id"));

  if (productId) {
    // Fetch and display the single product
    try {
      const product = await apiService.fetchProduct(productId);
      displayProductDetails(product);

    } catch (error) {
      console.error("Error fetching product details:", error);
      displayErrorMessage("Failed to load product details.");
    }
  } else {
    // Load and display all products
    productManager.loadProducts();
  }

  const modalOverlay = document.querySelector(
    ".modal-overlay"
  ) as HTMLDivElement;
  const productForm = document.querySelector(
    ".product-form"
  ) as HTMLFormElement;
  
  const addBtn = document.querySelector(".add-icon") as HTMLButtonElement;
  const closeBtn = document.querySelector(".close-icon") as HTMLSpanElement;

  addBtn.addEventListener("click", () => {
    modalOverlay.style.display = "block";
    productManager.currentProductId = null;
  });

  closeBtn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
    productManager.currentProductId = null;
  });

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameTxt = document.getElementById("nameInput") as HTMLInputElement;
    const categoryTxt = document.getElementById(
      "categoryInput"
    ) as HTMLInputElement;
    const brandTxt = document.getElementById("brandInput") as HTMLInputElement;
    const descriptionTxt = document.getElementById(
      "descriptionInput"
    ) as HTMLTextAreaElement;
    const priceTxt = document.getElementById("priceInput") as HTMLInputElement;
    const imageTxt = document.getElementById("imageInput") as HTMLInputElement;

    const product: Product = {
      name: nameTxt.value.trim(),
      category: categoryTxt.value.trim(),
      brand: brandTxt.value.trim(),
      description: descriptionTxt.value.trim(),
      price: parseFloat(priceTxt.value.trim()),
      imageUrl: imageTxt.value.trim(),
    };

    if (productManager.currentProductId) {
      // Update existing product
      await productManager.updateProduct(
        productManager.currentProductId,
        product
      );
    } else {
      // Add new product
      await productManager.addProduct(product);
    }

    productForm.reset();
    modalOverlay.style.display = "none";

    // Reload the page to reflect the changes
    window.location.reload();
  });


  function displayProductDetails(product: Product): void {
    if (productDetailsContainer) {
      productDetailsContainer.innerHTML = `
      
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        <div class='details'>
        <h3 style="color:blueviolet; font-size:30px">${product.name}</h3>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Brand:</strong> ${product.brand}</p>
        <p><strong>Price:</strong> kshs.${product.price}</p>
        <p> ${product.description}</p>
        </div> 
      `;
    }


  }

  function displayErrorMessage(message: string): void {
    if (productDetailsContainer) {
      productDetailsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

    function goBack() {
   window.location.href='http://127.0.0.1:5500/frontend/products.html'
    }

  
});
