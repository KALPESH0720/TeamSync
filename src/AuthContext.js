
import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (name, email, password) => {
 
    const cred = await auth().createUserWithEmailAndPassword(email, password);
    const firebaseUser = cred.user;

  
    await firebaseUser.updateProfile({
      displayName: name,
    });

   
    await firestore().collection('users').doc(firebaseUser.uid).set({
      name,
      email,
      role: 'member',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return firebaseUser;
  };

  const login = (email, password) => {
    return auth().signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth().signOut();
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
