"use client";

import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  Bell,
  Star,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Student",
    quote:
      "This LMS made learning fun and easy! The quizzes and progress tracking kept me motivated.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Mr. Lee",
    role: "Teacher",
    quote:
      "Managing my classes and sharing resources has never been smoother. My students love it!",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Ava R.",
    role: "Parent",
    quote:
      "I can finally see how my child is progressing in real time. Highly recommended!",
    avatar: "/placeholder-user.jpg",
  },
];

export default function HomePage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [dark, setDark] = useState(false);

  const next = () =>
    setTestimonialIdx((i) => (i + 1 + testimonials.length) % testimonials.length);
  const prev = () =>
    setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  /* auto-rotate */
  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-colors duration-500",
        dark ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Aurora background */}
      <div
        className={cn(
          "fixed inset-0 -z-10 pointer-events-none",
          "bg-[linear-gradient(to_right,#0ea5e9_0%,#0ea5e9_20%,transparent_20%,transparent_80%,#0ea5e9_80%,#0ea5e9_100%)] opacity-5 blur-3xl"
        )}
      />

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-20 backdrop-blur-xl",
          "border-b",
          dark ? "border-gray-800 bg-black/60" : "border-gray-200 bg-white/60"
        )}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Dr. Johnson’s LMS
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-32">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-extrabold text-center leading-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Elevate
          </span>{" "}
          Your Learning
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={cn(
            "max-w-2xl mx-auto text-xl text-center mt-6",
            dark ? "text-gray-400" : "text-gray-600"
          )}
        >
          A premium, modern LMS for students, teachers, and parents—re-imagined
          in black & blue.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            asChild
          >
            <Link href="/register">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Explore Features</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl font-extrabold text-center mb-16">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <BookOpen />, title: "Access Lectures" },
              { icon: <Award />, title: "Take Quizzes" },
              { icon: <Users />, title: "Track Progress" },
              { icon: <Bell />, title: "Stay Updated" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "p-8 rounded-2xl flex flex-col items-center gap-4 cursor-pointer",
                  "border",
                  dark
                    ? "border-gray-800 bg-gray-900/40 hover:bg-gray-900/60"
                    : "border-gray-200 bg-white/40 hover:bg-white/60"
                )}
              >
                <div className="h-16 w-16 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                  {f.icon}
                </div>
                <h4 className="text-lg font-semibold">{f.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl font-extrabold text-center mb-16">
            What Our Users Say
          </h3>
          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "p-10 rounded-2xl shadow-xl flex flex-col items-center text-center",
                  dark
                    ? "bg-gray-900/60 border border-gray-800"
                    : "bg-white/60 border border-gray-200"
                )}
              >
                <img
                  src={testimonials[testimonialIdx].avatar}
                  alt={testimonials[testimonialIdx].name}
                  className="w-20 h-20 rounded-full border-2 border-blue-500 mb-4"
                />
                <p className="text-lg italic mb-4">
                  “{testimonials[testimonialIdx].quote}”
                </p>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="font-bold text-blue-600">
                  {testimonials[testimonialIdx].name}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonials[testimonialIdx].role}
                </div>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto mb-24 text-center"
      >
        <Button
          size="xl"
          className="shadow-2xl bg-blue-600 text-white hover:bg-blue-700"
          asChild
        >
          <Link href="/register">Start Learning For Free</Link>
        </Button>
      </motion.div>

      {/* Footer */}
      <footer
        className={cn(
          "border-t",
          dark ? "border-gray-800 bg-black/50" : "border-gray-200 bg-white/50"
        )}
      >
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-500">
            © 2025 Dr. Johnson’s LMS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-blue-600">
              About
            </Link>
            <Link href="#" className="text-gray-500 hover:text-blue-600">
              Contact
            </Link>
            <Link href="#" className="text-gray-500 hover:text-blue-600">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- utilities ---------- */
const cn = (...classes) => classes.filter(Boolean).join(" ");