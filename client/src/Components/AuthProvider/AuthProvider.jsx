import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Auth from "../../Firebase/firebase";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  const registerUser = (email, pass) => {
    setLoading(true);
    return createUserWithEmailAndPassword(Auth, email, pass);
  };

  const userLogIn = (email, pass) => {
    setLoading(true);
    return signInWithEmailAndPassword(Auth, email, pass);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(Auth, googleProvider);
  };

  const updateUserProfile = async (updatedData) => {
    try {
      await updateProfile(Auth.currentUser, updatedData);
      await Auth.currentUser.reload();
      setUser({ ...Auth.currentUser });
    } catch (err) {
      Swal.fire({
        title: `${err.message || err.code}`,
        text: "Thanks For Being With Us",
        icon: "warning",
        confirmButtonText: "close",
      });
    }
  };

  const userLogOut = async () => {
    return await signOut(Auth);
  };

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(Auth, async (currentUser) => {
      try {
        if (currentUser?.email) {
          if (import.meta.env.DEV) {
            console.log("current user from auth -->", currentUser);
          }
          setUser(currentUser);
          await axios.post(
            `${import.meta.env.VITE_API_URL}/jwt`,
            { email: currentUser.email },
            { withCredentials: true }
          );

          if (import.meta.env.DEV) {
            console.log("✅ JWT issued and cookie saved!");
          }
        } else {
          setUser(null);

          await axios.post(
            `${import.meta.env.VITE_API_URL}/logout`,
            {},
            { withCredentials: true }
          );

          if (import.meta.env.DEV) {
            console.log("✅ JWT cookie cleared on logout!");
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("❌ Error handling auth state:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    registerUser,
    userLogIn,
    signInWithGoogle,
    updateUserProfile,
    userLogOut,
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
