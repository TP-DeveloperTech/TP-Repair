import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'ยืนยัน', 
    cancelText = 'ยกเลิก', 
    type = 'warning', // warning, danger, success, info
    showCancel = true
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle size={24} />;
            case 'success': return <CheckCircle size={24} />;
            case 'info': return <Info size={24} />;
            default: return <AlertTriangle size={24} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger': return 'bg-red-100 text-red-600';
            case 'success': return 'bg-green-100 text-green-600';
            case 'info': return 'bg-blue-100 text-blue-600';
            default: return 'bg-yellow-100 text-yellow-600';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700';
            case 'success': return 'bg-green-600 hover:bg-green-700';
            case 'info': return 'bg-blue-600 hover:bg-blue-700';
            default: return 'bg-yellow-600 hover:bg-yellow-700 text-white';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${getColors()}`}>
                        {getIcon()}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm();
                            if (type !== 'success') onClose(); // For success, we might want manual close or redirect
                        }}
                        className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${getButtonColor()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
