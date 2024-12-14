import React from "react";
import { useNavigate } from "react-router-dom";
import { IconCalendarEvent, IconUsers } from "@tabler/icons-react";
import { motion } from "framer-motion";



const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Split welcome text into individual characters
  const welcomeText = "Welcome,".split("");

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-8 bg-gray-100 dark:bg-neutral-900">
      {/* Animated Welcome Section */}
      <div className="w-full mb-20">
        <div className="flex justify-center mb-4">
          {welcomeText.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: "spring",
                stiffness: 200,
              }}
              className="text-2xl text-neutral-600 dark:text-neutral-400"
            >
              {letter}
            </motion.span>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="relative flex justify-center"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              delay: 1.2,
              duration: 1,
              ease: "easeOut"
            }}
            className="absolute bottom-0 h-[2px] bg-gradient-to-r from-blue-600 to-teal-600"
          />
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-5xl font-bold text-neutral-900 dark:text-white py-4"
          >
            Admin
          </motion.h1>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Manage Events Card */}
        <div
          className="relative group cursor-pointer"
          onClick={() => navigate("/admin/manage-events")}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl p-6 shadow-lg flex flex-col items-center gap-4">
            <IconCalendarEvent className="w-12 h-12 text-teal-400" />
            <h2 className="text-xl font-semibold">Manage Events</h2>
            <p className="text-sm text-neutral-400 text-center">
              Create and manage events, assign contractors, and track progress.
            </p>
          </div>
        </div>

        {/* Manage Users Card */}
        <div
          className="relative group cursor-pointer"
          onClick={() => navigate("/admin/manage-users")}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl p-6 shadow-lg flex flex-col items-center gap-4">
            <IconUsers className="w-12 h-12 text-teal-400" />
            <h2 className="text-xl font-semibold">Manage Users</h2>
            <p className="text-sm text-neutral-400 text-center">
              Manage user accounts, permissions, and access levels.
            </p>
          </div>
        </div>

        {/* Manage Invoices Card */}
        <div
          className="relative group cursor-pointer"
          onClick={() => navigate("/admin/invoices")}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl p-6 shadow-lg flex flex-col items-center gap-4">
            <IconCalendarEvent className="w-12 h-12 text-teal-400" />
            <h2 className="text-xl font-semibold">Manage Invoices</h2>
            <p className="text-sm text-neutral-400 text-center">
              View and manage all invoices.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
