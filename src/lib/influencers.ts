import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  DocumentReference,
  OrderByDirection,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteProofImageByUrl } from "./storage";

export interface EditorInfo {
  userId: string;
  timestamp: Timestamp;
}

export interface ProductPublication {
  name: string;
  addedAt: Timestamp;
}

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
    proofImageUrls: string[];
    editors: EditorInfo[];
    products: ProductPublication[];
    lossReason?: string;
}

export interface Influencer extends Omit<NewInfluencer, 'lastUpdate'> {
    id: string;
    lastUpdate: Timestamp;
}

export interface UserData {
  name: string;
  email: string;
  isAnonymous: boolean;
}

export interface EditorData extends UserData {
  timestamp: Timestamp;
}


export interface InfluencerWithUserData extends Influencer {
  addedByData?: UserData;
  editorsData?: EditorData[];
}


export const addInfluencer = async (influencer: Omit<NewInfluencer, 'lastUpdate' | 'editors'> & { editors?: string[] }): Promise<DocumentReference> => {
  try {
    const docRef = await addDoc(collection(db, "influencers"), {
      ...influencer,
      proofImageUrls: influencer.proofImageUrls || [],
      products: influencer.products || [],
      editors: [], // Start with an empty array of EditorInfo
      lastUpdate: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export type UpdatableInfluencerData = Partial<Omit<NewInfluencer, 'addedBy' | 'lastUpdate' | 'editors'>>

export const updateInfluencer = async (id: string, userId: string, data: UpdatableInfluencerData) => {
  try {
    const docRef = doc(db, "influencers", id);
    const newEditorInfo: EditorInfo = {
        userId: userId,
        timestamp: Timestamp.now(),
    };
    
    const updateData: any = {
      ...data,
      lastUpdate: serverTimestamp(),
      editors: arrayUnion(newEditorInfo),
    };

    if (data.products) {
      updateData.products = data.products;
    }
    
    // Explicitly handle setting lossReason to null or an empty string if status changes
    if (data.status !== 'Prejuízo') {
      updateData.lossReason = "";
    }


    await updateDoc(docRef, updateData);
    console.log("Document successfully updated!");
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};


const fetchUsersData = async (uids: string[]): Promise<Record<string, UserData>> => {
  if (uids.length === 0) return {};
  const uniqueUids = [...new Set(uids)];
  
  // Firestore 'in' query is limited to 30 elements. We need to batch the requests.
  const batches: Promise<any>[] = [];
  for (let i = 0; i < uniqueUids.length; i += 30) {
      const batchUids = uniqueUids.slice(i, i + 30);
      if (batchUids.length > 0) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where('__name__', 'in', batchUids));
        batches.push(getDocs(q));
      }
  }
  
  try {
      const userDocsBatches = await Promise.all(batches);
      const usersData: Record<string, UserData> = {};
      
      for(const userDocs of userDocsBatches) {
        userDocs.forEach((doc: any) => {
            usersData[doc.id] = doc.data() as UserData;
        });
      }
      return usersData;
  } catch (error) {
      console.error("Error fetching users data: ", error);
      return {};
  }
};

// This is a temporary workaround until 'in' queries are fully supported in onSnapshot listeners for this use case.
const { where } = require("firebase/firestore");

export const getInfluencers = (
    callback: (influencers: InfluencerWithUserData[]) => void,
    sortBy: string = 'lastUpdate',
    sortDirection: OrderByDirection = 'desc'
  ) => {
    const q = query(collection(db, "influencers"), orderBy(sortBy, sortDirection));
  
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const influencers: Influencer[] = [];
      querySnapshot.forEach((doc) => {
        influencers.push({ id: doc.id, ...doc.data() } as Influencer);
      });
      
      const uids = influencers.flatMap(i => [i.addedBy, ...(i.editors || []).map(e => e.userId)]).filter(Boolean);
      const usersData = await fetchUsersData(uids);

      const influencersWithUserData: InfluencerWithUserData[] = influencers.map(influencer => ({
        ...influencer,
        addedByData: usersData[influencer.addedBy],
        editorsData: (influencer.editors || []).map(editorInfo => {
            const userData = usersData[editorInfo.userId];
            return userData ? { ...userData, timestamp: editorInfo.timestamp } : null;
        }).filter(Boolean) as EditorData[]
      }));

      callback(influencersWithUserData);
    }, (error) => {
        console.error("Error getting influencers: ", error);
    });
  
    return unsubscribe;
  };

export const deleteInfluencer = async (id: string) => {
  try {
    const influencerDoc = await getDoc(doc(db, "influencers", id));
    if (!influencerDoc.exists()) {
      throw new Error("Influencer not found");
    }
    const influencerData = influencerDoc.data() as Influencer;

    // Delete proof images from storage if they exist
    if (influencerData.proofImageUrls && influencerData.proofImageUrls.length > 0) {
      await Promise.all(influencerData.proofImageUrls.map(url => deleteProofImageByUrl(url)));
    }
    
    await deleteDoc(doc(db, "influencers", id));
    console.log("Document successfully deleted!");
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};
