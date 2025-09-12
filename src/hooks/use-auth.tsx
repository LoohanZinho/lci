"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { doc, setDoc, getDoc } from "firebase/firestore";

const ADMIN_EMAILS = ["lohansantosborges@gmail.com", "natanrabelo934@gmail.com"];

interface UserProfile {
  name: string;
  email: string;
  isAnonymous: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { name: string; isAnonymous: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email || ""));

        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // If profile doesn't exist, create it from auth data
           const profile: UserProfile = {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            isAnonymous: !currentUser.displayName,
          };
          await setDoc(userDocRef, profile);
          setUserProfile(profile);
        }

      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === '/logout';

    if (!user && !isAuthPage) {
      router.push("/login");
    } else if (user && (pathname === "/login" || pathname === "/signup")) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  const signup = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const newUser = userCredential.user;
    if (newUser) {
      await updateProfile(newUser, { displayName });
      
      const profile: UserProfile = {
        name: displayName,
        email: email,
        isAnonymous: false,
      };
      await setDoc(doc(db, "users", newUser.uid), profile);

      await newUser.reload();
      setUser(auth.currentUser);
      setUserProfile(profile);
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: { name: string; isAnonymous: boolean }) => {
    if (auth.currentUser) {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName: data.name });

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const updatedProfile: UserProfile = {
        name: data.name,
        email: auth.currentUser.email || "",
        isAnonymous: data.isAnonymous,
      };
      
      await setDoc(userDocRef, updatedProfile, { merge: true });

      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setUserProfile(updatedProfile);
    } else {
      throw new Error("Nenhum usuário logado para atualizar.");
    }
  }

  const value = { user, loading, isAdmin, userProfile, signup, login, logout, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {loading && pathname !== '/logout' ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

    