"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  FileQuestion,
  BarChart3,
  Award
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

const NavLink = ({ item, isCollapsed, isActive }) => (
  <Link href={item.href}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200
        ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
      `}
    >
      <item.icon className={`h-6 w-6 ${!isCollapsed ? "mr-4" : ""}`} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="font-medium whitespace-nowrap"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  </Link>
);

export default function PremiumSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const [isCollapsed, setIsCollapsed] = useState(isDesktop ? false : true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsCollapsed(!isDesktop);
    if(isDesktop) {
        setIsMobileMenuOpen(false);
    }
  }, [isDesktop]);

  const teacherNavItems = [
    { name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    // Assuming a generic quizzes and grades link for the teacher. 
    // The prompt suggests it might be per-course, which would require a different navigation structure.
    // This implementation provides a general entry point.
    { name: "Quizzes", href: "/dashboard/teacher/quizzes", icon: FileQuestion },
    { name: "Grades", href: "/dashboard/teacher/grades", icon: BarChart3 },
    { name: "Students", href: "/dashboard/teacher/students", icon: Users },
  ];
  
  const studentNavItems = [
    { name: "My Courses", href: "/dashboard/student", icon: BookOpen },
    { name: "My Quizzes", href: "/dashboard/student/quizzes", icon: FileQuestion },
    { name: "My Grades", href: "/dashboard/student/grades", icon: Award },
  ];

  const navItems = user?.role === "teacher" ? teacherNavItems : studentNavItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/70 backdrop-blur-xl border-r border-border/20">
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-border/20`}>
        <AnimatePresence>
        {!isCollapsed && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: {duration: 0.2} }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center gap-2"
            >
                <GraduationCap className="text-primary h-8 w-8" />
                <span className="text-lg font-bold text-foreground">LMS</span>
            </motion.div>
        )}
        </AnimatePresence>
        
        {isDesktop && (
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border/20">
        <div
          onClick={logout}
          className="flex items-center p-3 rounded-lg cursor-pointer text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className={`h-6 w-6 ${!isCollapsed ? "mr-4" : ""}`} />
           <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
  
  if (!isDesktop) {
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 bg-card/50 backdrop-blur-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-30"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-64 z-40"
              >
                <SidebarContent />
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-[-48px] z-40 bg-card/50 backdrop-blur-lg"
                  >
                    <X className="h-6 w-6" />
                  </Button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative hidden md:block"
    >
        <SidebarContent />
    </motion.aside>
  );
}
