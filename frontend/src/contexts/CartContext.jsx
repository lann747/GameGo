import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cartItems");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Simpan perubahan cart ke localStorage
  useEffect(() => {
    try {
      if (cartItems.length) {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
      } else {
        localStorage.removeItem("cartItems");
      }
    } catch {
      // abaikan error localStorage
    }
  }, [cartItems]);

  // Tambah item
  const addToCart = useCallback((game) => {
    if (!game?.id) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === game.id);

      if (existing) {
        return prev.map((item) =>
          item.id === game.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  item.maxStock ?? Infinity
                ),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: game.id,
          title: game.title ?? "Unknown Item",
          price: Number(game.price) || 0,
          quantity: 1,
          maxStock: game.stock ?? Infinity,
        },
      ];
    });
  }, []);

  // Update jumlah item
  const updateQuantity = useCallback((id, quantity) => {
    setCartItems((prev) => {
      const q = parseInt(quantity, 10);
      if (isNaN(q) || q <= 0) return prev.filter((i) => i.id !== id);

      return prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.min(q, i.maxStock ?? Infinity) }
          : i
      );
    });
  }, []);

  // Hapus item
  const removeItem = useCallback(
    (id) => setCartItems((prev) => prev.filter((i) => i.id !== id)),
    []
  );

  // Kosongkan keranjang
  const clearCart = useCallback(() => setCartItems([]), []);

  // Derived states
  const { totalAmount, itemCount } = useMemo(() => {
    const total = cartItems.reduce(
      (acc, i) => acc + (i.price || 0) * (i.quantity || 0),
      0
    );
    const count = cartItems.reduce((acc, i) => acc + (i.quantity || 0), 0);
    return { totalAmount: total, itemCount: count };
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      totalAmount,
      itemCount,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      cartItems,
      totalAmount,
      itemCount,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
