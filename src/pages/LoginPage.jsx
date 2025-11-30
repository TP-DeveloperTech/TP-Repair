import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await signInWithGoogle();
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src={`${import.meta.env.BASE_URL}assets/taweethapisek-logo.png`}
                            alt="Logo"
                            className="h-20 w-auto"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">TP-Maintenance</h1>
                    <p className="text-gray-600">ระบบแจ้งซ่อมภายในโรงเรียน</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <LogIn className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h2 className="text-xl font-semibold text-gray-800">เข้าสู่ระบบ</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            กรุณาเข้าสู่ระบบด้วย Google เพื่อใช้งาน
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                เข้าสู่ระบบด้วย Google
                            </>
                        )}
                    </button>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 text-center">
                            <strong>หมายเหตุ:</strong> ระบบจะสร้างบัญชีผู้ใช้ใหม่โดยอัตโนมัติ
                            หากยังไม่เคยเข้าสู่ระบบมาก่อน
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        © 2024 TP-Maintenance. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
