"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState(null)
  const router = useRouter()

  // Function to fetch user data (e.g., on initial load)
  // This could be from a session cookie or a "me" endpoint
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Example: check a "me" endpoint to see if a session exists
        const response = await fetch("/api/auth/me") // You might need to create this
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in")
      }

      setUser(data.user)
      setError(null)

      // Let the login page handle the redirect based on the role
      // This makes the context more reusable
    } catch (err) {
      setError(err.message)
      // Re-throw the error to be caught by the form handler
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ name, email, password, role }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // The API returns an `error` field on failure
        throw new Error(data.error || "Failed to register");
      }
      
      // The register function will no longer log the user in.
      // It just creates the account. The user will be redirected
      // to the login page by the form itself.
      
    } catch (err) {
      // Re-throw the error to be caught by the form handler
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}