import React from "react";
import { Link } from "react-router-dom";
import ViewEvent from "./ViewEvent";

const ManageEvents = () => {
  return (
    <div className="flex flex-col w-full h-full min-h-screen p-8 bg-gray-100 dark:bg-neutral-900">
      <Link 
        to="/admin/dashboard"
        className="mb-8 flex items-center text-neutral-400 hover:text-white transition-colors"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Return to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
        Manage Events
      </h1>
      
      <ViewEvent />
    </div>
  );
};

export default ManageEvents;
