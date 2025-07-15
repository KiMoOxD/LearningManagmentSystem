"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // 1. Get isAuthenticated and user from the context as well
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()
  
  // 2. Add a useEffect to handle the redirect
  useEffect(() => {
    // Check if the user is authenticated and has a role
    console.log(user)
    if (isAuthenticated && user?.role) {
      setSuccess("Login successful! Redirecting...")
      if (user.role === "teacher") {
        router.push("/dashboard/teacher")
      } else {
        router.push("/dashboard/student")
      }
    }
  }, [isAuthenticated, user, router]) // Dependencies array

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      await login(formData.email, formData.password)
      // The redirect is handled by the useEffect, so we don't need to do anything here.
      // We also don't set loading to false here, because the component will unmount.
    } catch (err) {
      setError(err.message)
      // Only if there is an error do we need to manually stop the loading state.
      setLoading(false) 
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError("")
    if (success) setSuccess("")
  }

  return (
    // ... rest of your JSX remains the same
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 rounded-lg shadow-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your learning dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-background text-foreground"
                placeholder="Enter your email"
                aria-label="Email input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-background text-foreground pr-12"
                  placeholder="Enter your password"
                  aria-label="Password input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <a href="#" className="text-primary hover:text-primary/80 text-sm transition-colors">
                Forgot your password?
              </a>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">Demo Credentials:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Teacher:</strong> teacher@example.com / teacher123
              </p>
              <p>
                <strong>Student:</strong> student1@example.com / student123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}