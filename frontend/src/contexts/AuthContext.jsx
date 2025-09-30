import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const defaultUser = { user_id: null, role: null, username: null };

export const AuthProvider = ({ children }) => {
  // === State user ===
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      return parsed?.user_id && parsed?.role ? parsed : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  // === Sync ke localStorage setiap kali user berubah ===
  useEffect(() => {
    try {
      if (user?.user_id) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch {
      // abaikan error localStorage
    }
  }, [user]);

  // === Derived states ===
  const isLoggedIn = !!user?.user_id;
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";
  const isBuyer = user?.role === "buyer" || user?.role === "user";

  // === Actions ===
  const login = useCallback((userData) => {
    if (userData?.user_id && userData?.role) {
      setUser({
        user_id: userData.user_id,
        role: userData.role,
        username: userData.username || null,
      });
    } else {
      console.warn("Login gagal: data user tidak valid", userData);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(defaultUser);
    localStorage.removeItem("user");
  }, []);

  // === Headers untuk request API ===
  const getAuthHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      "User-Id": user?.user_id || "",
      "User-Role": user?.role || "",
    }),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      isAdmin,
      isSeller,
      isBuyer,
      login,
      logout,
      getAuthHeaders,
    }),
    [
      user,
      isLoggedIn,
      isAdmin,
      isSeller,
      isBuyer,
      login,
      logout,
      getAuthHeaders,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
