"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FaEye, FaEdit, FaUsers } from 'react-icons/fa'
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"

export default function CourseCard({ course, onEdit, userRole }) {
  const isTeacher = userRole === "teacher"

  const cardVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.03 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group bg-card/50 backdrop-blur-lg p-6 rounded-2xl border border-border/20 flex flex-col h-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"/>
      <div className="relative z-10 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 h-20 overflow-hidden text-ellipsis">{course.description}</p>
        </div>

        {isTeacher ? (
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <FaUsers size={16} className="mr-2 text-primary" />
            <span>{course.studentCount || 0} students</span>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span className="font-semibold text-foreground">{Math.round(course.progress) || 0}%</span>
            </div>
            <Progress value={course.progress || 0} className="h-2" />
          </div>
        )}

        <div className="flex space-x-3 mt-auto pt-4">
          <Button asChild className="flex-1" variant="outline">
            <Link
              href={`/dashboard/${userRole}/courses/${course.id}`}
            >
              <FaEye className="mr-2 h-4 w-4"/>
              <span>View Course</span>
            </Link>
          </Button>
          {isTeacher && (
            <Button
              onClick={onEdit}
              variant="secondary"
              aria-label={`Edit ${course.title}`}
            >
              <FaEdit className="mr-2 h-4 w-4"/>
              <span>Edit</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
