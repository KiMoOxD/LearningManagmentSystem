"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes } from "react-icons/fa"

export default function CreateEditCourseModal({ isOpen, course, onClose, onSave }) {
  const [formData, setFormData] = useState({ title: "", description: "" })

  useEffect(() => {
    if (isOpen) {
      if (course) {
        setFormData({ title: course.title, description: course.description })
      } else {
        setFormData({ title: "", description: "" })
      }
    }
  }, [isOpen, course])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...formData })
    onClose()
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gray-800/50 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-2"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {course ? "Edit Course" : "Create New Course"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/5"
                  placeholder="e.g., Introduction to Astrophysics"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Course Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/5"
                  placeholder="A brief, engaging description of what students will learn."
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-[0_4px_14px_rgba(59,130,246,0.5)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.7)]"
                >
                  {course ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
