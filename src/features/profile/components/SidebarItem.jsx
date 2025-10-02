import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${
                    isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                }`
            }
        >
            {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
            <span>{label}</span>
        </NavLink>
    );
}
