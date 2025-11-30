import React, { useState, useEffect } from 'react';
import { getReportsByUser } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, User, Wrench, Calendar, Image as ImageIcon, X } from 'lucide-react';

const HistoryPage = () => {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, [currentUser]);

    const loadReports = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const data = await getReportsByUser(currentUser.uid);
            setReports(data);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
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



    return (
        <div className="min-h-[calc(100vh-64px)] bg-white">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">ประวัติการแจ้งซ่อม</h1>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xl text-gray-500 font-medium">ยังไม่มีประวัติการแจ้งซ่อม</p>
                        <p className="text-sm text-gray-400 mt-2">เมื่อคุณแจ้งซ่อม ประวัติจะแสดงที่นี่</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                            {report.problemType}
                                        </h3>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <MapPin size={14} />
                                            {report.location}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>

                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                    {report.problemDetails}
                                </p>

                                {report.assignedToName && (
                                    <p className="text-sm text-blue-600 mb-2 flex items-center gap-1">
                                        <Wrench size={14} />
                                        มอบหมายให้: {report.assignedToName}
                                    </p>
                                )}

                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {formatDate(report.createdAt)}
                                    </span>
                                    {report.images && report.images.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <ImageIcon size={12} />
                                            {report.images.length} รูป</span>
                                    )}
                                </div>
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

                            <div className="mt-6 flex justify-end">
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


            {/* Image Viewer Modal */}
            {
                selectedImage && (
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
                )
            }
        </div >
    );
};

export default HistoryPage;

