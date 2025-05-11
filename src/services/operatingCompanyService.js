import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

const OPERATING_COMPANIES_COLLECTION = 'operating_companies';

export const operatingCompanyService = {
  // Create a new operating company
  async createOperatingCompany(investmentId, companyData) {
    const docRef = await addDoc(collection(db, OPERATING_COMPANIES_COLLECTION), {
      ...companyData,
      investmentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  // Update an existing operating company
  async updateOperatingCompany(companyId, companyData) {
    const docRef = doc(db, OPERATING_COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      ...companyData,
      updatedAt: new Date().toISOString(),
    });
  },

  // Delete an operating company
  async deleteOperatingCompany(companyId) {
    const docRef = doc(db, OPERATING_COMPANIES_COLLECTION, companyId);
    await deleteDoc(docRef);
  },

  // Get all operating companies for an investment
  async getOperatingCompanies(investmentId) {
    const q = query(
      collection(db, OPERATING_COMPANIES_COLLECTION),
      where('investmentId', '==', investmentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
}; 