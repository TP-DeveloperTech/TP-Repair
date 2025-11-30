import React from 'react';

const StatusCard = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-white">
            <div className="bg-gray-200 p-10 rounded-lg shadow-sm flex flex-col items-center justify-center w-80 h-64">
                <div className="mb-4">
                    <img src="/assets/WrenchIcon.png" alt="Maintenance" className="w-24 h-24 object-contain" />
                </div>
                <h2 className="text-lg font-semibold text-black mb-2">ระบบแจ้งซ้อม(Maintenance)</h2>
                <p className="text-sm text-gray-600">
                    status: <span className="text-green-500 font-medium">เปิดระบบ</span>
                </p>
            </div>
        </div>
    );
};

export default StatusCard;
