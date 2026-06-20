import { useState, useEffect, useCallback } from 'react';
import DatabaseService from '../services/databaseService';
import ApiService from '../services/apiService';
import { CartItem } from '../models/CartItem';

// ============================================
// VIEWMODEL: Gestiona lógica del carrito
// Conecta View con SQLite (local) y API (remoto)
// ============================================
export function useCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await DatabaseService.getCartItems();
      const loadedItems = rows.map(r => CartItem.fromRow(r));
      setItems(loadedItems);
      const totalValue = loadedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const countValue = loadedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setTotal(totalValue);
      setCount(countValue);
    } finally {
      setLoading(false);
    }
  }, []);

  // AGREGAR producto (validación + persistencia)
  const addItem = useCallback(async (product) => {
    // VALIDACIÓN: Lógica de negocio
    if (!product.isAvailable()) {
      throw new Error('Producto sin stock');
    }
    await DatabaseService.addToCart(product);

    const existing = items.find(i => i.productId === product.id);
    const updatedItems = existing
      ? items.map(i => i.productId === product.id
          ? new CartItem({
              ...i,
              quantity: i.quantity + 1,
            })
          : i)
      : [new CartItem({
          id: null,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        }),
        ...items];

    const totalValue = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const countValue = updatedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    setItems(updatedItems);
    setTotal(totalValue);
    setCount(countValue);
  }, [items]);

  // ACTUALIZAR cantidad
  const updateQuantity = useCallback(
    async (productId, qty) => {
      // VALIDACIÓN: no permitir negativos
      if (qty < 0) return;
      await DatabaseService.updateCartQuantity(
        productId, qty
      );

      const updatedItems = items
        .map(i => i.productId === productId
          ? new CartItem({ ...i, quantity: qty })
          : i)
        .filter(i => i.quantity > 0);

      const totalValue = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const countValue = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setItems(updatedItems);
      setTotal(totalValue);
      setCount(countValue);
    }, [items]
  );

  // ELIMINAR item
  const removeItem = useCallback(
    async (productId) => {
      await DatabaseService.removeFromCart(productId);

      const updatedItems = items.filter(
        i => i.productId !== productId
      );
      const totalValue = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const countValue = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setItems(updatedItems);
      setTotal(totalValue);
      setCount(countValue);
    }, [items]
  );

  // CHECKOUT: Envía pedido a la API remota
  const checkout = useCallback(
    async (address) => {
      // VALIDACIÓN
      if (items.length === 0) {
        throw new Error('El carrito está vacío');
      }
      if (!address.trim()) {
        throw new Error('Ingrese una dirección');
      }
      // Enviar a API remota (persistencia remota)
      const order = await ApiService.createOrder({
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total,
        address,
      });
      // Limpiar carrito local (SQLite)
      await DatabaseService.clearCart();
      setItems([]);
      setTotal(0);
      setCount(0);
      return order;
    }, [items, total]
  );

  useEffect(() => {
    DatabaseService.init().then(loadCart);
  }, [loadCart]);

  return {
    items, total, count, loading,
    addItem, updateQuantity, removeItem,
    checkout, refresh: loadCart,
  };
}