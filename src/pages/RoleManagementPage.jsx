import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, UserCog, Search } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const RoleManagementPage = () => {
    const { currentUser, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [roleConfirm, setRoleConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

    const loadUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Filter by role
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleRoleChange = (userId, newRole, userName) => {
        setRoleConfirm({
            userId,
            newRole,
            userName
        });
    };

    const confirmRoleChange = async () => {
        if (!roleConfirm) return;

        const { userId, newRole } = roleConfirm;

        try {
            setUpdating(userId);
            await updateDoc(doc(db, 'users', userId), {
                role: newRole,
                updatedAt: new Date().toISOString()
            });

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));

            // Alert is removed as we use modal now, or we can show a success toast/modal if needed.
            // But usually the UI update is enough feedback or a small toast.
            // For now, let's just close the modal.
        } catch (error) {
            console.error('Error updating role:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการอัพเดทสิทธิ์');
        } finally {
            setUpdating(null);
            setRoleConfirm(null);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: { color: 'bg-red-100 text-red-800 border-red-200', label: 'ผู้ดูแลระบบ', icon: Shield },
            technician: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'ช่าง', icon: UserCog },
            user: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'ผู้ใช้งาน', icon: Users }
        };
        return badges[role] || badges.user;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAdmin) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
                    <p className="text-gray-600">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการสิทธิ์ผู้ใช้</h1>
                    <p className="text-gray-600">กำหนดสิทธิ์การเข้าถึงสำหรับผู้ใช้แต่ละคน</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                        <div className="flex items-center">
                            <Shield className="w-8 h-8 text-red-600 mr-3" />
                            <div>
                                <p className="text-sm text-red-600 font-medium">ผู้ดูแลระบบ</p>
                                <p className="text-2xl font-bold text-red-900">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                        <div className="flex items-center">
                            <UserCog className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-blue-600 font-medium">ช่าง</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {users.filter(u => u.role === 'technician').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-gray-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600 font-medium">ผู้ใช้งาน</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'user').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="ค้นหา (ชื่อ, อีเมล)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            <option value="all">สิทธิ์ทั้งหมด</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                            <option value="technician">ช่าง</option>
                            <option value="user">ผู้ใช้งาน</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        ผู้ใช้
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        อีเมล
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        สิทธิ์ปัจจุบัน
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        เปลี่ยนสิทธิ์
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        วันที่สมัคร
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const badge = getRoleBadge(user.role);
                                        const Icon = badge.icon;
                                        const isCurrentUser = user.id === currentUser?.uid;

                                        return (
                                            <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-green-50' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {user.photoURL ? (
                                                            <img
                                                                src={user.photoURL}
                                                                alt={user.displayName}
                                                                className="w-10 h-10 rounded-full mr-3"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                <Users size={20} className="text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {user.displayName}
                                                                {isCurrentUser && (
                                                                    <span className="ml-2 text-xs text-green-600">(คุณ)</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                                                        <Icon size={14} className="mr-1" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value, user.displayName)}
                                                        disabled={updating === user.id || isCurrentUser}
                                                        className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="user">ผู้ใช้งาน</option>
                                                        <option value="technician">ช่าง</option>
                                                        <option value="admin">ผู้ดูแลระบบ</option>
                                                    </select>
                                                    {isCurrentUser && (
                                                        <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนสิทธิ์ตัวเองได้</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ คำอธิบายสิทธิ์</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li><strong>ผู้ใช้งาน:</strong> สามารถแจ้งซ่อมและดูประวัติของตัวเองได้</li>
                        <li><strong>ช่าง:</strong> สามารถดูงานที่ได้รับมอบหมายและอัพเดทสถานะได้</li>
                        <li><strong>ผู้ดูแลระบบ:</strong> สามารถเข้าถึงทุกฟีเจอร์ รวมถึงจัดการสิทธิ์ผู้ใช้</li>
                    </ul>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!roleConfirm}
                onClose={() => setRoleConfirm(null)}
                onConfirm={confirmRoleChange}
                title="ยืนยันการเปลี่ยนสิทธิ์"
                message={`คุณต้องการเปลี่ยนสิทธิ์ของ "${roleConfirm?.userName}" เป็น "${roleConfirm?.newRole === 'admin' ? 'ผู้ดูแลระบบ' :
                    roleConfirm?.newRole === 'technician' ? 'ช่าง' : 'ผู้ใช้งาน'
                    }" ใช่หรือไม่?`}
                confirmText="ยืนยัน"
                type="warning"
            />

            {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                onConfirm={() => setErrorMessage(null)}
                title="เกิดข้อผิดพลาด"
                message={errorMessage || ''}
                confirmText="ตกลง"
                type="danger"
                showCancel={false}
            />
        </div>
    );
};

export default RoleManagementPage;
