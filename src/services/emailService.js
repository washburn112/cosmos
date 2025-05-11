import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const EMAIL_TEMPLATES_COLLECTION = 'email_templates';
const EMAIL_HISTORY_COLLECTION = 'email_history';

export const emailService = {
  async sendWelcomeEmail(userId, userEmail, userName) {
    try {
      // In a real implementation, this would call the SendGrid API
      // For now, we'll simulate sending an email
      const template = await this.getEmailTemplate('welcome');
      const emailContent = this.replaceTemplateVariables(template, {
        userName,
        loginUrl: `${window.location.origin}/login`,
      });

      // Store email history
      await this.storeEmailHistory(userId, 'welcome', emailContent);

      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  async sendReportEmail(userId, reportData) {
    try {
      const template = await this.getEmailTemplate('report');
      const emailContent = this.replaceTemplateVariables(template, {
        reportDate: new Date().toLocaleDateString(),
        reportSummary: this.generateReportSummary(reportData),
        reportUrl: `${window.location.origin}/reports/${reportData.id}`,
      });

      await this.storeEmailHistory(userId, 'report', emailContent);

      return true;
    } catch (error) {
      console.error('Error sending report email:', error);
      throw error;
    }
  },

  async getEmailTemplate(templateName) {
    try {
      const q = query(
        collection(db, EMAIL_TEMPLATES_COLLECTION),
        where('name', '==', templateName)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return this.getDefaultTemplate(templateName);
      }

      return querySnapshot.docs[0].data().content;
    } catch (error) {
      console.error('Error getting email template:', error);
      return this.getDefaultTemplate(templateName);
    }
  },

  async storeEmailHistory(userId, type, content) {
    try {
      await addDoc(collection(db, EMAIL_HISTORY_COLLECTION), {
        userId,
        type,
        content,
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error storing email history:', error);
      throw error;
    }
  },

  replaceTemplateVariables(template, variables) {
    let content = template;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return content;
  },

  generateReportSummary(reportData) {
    // Generate a summary of the report data
    const summary = {
      totalRevenue: this.formatCurrency(reportData.consolidatedMetrics.totalRevenue),
      totalEbitda: this.formatCurrency(reportData.consolidatedMetrics.totalEbitda),
      totalCashflow: this.formatCurrency(reportData.consolidatedMetrics.totalCashflow),
      totalHeadcount: reportData.consolidatedMetrics.totalHeadcount,
    };

    return `
      Financial Summary:
      - Total Revenue: ${summary.totalRevenue}
      - Total EBITDA: ${summary.totalEbitda}
      - Total Cashflow: ${summary.totalCashflow}
      - Total Headcount: ${summary.totalHeadcount}
    `;
  },

  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  },

  getDefaultTemplate(templateName) {
    const templates = {
      welcome: `
        Welcome to Cosmos, {{userName}}!
        
        Thank you for joining our family office management platform. We're excited to help you manage your investments and operating companies more effectively.
        
        You can access your account here: {{loginUrl}}
        
        Best regards,
        The Cosmos Team
      `,
      report: `
        Financial Report Summary
        
        Date: {{reportDate}}
        
        {{reportSummary}}
        
        View the full report here: {{reportUrl}}
        
        Best regards,
        The Cosmos Team
      `,
    };

    return templates[templateName] || '';
  },
}; 