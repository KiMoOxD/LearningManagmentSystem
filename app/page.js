"use client";

import Link from "next/link";
import { BookOpen, Users, Award, Bell, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Student",
    quote: "This LMS made learning fun and easy! The quizzes and progress tracking kept me motivated.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Mr. Lee",
    role: "Teacher",
    quote: "Managing my classes and sharing resources has never been smoother. My students love it!",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Ava R.",
    role: "Parent",
    quote: "I can finally see how my child is progressing in real time. Highly recommended!",
    avatar: "/placeholder-user.jpg",
  },
];

export default function HomePage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-purple-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg">Dr. Johnson's LMS</h1>
          <nav className="space-x-2">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/register">Register</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-purple-500/40 to-pink-400/30 blur-2xl opacity-60 pointer-events-none" />
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-purple-700 to-pink-600 mb-6 drop-shadow-xl animate-fade-in">
            Elevate Your Learning Journey
          </h2>
          <p className="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto animate-fade-in delay-100">
            A premium, modern LMS for students, teachers, and parents. Experience seamless learning, real-time progress, and engaging content—all in one place.
          </p>
          <div className="flex justify-center gap-6 animate-fade-in delay-200">
            <Button asChild size="xl" className="text-lg px-8 py-4 shadow-lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="xl" variant="secondary" className="text-lg px-8 py-4 shadow-lg">
              <Link href="/login">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">Why Choose Us?</h3>
            <p className="text-lg text-gray-500">A next-generation platform for next-generation learners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <FeatureCard
              icon={<BookOpen className="w-12 h-12 text-blue-700 animate-bounce" />}
              title="Access Lectures"
              description="View and download course materials, lecture notes, and resources anytime, anywhere."
            />
            <FeatureCard
              icon={<Award className="w-12 h-12 text-yellow-500 animate-pulse" />}
              title="Take Quizzes"
              description="Test your knowledge with interactive quizzes and receive instant feedback on your performance."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-purple-700 animate-bounce" />}
              title="Track Progress"
              description="Monitor your learning journey with detailed progress tracking and grade reports."
            />
            <FeatureCard
              icon={<Bell className="w-12 h-12 text-pink-500 animate-pulse" />}
              title="Stay Updated"
              description="Receive important announcements and updates from your instructor in real-time."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-purple-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-extrabold text-gray-800 mb-4">What Our Users Say</h3>
            <p className="text-lg text-gray-500">Real stories from our learning community.</p>
          </div>
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-10 flex flex-col items-center relative">
            <img
              src={testimonials[testimonialIdx].avatar}
              alt={testimonials[testimonialIdx].name}
              className="w-20 h-20 rounded-full border-4 border-blue-200 shadow-lg mb-4 object-cover"
            />
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <blockquote className="text-xl italic text-gray-700 mb-4">“{testimonials[testimonialIdx].quote}”</blockquote>
            <div className="font-bold text-blue-800">{testimonials[testimonialIdx].name}</div>
            <div className="text-sm text-gray-500 mb-2">{testimonials[testimonialIdx].role}</div>
            <div className="flex gap-2 mt-4">
              <Button size="icon" variant="ghost" onClick={prevTestimonial} aria-label="Previous testimonial">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Button>
              <Button size="icon" variant="ghost" onClick={nextTestimonial} aria-label="Next testimonial">
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 py-24">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">Ready to Start Learning?</h3>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our learning community and take your education to the next level.
          </p>
          <Button asChild size="xl" className="text-lg px-10 py-4 bg-white text-blue-700 font-bold shadow-xl hover:bg-blue-50">
            <Link href="/register">Sign Up For Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-purple-800 text-white mt-auto">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-300">© 2025 Dr. Johnson's LMS. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center text-center border border-blue-100">
    <div className="flex items-center justify-center h-20 w-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full mb-6 shadow-md">
      {icon}
    </div>
    <h4 className="text-2xl font-bold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-500 text-lg">{description}</p>
  </div>
);
