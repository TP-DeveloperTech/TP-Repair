// Admin email whitelist
// Add emails here that should automatically get admin role on first login
export const ADMIN_EMAILS = [
    'your-email@gmail.com', // Replace with your actual email
    // Add more admin emails here
];

// Technician email whitelist
export const TECHNICIAN_EMAILS = [
    // Add technician emails here
];

// Check if email is in admin list
export const isAdminEmail = (email) => {
    return ADMIN_EMAILS.includes(email?.toLowerCase());
};

// Check if email is in technician list
export const isTechnicianEmail = (email) => {
    return TECHNICIAN_EMAILS.includes(email?.toLowerCase());
};

// Get role based on email
export const getRoleByEmail = (email) => {
    if (isAdminEmail(email)) return 'admin';
    if (isTechnicianEmail(email)) return 'technician';
    return 'user';
};
