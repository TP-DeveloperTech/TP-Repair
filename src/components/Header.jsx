import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';

const Header = ({ onMenuClick, isMenuOpen }) => {
    const navigate = useNavigate();
    const { currentUser, signOut, userRole } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'technician':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'ผู้ดูแลระบบ';
            case 'technician':
                return 'ช่าง';
            default:
                return 'ผู้ใช้งาน';
        }
    };

    return (
        <>
            <header className="bg-[#1a7f45] text-white p-4 flex items-center justify-between shadow-md relative z-[60]">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="mr-4 focus:outline-none hover:bg-green-700 p-1 rounded transition-colors"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    <div
                        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/assets/taweethapisek logo.png"
                            alt="Logo"
                            className="h-10 w-auto mr-3"
                        />
                        <h1 className="text-xl font-bold">TP-Maintenance</h1>
                    </div>
                </div>

                {/* User Menu */}
                {currentUser && (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 hover:bg-green-700 px-3 py-2 rounded transition-colors"
                        >
                            {currentUser.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full border-2 border-white"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center border-2 border-white">
                                    <User size={18} />
                                </div>
                            )}
                            <span className="hidden md:block text-sm font-medium">
                                {currentUser.displayName || currentUser.email}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-900">
                                            {currentUser.displayName || 'ผู้ใช้งาน'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {currentUser.email}
                                        </p>
                                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userRole)}`}>
                                            {getRoleLabel(userRole)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            setShowLogoutConfirm(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        ออกจากระบบ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </header>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleSignOut}
                title="ยืนยันการออกจากระบบ"
                message="คุณต้องการออกจากระบบใช่หรือไม่?"
                confirmText="ออกจากระบบ"
                isDanger={true}
            />
        </>
    );
};

export default Header;
