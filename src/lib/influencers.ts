import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface NewInfluencer {
    name: string;
    instagram: string;
    followers: number;
    status: string;
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
