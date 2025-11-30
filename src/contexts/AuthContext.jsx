import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { getRoleByEmail } from '../config/roles';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                // Determine role based on email whitelist
                const autoRole = getRoleByEmail(user.email);

                // Create new user document with auto-assigned role
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email,
                    photoURL: user.photoURL || null,
                    role: autoRole, // Auto-assign based on email
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                setUserRole(autoRole);
            } else {
                setUserRole(userDoc.data().role);
            }

            return user;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setCurrentUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Update user role (admin only)
    const updateUserRole = async (userId, newRole) => {
        try {
            await setDoc(doc(db, 'users', userId), {
                role: newRole,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Update local state if updating current user
            if (userId === currentUser?.uid) {
                setUserRole(newRole);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    } else {
                        setUserRole('user');
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole('user');
                }
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        loading,
        signInWithGoogle,
        signOut,
        updateUserRole,
        isAdmin: userRole === 'admin',
        isTechnician: userRole === 'technician',
        isUser: userRole === 'user'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
