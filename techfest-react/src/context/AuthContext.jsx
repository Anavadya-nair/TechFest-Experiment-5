
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check whether the user is already logged in
    useEffect(() => {
        async function checkLogin() {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkLogin();
    }, []);

    // Update user after successful login
    const login = (userData) => {
        setUser(userData);
    };

    // Logout user
    const logout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout error:", error);
        }

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
                isLoggedIn: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
