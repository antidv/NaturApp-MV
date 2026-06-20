import StorageService from './storageService';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import EventBus from './eventBus';

// ============================================
// PERSISTENCIA REMOTA - API REST
// Conexión con backend Express/Node.js
// Usa fetch con async/await (asincronía)
// ============================================

const BASE_URL = 'http://192.168.1.18:9090/api';
const REQUEST_TIMEOUT = 15000;
const localOrders = [];

function filterLocalProducts(category) {
  if (!category) return SAMPLE_PRODUCTS;
  return SAMPLE_PRODUCTS.filter(p => p.category === category);
}

function searchLocalProducts(query) {
  const lower = query.toLowerCase();
  return SAMPLE_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower)
  );
}

function createLocalOrder(orderData) {
  const order = {
    id: `local-${localOrders.length + 1}`,
    status: 'created',
    createdAt: new Date().toISOString(),
    ...orderData,
  };
  localOrders.push(order);
  return order;
}

async function fetchWithTimeout(resource, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    return await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAbortError(error) {
  return error && (
    error.name === 'AbortError' ||
    String(error.message).toLowerCase().includes('canceled') ||
    String(error.message).toLowerCase().includes('aborted')
  );
}

// Helper para peticiones HTTP con manejo de errores
async function request(endpoint, options = {}) {
  try {
    const token = await StorageService.getToken();
    const response = await fetchWithTimeout(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && {
            Authorization: `Bearer ${token}`
          }),
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    if (!isAbortError(error)) {
      console.error(`API Error [${endpoint}]:`, error);
    }
    throw error;
  }
}

const ApiService = {
  // === PRODUCTOS (READ) ===
  async getProducts(category = null) {
    const query = category
      ? `?category=${category}` : '';
    try {
      const result = await request(`/products${query}`);
      return Array.isArray(result)
        ? result
        : filterLocalProducts(category);
    } catch (error) {
      return filterLocalProducts(category);
    }
  },

  async getProductById(id) {
    try {
      return await request(`/products/${id}`);
    } catch (error) {
      return SAMPLE_PRODUCTS.find(p => p.id === id) || null;
    }
  },

  async searchProducts(query) {
    try {
      const result = await request(
        `/products/search?q=${encodeURIComponent(query)}`
      );
      return Array.isArray(result)
        ? result
        : searchLocalProducts(query);
    } catch (error) {
      return searchLocalProducts(query);
    }
  },

  // === PRODUCTOS (CRUD completo) ===
  async createProduct(productData) {
    return await request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id, productData) {
    return await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id) {
    return await request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // === PEDIDOS (CRUD completo) ===
  // CREATE: Crear nuevo pedido
  async createOrder(orderData) {
    const localOrder = createLocalOrder(orderData);

    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
      .then(remoteOrder => {
        if (remoteOrder && remoteOrder.id) {
          const index = localOrders.findIndex(
            o => o.id === localOrder.id
          );
          if (index >= 0) {
            localOrders[index] = {
              ...localOrders[index],
              ...remoteOrder,
            };
          } else {
            localOrders.push(remoteOrder);
          }
          EventBus.emit('order:created', localOrders[index] || remoteOrder);
        }
      })
      .catch(error => {
        console.info('Pedido guardado localmente; el envío remoto falló o está desconectado.');
      });

    // Emit immediately so UI can update optimistically
    EventBus.emit('order:created', localOrder);

    return localOrder;
  },

  // READ: Obtener historial de pedidos
  async getOrders() {
    try {
      const remoteOrders = await request('/orders');
      const merged = [...remoteOrders];
      localOrders.forEach(localOrder => {
        if (!merged.some(order => order.id === localOrder.id)) {
          merged.unshift(localOrder);
        }
      });
      return merged;
    } catch (error) {
      return [...localOrders];
    }
  },

  // READ: Detalle de un pedido
  async getOrderById(id) {
    try {
      return await request(`/orders/${id}`);
    } catch (error) {
      return localOrders.find(o => o.id === id) || null;
    }
  },

  // === AUTENTICACIÓN ===
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Guarda token en persistencia básica
    if (data.token) {
      await StorageService.saveToken(data.token);
      await StorageService.saveUserProfile(
        data.user.name, data.user.email
      );
    }
    return data;
  },

  // === CATEGORÍAS ===
  async getCategories() {
    try {
      return await request('/categories');
    } catch (error) {
      return Array.from(new Set(SAMPLE_PRODUCTS.map(p => p.category)));
    }
  },
};

export default ApiService;