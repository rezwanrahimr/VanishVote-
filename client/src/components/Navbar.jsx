import React from 'react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun, FaPlus } from 'react-icons/fa';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          VanishVote
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/create" 
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" /> Create Poll
          </Link>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FaSun className="text-yellow-400 text-xl" />
            ) : (
              <FaMoon className="text-gray-600 text-xl" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;