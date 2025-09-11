import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "./firebase";

export interface NewInfluencer {
    name: string;
    instagram: string;
    followers: number;
    status: string;
    niche: string;
    contact: string;
    notes: string;
    isFumo: boolean;
    lastUpdate: Date;
    addedBy: string;
}

export interface Influencer extends NewInfluencer {
    id: string;
    lastUpdate: Timestamp;
}


export const addInfluencer = async (influencer: NewInfluencer) => {
  try {
    const docRef = await addDoc(collection(db, "influencers"), {
      ...influencer,
      lastUpdate: serverTimestamp(), // Use server timestamp for consistency
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getInfluencers = (
    callback: (influencers: Influencer[]) => void
  ) => {
    const q = query(collection(db, "influencers"), orderBy("lastUpdate", "desc"));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const influencers: Influencer[] = [];
      querySnapshot.forEach((doc) => {
        influencers.push({ id: doc.id, ...doc.data() } as Influencer);
      });
      callback(influencers);
    });
  
    return unsubscribe;
  };

export const deleteInfluencer = async (id: string) => {
  try {
    await deleteDoc(doc(db, "influencers", id));
    console.log("Document successfully deleted!");
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};
