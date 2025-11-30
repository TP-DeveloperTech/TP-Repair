import React, { useState, useEffect } from 'react';
import { getReports, updateReport, deleteReport, assignReport } from '../utils/storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Search, UserPlus, MapPin, User, Wrench, Calendar, Image as ImageIcon, X } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminPage = () => {
    const { isAdmin, isTechnician } = useAuth();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [technicians, setTechnicians] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(null);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [assignConfirm, setAssignConfirm] = useState(null);
    const [assignSuccess, setAssignSuccess] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        loadReports();
        if (isAdmin) {
            loadTechnicians();
        }
    }, []);

    useEffect(() => {
        filterReports();
    }, [reports, searchTerm, statusFilter]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await getReports();
            setReports(data);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTechnicians = async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', 'technician'));
            const snapshot = await getDocs(q);
            const techList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTechnicians(techList);
        } catch (error) {
            console.error('Error loading technicians:', error);
        }
    };

    const filterReports = () => {
        let filtered = [...reports];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.problemType?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredReports(filtered);
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await updateReport(reportId, { status: newStatus });
            await loadReports();
            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport({ ...selectedReport, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
        }
    };

    const handleAssign = (reportId, technicianId, technicianName) => {
        // Check if already assigned to this technician
        const report = reports.find(r => r.id === reportId);
        if (report && report.assignedTo === technicianId) {
            setErrorMessage('งานนี้ถูกมอบหมายให้ช่างท่านนี้แล้ว');
            setShowAssignModal(null);
            return;
        }

        setAssignConfirm({
            reportId,
            technicianId,
            technicianName
        });
    };

    const confirmAssignment = async () => {
        if (!assignConfirm) return;
        const { reportId, technicianId } = assignConfirm;

        try {
            await assignReport(reportId, technicianId);
            await loadReports();
            setShowAssignModal(null);
            setAssignSuccess(assignConfirm.technicianName);
        } catch (error) {
            console.error('Error assigning report:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการมอบหมายงาน');
        } finally {
            setAssignConfirm(null);
        }
    };

    const handleDeleteClick = (report) => {
        setReportToDelete(report);
    };

    const handleConfirmDelete = async () => {
        if (!reportToDelete) return;

        try {
            await deleteReport(reportToDelete.id);
            await loadReports();
            setSelectedReport(null);
            setReportToDelete(null);
        } catch (error) {
            console.error('Error deleting report:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการลบรายการ');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'รอดำเนินการ':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'กำลังดำเนินการ':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'เสร็จสิ้น':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };



    const getStats = () => {
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === 'รอดำเนินการ').length,
            inProgress: reports.filter(r => r.status === 'กำลังดำเนินการ').length,
            completed: reports.filter(r => r.status === 'เสร็จสิ้น').length
        };
    };

    const stats = getStats();

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {isTechnician ? 'จัดการงานซ่อม' : 'จัดการทั้งหมด'}
                </h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">ทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-700">รอดำเนินการ</p>
                        <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">กำลังดำเนินการ</p>
                        <p className="text-2xl font-bold text-blue-800">{stats.inProgress}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">เสร็จสิ้น</p>
                        <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="ค้นหา (ชื่อผู้แจ้ง, สถานที่, ประเภท)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="รอดำเนินการ">รอดำเนินการ</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                        </select>


                    </div>
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500">ไม่พบรายการ</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {report.problemType}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                            <MapPin size={14} />
                                            {report.location}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                            <User size={14} />
                                            {report.reporterName}
                                        </p>
                                        {report.assignedToName && (
                                            <p className="text-sm text-blue-600 flex items-center gap-1">
                                                <Wrench size={14} />
                                                มอบหมายให้: {report.assignedToName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <select
                                            value={report.status}
                                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(report.status)}`}
                                        >
                                            <option value="รอดำเนินการ">รอดำเนินการ</option>
                                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                                        </select>

                                        <div className="flex gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setShowAssignModal(report)}
                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                                                >
                                                    <UserPlus size={14} />
                                                    มอบหมาย
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded transition-colors"
                                            >
                                                ดูรายละเอียด
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteClick(report)}
                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                                                >
                                                    ลบ
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                    <Calendar size={12} />
                                    แจ้งเมื่อ: {formatDate(report.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReport(null)}>
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">รายละเอียดการแจ้งซ่อม</h2>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Status and Priority */}
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedReport.status)}`}>
                                        {selectedReport.status}
                                    </span>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">ผู้แจ้ง</label>
                                        <p className="text-gray-800">{selectedReport.reporterName}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">สถานที่/ห้อง</label>
                                        <p className="text-gray-800">{selectedReport.location}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">ประเภทปัญหา</label>
                                        <p className="text-gray-800">{selectedReport.problemType}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">รายละเอียดปัญหา</label>
                                        <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.problemDetails}</p>
                                    </div>

                                    {selectedReport.assignedToName && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">มอบหมายให้</label>
                                            <p className="text-gray-800">{selectedReport.assignedToName}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">วันที่แจ้ง</label>
                                        <p className="text-gray-800">{formatDate(selectedReport.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Images */}
                                {selectedReport.images && selectedReport.images.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 block mb-2">รูปภาพประกอบ</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedReport.images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt={`รูปที่ ${idx + 1}`}
                                                    onClick={() => setSelectedImage(img)}
                                                    className="w-full h-48 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAssignModal(null)}>
                    <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">มอบหมายงาน</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            เลือกช่างที่จะมอบหมายงาน: <strong>{showAssignModal.problemType}</strong>
                        </p>

                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {technicians.map(tech => (
                                <button
                                    key={tech.id}
                                    onClick={() => handleAssign(showAssignModal.id, tech.id, tech.displayName)}
                                    className="w-full text-left px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                >
                                    <p className="font-medium text-gray-800">{tech.displayName}</p>
                                    <p className="text-xs text-gray-500">{tech.email}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowAssignModal(null)}
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}


            {/* Image Viewer Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="รูปภาพขยาย"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!reportToDelete}
                onClose={() => setReportToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบรายการ"
                message={`คุณต้องการลบรายการแจ้งซ่อม "${reportToDelete?.problemType}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                confirmText="ลบรายการ"
                isDanger={true}
            />

            {/* Assignment Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!assignConfirm}
                onClose={() => setAssignConfirm(null)}
                onConfirm={confirmAssignment}
                title="ยืนยันการมอบหมายงาน"
                message={`คุณต้องการมอบหมายงานนี้ให้กับ "${assignConfirm?.technicianName}" ใช่หรือไม่?`}
                confirmText="มอบหมาย"
                type="info"
            />

            {/* Assignment Success Modal */}
            <ConfirmationModal
                isOpen={!!assignSuccess}
                onClose={() => setAssignSuccess(null)}
                onConfirm={() => setAssignSuccess(null)}
                title="มอบหมายงานสำเร็จ"
                message={`มอบหมายงานให้กับ "${assignSuccess}" เรียบร้อยแล้ว`}
                confirmText="ตกลง"
                type="success"
                showCancel={false}
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

export default AdminPage;
