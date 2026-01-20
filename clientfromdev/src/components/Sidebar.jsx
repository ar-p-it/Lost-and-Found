import React from "react";
import { NavLink } from "react-router-dom";
import { Home, List, LogOut, Box } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { name: "Feed", path: "/feed", icon: <Home size={20} /> },
    { name: "My Posts", path: "/my-posts", icon: <List size={20} /> },
    { name: "My Claims", path: "/my-claims", icon: <List size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-14 md:top-0 h-[calc(100vh-56px)] md:h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-40 hidden md:flex">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Box className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">Lost & Found</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer intentionally empty: Navbar handles logout */}
    </aside>
  );
};

export default Sidebar;