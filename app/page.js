import Link from "next/link";
import { BookOpen, Users, Award, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dr. Johnson's LMS</h1>
          <nav>
            <Link href="/login" className="text-gray-300 hover:text-white px-4">Log In</Link>
            <Link href="/register" className="text-gray-300 hover:text-white px-4">Register</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-5xl font-extrabold text-black mb-4">
            A Modern Learning Experience
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience a seamless and intuitive learning management system designed for the future of education.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-800">Everything You Need to Succeed</h3>
            <p className="text-lg text-gray-500 mt-2">All the tools you need, in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-10 h-10 text-gray-800" />}
              title="Access Lectures"
              description="View and download course materials, lecture notes, and resources anytime, anywhere."
            />
            <FeatureCard
              icon={<Award className="w-10 h-10 text-gray-800" />}
              title="Take Quizzes"
              description="Test your knowledge with interactive quizzes and receive instant feedback on your performance."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-gray-800" />}
              title="Track Progress"
              description="Monitor your learning journey with detailed progress tracking and grade reports."
            />
            <FeatureCard
              icon={<Bell className="w-10 h-10 text-gray-800" />}
              title="Stay Updated"
              description="Receive important announcements and updates from your instructor in real-time."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-24 text-center">
          <h3 className="text-4xl font-bold text-black mb-4">Ready to Start Learning?</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our learning community and take your education to the next level.
          </p>
          <Button asChild size="lg">
            <Link href="/register">Sign Up For Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">© 2025 Dr. Johnson's LMS. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out">
    <div className="flex items-center justify-center h-16 w-16 bg-gray-100 rounded-full mb-6">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-500">{description}</p>
  </div>
);
