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
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteProofImageAction } from "@/app/actions";

export type UpdatableInfluencerData = Partial<Omit<NewInfluencer, 'addedBy' | 'lastUpdate' | 'editors'>>

export interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface EditorInfo {
  userId: string;
  timestamp: Timestamp;
  changes: ChangeDetail[];
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

export interface EditorData extends UserData, Omit<EditorInfo, 'userId'> {}


export interface InfluencerWithUserData extends Influencer {
  addedByData?: UserData;
  editorsData?: EditorData[];
}


export const addInfluencer = async (influencer: Omit<NewInfluencer, 'lastUpdate' | 'editors'> & { editors?: string[] }, newId?: string): Promise<DocumentReference> => {
  try {
    const dataToAdd = {
      ...influencer,
      proofImageUrls: influencer.proofImageUrls || [],
      products: influencer.products || [],
      editors: [], // Start with an empty array of EditorInfo
      lastUpdate: serverTimestamp(),
    };

    let docRef;
    if (newId) {
      // Use the provided ID to create the document
      docRef = doc(db, "influencers", newId);
      await setDoc(docRef, dataToAdd);
    } else {
      // Let Firestore generate a new ID
      docRef = await addDoc(collection(db, "influencers"), dataToAdd);
    }
    
    console.log("Document written with ID: ", docRef.id);
    return docRef as DocumentReference;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};


const fieldLabels: { [key: string]: string } = {
    name: "Nome",
    instagram: "Instagram",
    followers: "Seguidores",
    status: "Status",
    niche: "Nicho",
    notes: "Observações",
    isFumo: '"Fumo"',
    proofImageUrls: "Imagens de Prova",
    products: "Produtos",
    lossReason: "Motivo Prejuízo",
};

const formatValue = (field: string, value: any): string => {
    if (value === undefined || value === null) return "Não definido";
    if (typeof value === 'boolean') return value ? "Sim" : "Não";
    if (field === 'followers') return new Intl.NumberFormat('pt-BR').format(value);
    if (Array.isArray(value) && (field === 'proofImageUrls' || field === 'products')) return `${value.length} item(ns)`;
    if (value instanceof Timestamp) return value.toDate().toLocaleString('pt-BR');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
}


export const updateInfluencer = async (id: string, userId: string, data: UpdatableInfluencerData) => {
  try {
    const docRef = doc(db, "influencers", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error("Document not found!");
    }
    const currentData = docSnap.data() as Influencer;

    const changes: ChangeDetail[] = Object.keys(data).map(key => {
        const oldValue = currentData[key as keyof Influencer];
        const newValue = data[key as keyof UpdatableInfluencerData];

        return {
            field: fieldLabels[key] || key,
            oldValue: formatValue(key, oldValue),
            newValue: formatValue(key, newValue),
        }
    }).filter(change => change.oldValue !== change.newValue);


    const newEditorInfo: EditorInfo = {
        userId: userId,
        timestamp: Timestamp.now(),
        changes: changes,
    };
    
    const updateData: any = {
      ...data,
      lastUpdate: serverTimestamp(),
      editors: arrayUnion(newEditorInfo),
    };

    if (data.products) {
      updateData.products = data.products;
    }
    
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

export const getInfluencers = (
    callback: (influencers: InfluencerWithUserData[]) => void,
    sortBy: string = 'lastUpdate',
    sortDirection: OrderByDirection = 'desc'
  ) => {
    const q = query(collection(db, "influencers"), orderBy(sortBy, sortDirection));
  
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const influencers: Influencer[] = [];
      const updatePromises: Promise<void>[] = [];

      querySnapshot.forEach((document) => {
        const data = document.data();
        let status = data.status;

        // 1. Detecta se o status está ausente
        if (!status) {
          status = "Desconhecido"; // 2. Define um valor padrão para a UI
          
          // 3. Agenda uma atualização em segundo plano no banco de dados
          const docRef = doc(db, "influencers", document.id);
          updatePromises.push(updateDoc(docRef, { status: "Desconhecido" }));
        }

        influencers.push({ 
          id: document.id, 
          ...data,
          status: status, // Garante que o status correto seja usado
        } as Influencer);
      });

      // Executa todas as atualizações de forma assíncrona
      if (updatePromises.length > 0) {
        Promise.all(updatePromises).then(() => {
          console.log(`${updatePromises.length} influenciador(es) atualizado(s) com status padrão.`);
        }).catch(err => {
          console.error("Erro ao atualizar status de influenciadores:", err);
        });
      }
      
      const uids = influencers.flatMap(i => [i.addedBy, ...(i.editors || []).map(e => e.userId)]).filter(Boolean);
      const usersData = await fetchUsersData(uids);

      const influencersWithUserData: InfluencerWithUserData[] = influencers.map(influencer => ({
        ...influencer,
        addedByData: usersData[influencer.addedBy],
        editorsData: (influencer.editors || []).map(editorInfo => {
            const userData = usersData[editorInfo.userId];
            const { userId, ...restOfEditorInfo } = editorInfo;
            return userData ? { ...userData, ...restOfEditorInfo } : null;
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

    if (influencerData.proofImageUrls && influencerData.proofImageUrls.length > 0) {
      await Promise.all(influencerData.proofImageUrls.map(url => deleteProofImageAction(url)));
    }
    
    await deleteDoc(doc(db, "influencers", id));
    console.log("Document successfully deleted!");
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};
