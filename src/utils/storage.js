// Firestore utility functions for reports management

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const REPORTS_COLLECTION = 'reports';

// Generate unique ID (Firestore will auto-generate, but keeping for compatibility)
const generateId = () => {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Save a new report to Firestore
export const saveReport = async (reportData, userId, userEmail, userName) => {
    try {
        const newReport = {
            ...reportData,
            reporterId: userId,
            reporterEmail: userEmail,
            reporterName: userName || reportData.reporterName,
            status: 'รอดำเนินการ', // Pending
            assignedTo: null,
            assignedToName: null,
            assignedBy: null,
            assignedAt: null,
            hiddenFromAdmin: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, REPORTS_COLLECTION), newReport);
        return { id: docRef.id, ...newReport };
    } catch (error) {
        console.error('Error saving report:', error);
        throw error;
    }
};

// Get all reports (for admin, exclude hidden ones)
export const getReports = async () => {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'))
        );
        const allReports = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        }));

        // Filter out hidden reports for admin view
        return allReports.filter(report => !report.hiddenFromAdmin);
    } catch (error) {
        console.error('Error getting reports:', error);
        return [];
    }
};

// Get reports by user ID (includes all reports, even hidden from admin)
export const getReportsByUser = async (userId) => {
    try {
        const q = query(
            collection(db, REPORTS_COLLECTION),
            where('reporterId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const reports = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        }));

        // Sort by createdAt desc (client-side)
        return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error getting user reports:', error);
        return [];
    }
};

// Get reports assigned to a technician
export const getAssignedReports = async (technicianId) => {
    try {
        const q = query(
            collection(db, REPORTS_COLLECTION),
            where('assignedTo', '==', technicianId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        }));
    } catch (error) {
        console.error('Error getting assigned reports:', error);
        return [];
    }
};

// Get report by ID
export const getReportById = async (id) => {
    try {
        const docRef = doc(db, REPORTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
                updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting report:', error);
        return null;
    }
};

// Update report
export const updateReport = async (id, updates) => {
    try {
        const docRef = doc(db, REPORTS_COLLECTION, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
        return await getReportById(id);
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
};

// Assign report to technician
export const assignReport = async (reportId, technicianId, technicianName, assignedBy) => {
    try {
        const docRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(docRef, {
            assignedTo: technicianId,
            assignedToName: technicianName,
            assignedBy: assignedBy,
            assignedAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return await getReportById(reportId);
    } catch (error) {
        console.error('Error assigning report:', error);
        throw error;
    }
};

// Hide report from admin view (soft delete)
// The report will still be visible in user's history
export const deleteReport = async (id) => {
    try {
        await updateDoc(doc(db, REPORTS_COLLECTION, id), {
            hiddenFromAdmin: true,
            hiddenAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error hiding report:', error);
        throw error;
    }
};

// Get reports statistics
export const getReportsStats = async () => {
    try {
        const reports = await getReports();
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === 'รอดำเนินการ').length,
            inProgress: reports.filter(r => r.status === 'กำลังดำเนินการ').length,
            completed: reports.filter(r => r.status === 'เสร็จสิ้น').length,
            highPriority: reports.filter(r => r.priority === 'ด่วนมาก').length,
            mediumPriority: reports.filter(r => r.priority === 'ด่วน').length,
            normalPriority: reports.filter(r => r.priority === 'ปกติ').length
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            highPriority: 0,
            mediumPriority: 0,
            normalPriority: 0
        };
    }
};
