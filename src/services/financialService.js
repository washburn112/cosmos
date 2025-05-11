import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
} from 'firebase/firestore';
import { db } from '../firebase';

const FINANCIAL_DATA_COLLECTION = 'financial_data';

export const financialService = {
  // Financial data operations
  async addFinancialData(companyId, data) {
    const docRef = await addDoc(collection(db, FINANCIAL_DATA_COLLECTION), {
      ...data,
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

  // Report generation
  async generateCompanyReport(companyId, startDate, endDate) {
    const financialData = await this.getFinancialData(companyId, startDate, endDate);
    
    // Calculate key metrics
    const metrics = {
      revenue: this.calculateMetric(financialData, 'revenue'),
      ebitda: this.calculateMetric(financialData, 'ebitda'),
      cashflow: this.calculateMetric(financialData, 'cashflow'),
      headcount: this.calculateMetric(financialData, 'headcount'),
      arAging: this.calculateMetric(financialData, 'arAging'),
    };

    return {
      companyId,
      startDate,
      endDate,
      metrics,
      rawData: financialData,
    };
  },

  async generateConsolidatedReport(investmentId, startDate, endDate) {
    // Get all companies for the investment
    const companies = await this.getCompaniesForInvestment(investmentId);
    
    // Generate reports for each company
    const companyReports = await Promise.all(
      companies.map(company => this.generateCompanyReport(company.id, startDate, endDate))
    );

    // Calculate consolidated metrics
    const consolidatedMetrics = {
      totalRevenue: this.sumMetrics(companyReports, 'metrics.revenue'),
      totalEbitda: this.sumMetrics(companyReports, 'metrics.ebitda'),
      totalCashflow: this.sumMetrics(companyReports, 'metrics.cashflow'),
      totalHeadcount: this.sumMetrics(companyReports, 'metrics.headcount'),
      totalArAging: this.sumMetrics(companyReports, 'metrics.arAging'),
    };

    return {
      investmentId,
      startDate,
      endDate,
      consolidatedMetrics,
      companyReports,
    };
  },

  // Helper functions
  calculateMetric(data, metricName) {
    if (!data.length) return null;

    const values = data.map(item => item[metricName]).filter(val => val !== undefined);
    if (!values.length) return null;

    return {
      current: values[values.length - 1],
      previous: values[values.length - 2] || null,
      change: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : null,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  },

  sumMetrics(reports, metricPath) {
    return reports.reduce((sum, report) => {
      const value = this.getNestedValue(report, metricPath);
      return sum + (value || 0);
    }, 0);
  },

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  },

  async getCompaniesForInvestment(investmentId) {
    const q = query(
      collection(db, 'operating_companies'),
      where('investmentId', '==', investmentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
}; 