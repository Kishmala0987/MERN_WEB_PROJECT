export const API_BASE_URL = "http://localhost:5000/api";

export const api = {
  async signup(userData) {
    try {
      // Convert boolean terms to string 'on' as expected by backend
      const formattedData = {
        ...userData,
        terms: userData.terms ? "on" : "off",
      };
      console.log("Sending request to:", `${API_BASE_URL}/auth/signup`);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();
      console.log("Server response:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        const error = Array.isArray(data.errors)
          ? data.errors[0]
          : "Registration failed";
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.errors) ? data.errors[0] : "Login failed"
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Logout failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async uploadProduct(formData) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/seller/product/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.errors)
            ? data.errors[0]
            : "Failed to upload product"
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async getSellerProducts() {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));  
      if (!token) {
        throw new Error("Authentication token not found");
      }
       if (!user || !user.id) {
      throw new Error('No user data found');
    }

       const response = await fetch(`${API_BASE_URL}/seller/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to fetch seller products");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Get seller products error:", error);
      throw error;
    }
  },
  async deleteProduct(productId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/seller/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Failed to delete product");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async getProductById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch product");
      }

      const data = await response.json();

      // Transform photo URLs to absolute paths
      if (data.product) {
        data.product.photos = data.product.photos.map((photo) =>
          photo.startsWith("http")
            ? photo
            : `${process.env.REACT_APP_API_URL}/uploads/${photo}`
        );
      }

      return data;
    } catch (error) {
      console.error("Get product error:", error);
      throw error;
    }
  },
  async updateProduct(id, formData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/seller/product/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Failed to update product");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async getProducts(queryParams) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/explore?${queryParams}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Failed to fetch products");
      }

      // Ensure all photo URLs are absolute
      data.products = data.products.map((product) => ({
        ...product,
        photos: product.photos.map((photo) =>
          photo.startsWith("http")
            ? photo
            : `${process.env.REACT_APP_API_URL}/uploads/${photo}`
        ),
      }));

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  async addToCart(productId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to cart");
      }

      return data;
    } catch (error) {
      console.error("Add to cart error:", error);
      throw error;
    }
  },

  async removeFromCart(itemId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item from cart");
      }

      return data;
    } catch (error) {
      console.error("Remove from cart error:", error);
      throw error;
    }
  },

  async updateCartQuantity(itemId, quantity) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update quantity");
      }

      return data;
    } catch (error) {
      console.error("Update quantity error:", error);
      throw error;
    }
  },

  async getCartItems() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart items");
      }

      return data;
    } catch (error) {
      console.error("Get cart items error:", error);
      throw error;
    }
  },

  async checkout(cartData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      return data;
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  },
  async getOrders() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      return data;
    } catch (error) {
      console.error("Get orders error:", error);
      throw error;
    }
  },
  cancelOrder: async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel order");
    }

    return data;
  },

  async getRelatedProducts(category, excludeId) {
    try {
      const encodedCategory = encodeURIComponent(category);
      const response = await fetch(
        `${API_BASE_URL}/products/related?category=${encodedCategory}&exclude=${excludeId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch related products");
      }

      const data = await response.json();

      // Transform photo URLs
      if (data.products) {
        data.products = data.products.map((product) => ({
          ...product,
          photos: product.photos.map((photo) =>
            photo.startsWith("http")
              ? photo
              : `${API_BASE_URL}/uploads/${photo}`
          ),
        }));
      }

      return data;
    } catch (error) {
      console.error("Get related products error:", error);
      throw error;
    }
  },
  async getSellers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const response = await fetch(`${API_BASE_URL}/products/sellers`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch sellers");
      }

      return await response.json();
    } catch (error) {
      console.error("Get sellers error:", error);
      throw error;
    }
  },

  async getSellerOrders() {
    console.log('getSellerOrders called in API service'); // Debug log 1
    
    try {
      const token = localStorage.getItem("token");
      console.log('Token found:', !!token); // Debug log 2 (just logs if token exists)

      if (!token) {
        throw new Error("Authentication required");
      }

      console.log('Making fetch request to:', `${API_BASE_URL}/seller/orders`); // Debug log 3
      
      const response = await fetch(`${API_BASE_URL}/seller/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response.status); // Debug log 4
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log 5

      return data;
    } catch (error) {
      console.error("Get seller orders error in API service:", error); // Debug log 6
      throw error;
    }
  },
  async updateOrderStatus(orderId, newStatus) {
    console.log('Updating order:', orderId, 'to status:', newStatus); // Debug log
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      console.log('Update response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      return data;
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  },
};
