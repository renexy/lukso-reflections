/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export async function getReflectionsByWallet(walletAddress: string) {
    const wa = walletAddress?.toLowerCase();
    const reflectionsRef = collection(db, "reflections");
    
    const q = query(reflectionsRef, where("walletAddress", "==", wa));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting reflections:", error);
        return [];
    }
}
  
export async function addReflection(walletAddress: string, text: string) {
    const wallet = walletAddress.toLowerCase();
    const reflectionsRef = collection(db, "reflections");
    
    try {
        const docRef = await addDoc(reflectionsRef, {
            walletAddress: wallet,
            text,
            lyxReceived: 0,
            createdAt: new Date().toISOString(),
        });
        return { id: docRef.id, walletAddress: wallet, text };
    } catch (error) {
        console.error("Error adding reflection:", error);
        return -1
    }
}

export async function editReflection(reflectionId: string, newText: string) {
    try {
        const reflectionDoc = doc(db, "reflections", reflectionId);
        await updateDoc(reflectionDoc, { text: newText });
        return { id: reflectionId, text: newText };
    } catch (error) {
        console.error("Error editing reflection:", error);
        return -1
    }
}

export async function deleteReflection(reflectionId: string) {
    try {
        const reflectionDoc = doc(db, "reflections", reflectionId);
        await deleteDoc(reflectionDoc);
        return { success: true, id: reflectionId };
    } catch (error) {
        console.error("Error deleting reflection:", error);
        return Promise.reject(error);
    }
}

export async function incrementLyxReceived(reflectionId: string, received: number) {
    try {
        const reflectionDoc = doc(db, "reflections", reflectionId);
        
        // Increment lyxReceived
        await updateDoc(reflectionDoc, { lyxReceived: increment(received) });

        // Fetch the updated document
        const updatedSnapshot = await getDoc(reflectionDoc);
        if (updatedSnapshot.exists()) {
            return { id: reflectionId, lyxReceived: updatedSnapshot.data().lyxReceived };
        } else {
            return -1;
        }
    } catch (error) {
        console.error("Error updating lyxReceived:", error);
        return -1;
    }
}

  