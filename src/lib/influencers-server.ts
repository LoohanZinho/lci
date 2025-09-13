
import { db } from './firebase-admin';
import { deleteProofImage } from './storage-server';
import type { Influencer } from './influencers';

/**
 * Deletes an influencer document and all associated proof images from storage.
 * This function is intended to be used in server-side environments (e.g., Server Actions).
 * @param id - The ID of the influencer document to delete.
 */
export async function deleteInfluencer(id: string): Promise<void> {
    if (!id) {
        throw new Error("Influencer ID was not provided for deletion.");
    }
    
    const docRef = db.collection("influencers").doc(id);

    try {
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const influencer = docSnap.data() as Influencer;
            
            // Delete associated images from storage
            if (influencer.proofImageUrls && influencer.proofImageUrls.length > 0) {
                console.log(`Deleting ${influencer.proofImageUrls.length} associated images...`);
                const deletePromises = influencer.proofImageUrls.map(url => deleteProofImage(url));
                await Promise.all(deletePromises);
                console.log("Associated images deleted from Storage.");
            }
        } else {
             console.warn(`Influencer with ID ${id} not found. Only attempting to delete document.`);
        }

        // Delete the Firestore document
        await docRef.delete();
        console.log(`Influencer document with ID ${id} successfully deleted from Firestore.`);

    } catch (error: any) {
        console.error(`Error during deletion process for influencer ID ${id}:`, error);
        throw new Error(`Failed to delete influencer. Details: ${error.message}`);
    }
}
