import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  sendEmailVerification,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./config";
import { logLoginEvent } from "@/lib/services/login-history";

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!credential.user.emailVerified) {
    await firebaseSignOut(auth);
    throw new Error("Please verify your email before signing in.");
  }
  logLoginEvent(credential.user.uid, "email").catch(console.error);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  await firebaseSignOut(auth);
  return credential.user;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  logLoginEvent(result.user.uid, "google").catch(console.error);
  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("selvo_user_profile");
    localStorage.removeItem("selvo_firebase_config");
    sessionStorage.removeItem("selvo_splitwise_token");
  }
  await firebaseSignOut(auth);
}

export async function resendVerification(user: User) {
  await sendEmailVerification(user);
}
