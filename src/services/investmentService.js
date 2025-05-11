import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

const INVESTMENTS_COLLECTION = 'investments';
const OPERATING_COMPANIES_COLLECTION = 'operating_companies';
const FINANCIAL_DATA_COLLECTION = 'financial_data';

export const investmentService = {
  // Investment operations
  async createInvestment(userId, investmentData) {
    const docRef = await addDoc(collection(db, INVESTMENTS_COLLECTION), {
      ...investmentData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateInvestment(investmentId, investmentData) {
    const docRef = doc(db, INVESTMENTS_COLLECTION, investmentId);
    await updateDoc(docRef, {
      ...investmentData,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteInvestment(investmentId) {
    const docRef = doc(db, INVESTMENTS_COLLECTION, investmentId);
    await deleteDoc(docRef);
  },

  async getInvestments(userId) {
    const q = query(
      collection(db, INVESTMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Operating company operations
  async createOperatingCompany(investmentId, companyData) {
    const docRef = await addDoc(collection(db, OPERATING_COMPANIES_COLLECTION), {
      ...companyData,
      investmentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateOperatingCompany(companyId, companyData) {
    const docRef = doc(db, OPERATING_COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      ...companyData,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteOperatingCompany(companyId) {
    const docRef = doc(db, OPERATING_COMPANIES_COLLECTION, companyId);
    await deleteDoc(docRef);
  },

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

  // Financial data operations
  async addFinancialData(companyId, financialData) {
    const docRef = await addDoc(collection(db, FINANCIAL_DATA_COLLECTION), {
      ...financialData,
      companyId,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async getFinancialData(companyId, startDate, endDate) {
    const q = query(
      collection(db, FINANCIAL_DATA_COLLECTION),
      where('companyId', '==', companyId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
}; 