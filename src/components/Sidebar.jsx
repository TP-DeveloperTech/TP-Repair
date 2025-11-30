import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, History, UserCog, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { isAdmin, isTechnician } = useAuth();
    const isIndexPage = location.pathname === '/';

    // Conditionally set menu items based on page and role
    let menuItems = [];

    if (isIndexPage) {
        // On Index page, only show "แจ้งซ่อม" for everyone
        menuItems = [
            { path: '/report', label: 'แจ้งซ่อม', sublabel: 'Maintenance', icon: FileText }
        ];
    } else {
        // On other pages, show menu based on role
        menuItems = [
            { path: '/report', label: 'แจ้งซ่อม', sublabel: 'Maintenance', icon: FileText },
            { path: '/history', label: 'ประวัติ', sublabel: 'History', icon: History }
        ];

        // Add Admin tab for technicians and admins
        if (isTechnician || isAdmin) {
            menuItems.push({ path: '/admin', label: 'เจ้าหน้าที่', sublabel: 'Admin', icon: UserCog });
        }

        // Add Role Management tab only for admins
        if (isAdmin) {
            menuItems.push({ path: '/roles', label: 'จัดการสิทธิ์', sublabel: 'Roles', icon: Shield });
        }
    }

    return (
        <>
            {/* Overlay - Transparent click area to close menu */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-green-800 text-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">เมนู</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                            ? 'bg-green-700 text-white'
                                            : 'text-green-100 hover:bg-green-700 hover:text-white'
                                        }`}
                                >
                                    <IconComponent size={24} className="mr-3" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-xs text-green-200">({item.sublabel})</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
