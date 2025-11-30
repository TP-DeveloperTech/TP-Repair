import React, { useState } from 'react';
import { saveReport } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const ReportPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        reporterName: currentUser?.displayName || '',
        location: '',
        problemType: '',
        problemDetails: '',
        images: []
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

        const readers = imageFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(images => {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...images] }));
            // Clear image error when images are added
            if (errors.images) {
                setErrors(prev => ({ ...prev, images: '' }));
            }
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.reporterName.trim()) newErrors.reporterName = 'กรุณากรอกชื่อผู้แจ้ง';
        if (!formData.location.trim()) newErrors.location = 'กรุณากรอกสถานที่';
        if (!formData.problemType) newErrors.problemType = 'กรุณาเลือกประเภทปัญหา';
        if (!formData.problemDetails.trim()) newErrors.problemDetails = 'กรุณากรอกรายละเอียดปัญหา';
        if (formData.images.length === 0) newErrors.images = 'กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSubmitting(true);

            // Save report to Firestore
            await saveReport(
                formData,
                currentUser.uid,
                currentUser.email,
                formData.reporterName
            );

            // Show success modal
            setShowSuccess(true);

            // Reset form
            setFormData({
                reporterName: currentUser?.displayName || '',
                location: '',
                problemType: '',
                problemDetails: '',
                images: []
            });
            setErrors({});

            // Navigation will be handled by modal close
        } catch (error) {
            console.error('Error submitting report:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        navigate('/history');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-200 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">แจ้งซ่อม</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Reporter Name */}
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1.5">
                            ชื่อผู้แจ้ง <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="reporterName"
                            value={formData.reporterName}
                            onChange={handleChange}
                            placeholder="ระบุชื่อ-นามสกุล"
                            className={`w-full px-3 py-2 border ${errors.reporterName ? 'border-red-500' : 'border-gray-300'} rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                        />
                        {errors.reporterName && <p className="text-red-500 text-xs mt-1">{errors.reporterName}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1.5">
                            สถานที่/ห้อง <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="ระบุสถานที่หรือเลขห้อง (เช่น ห้อง 101, อาคาร A)"
                            className={`w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                    </div>

                    {/* Problem Type */}
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1.5">
                            ประเภทปัญหา <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="problemType"
                            value={formData.problemType}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.problemType ? 'border-red-500' : 'border-gray-300'} rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
                        >
                            <option value="">เลือกประเภทปัญหา</option>
                            <option value="ไฟฟ้า">ไฟฟ้า</option>
                            <option value="ประปา">ประปา</option>
                            <option value="แอร์">แอร์</option>
                            <option value="เครื่องใช้ไฟฟ้า">เครื่องใช้ไฟฟ้า</option>
                            <option value="อาคาร/สิ่งก่อสร้าง">อาคาร/สิ่งก่อสร้าง</option>
                            <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                        {errors.problemType && <p className="text-red-500 text-xs mt-1">{errors.problemType}</p>}
                    </div>

                    {/* Problem Details */}
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1.5">
                            รายละเอียดปัญหา <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="problemDetails"
                            value={formData.problemDetails}
                            onChange={handleChange}
                            placeholder="อธิบายรายละเอียดปัญหาที่พบ..."
                            rows="4"
                            className={`w-full px-3 py-2 border ${errors.problemDetails ? 'border-red-500' : 'border-gray-300'} rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none`}
                        />
                        {errors.problemDetails && <p className="text-red-500 text-xs mt-1">{errors.problemDetails}</p>}
                    </div>

                    {/* Image Upload with Drag & Drop */}
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1.5">
                            รูปภาพประกอบ <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                                ? 'border-green-500 bg-green-50'
                                : errors.images
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center">
                                    <Upload className={`w-10 h-10 mb-2 ${dragActive ? 'text-green-600' : 'text-gray-400'}`} />
                                    <p className="text-sm text-gray-600 font-medium">
                                        {dragActive ? 'วางรูปภาพที่นี่' : 'คลิกหรือลากรูปภาพมาวางที่นี่'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ JPG, PNG (สามารถเลือกหลายรูปได้)</p>
                                </div>
                            </label>
                        </div>
                        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}

                        {/* Image Preview */}
                        {formData.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={img}
                                            alt={`รูปที่ ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {formData.images.length > 0 && (
                            <p className="text-sm text-green-600 mt-2 font-medium">เลือกแล้ว {formData.images.length} รูป</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded transition-colors duration-200 flex items-center justify-center text-sm mt-6"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ส่งแจ้งซ่อม
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Success Notification Modal */}
            <ConfirmationModal
                isOpen={showSuccess}
                onClose={handleSuccessClose}
                onConfirm={handleSuccessClose}
                title="บันทึกข้อมูลสำเร็จ"
                message="ระบบได้บันทึกการแจ้งซ่อมของคุณเรียบร้อยแล้ว"
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

export default ReportPage;
