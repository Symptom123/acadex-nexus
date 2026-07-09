import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  userName: string | null;
  userStatus: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userName: null,
  userStatus: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role, name and status from Supabase profiles
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role, name, status")
            .eq("id", user.uid)
            .single();

          const activeRole = sessionStorage.getItem("activeRole");
          // sessionStorage adminStatus is set immediately at signup as a fallback
          // before the Supabase column may even be added
          const sessionAdminStatus = sessionStorage.getItem("adminStatus");

          if (data && !error) {
            const resolvedRole = activeRole || data.role || null;
            setUserRole(resolvedRole);
            setUserName(data.name || user.displayName || "Unknown User");

            // Status resolution:
            // 1. Trust the DB value if it exists
            // 2. Fall back to sessionStorage (set at signup time)
            // 3. Admins with no status → pending (must be approved)
            // 4. Non-admins with no status → approved (safe default)
            const dbStatus = data.status;
            const sessionAdminStatus = sessionStorage.getItem("adminStatus");
            const isAdmin = resolvedRole === "admin";
            const resolvedStatus = dbStatus || sessionAdminStatus || (isAdmin ? "pending" : "approved");
            setUserStatus(resolvedStatus);
          } else {
            // Profile fetch failed — use role-aware fallback
            const resolvedRole = activeRole || null;
            const sessionAdminStatus = sessionStorage.getItem("adminStatus");
            const isAdmin = resolvedRole === "admin";
            setUserRole(resolvedRole);
            setUserName(user.displayName || "Unknown User");
            setUserStatus(sessionAdminStatus || (isAdmin ? "pending" : "approved"));
          }
        } catch (error) {
          console.error("Error fetching user data from Supabase:", error);
          const activeRole = sessionStorage.getItem("activeRole");
          const sessionAdminStatus = sessionStorage.getItem("adminStatus");
          const isAdmin = (activeRole || "") === "admin";
          setUserRole(activeRole || null);
          setUserName(user.displayName || "Unknown User");
          setUserStatus(sessionAdminStatus || (isAdmin ? "pending" : "approved"));
        }
      } else {
        setUserRole(null);
        setUserName(null);
        setUserStatus(null);
        // Clear session flags on logout
        sessionStorage.removeItem("adminStatus");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userName,
    userStatus,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
