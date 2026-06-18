import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  userName: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userName: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role and name from Supabase profiles
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role, name")
            .eq("id", user.uid)
            .single();

          const activeRole = sessionStorage.getItem("activeRole");

          if (data && !error) {
            setUserRole(activeRole || data.role || null);
            setUserName(data.name || user.displayName || "Unknown User");
          } else {
            // Check if profile doesn't exist, we will let signup/login create it, but set a fallback here
            setUserRole(activeRole || null);
            setUserName(user.displayName || "Unknown User");
          }
        } catch (error) {
          console.error("Error fetching user data from Supabase:", error);
          const activeRole = sessionStorage.getItem("activeRole");
          setUserRole(activeRole || null);
          setUserName(user.displayName || "Unknown User");
        }
      } else {
        setUserRole(null);
        setUserName(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userName,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
