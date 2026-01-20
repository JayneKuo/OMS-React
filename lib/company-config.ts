/**
 * Company Configuration
 * 
 * This file contains company information used across the application,
 * especially for PDF generation and email communications.
 * 
 * In production, this should be:
 * 1. Stored in a database (company settings table)
 * 2. Fetched via API call
 * 3. Configurable through admin panel
 * 4. Support multi-tenant scenarios
 */

export interface CompanyConfig {
  // Basic Information
  companyName: string
  legalName?: string
  
  // Contact Information
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  
  // Tax & Legal
  taxId?: string
  businessRegistrationNumber?: string
  
  // Branding
  logo?: string
  primaryColor?: string
  
  // Departments
  purchasingEmail?: string
  purchasingPhone?: string
  accountsPayableEmail?: string
  
  // PDF Settings
  pdfFooterText?: string
  pdfTermsAndConditions?: string
}

// Default company configuration
// TODO: Replace with API call to fetch from database
export const defaultCompanyConfig: CompanyConfig = {
  companyName: "Your Company Name",
  legalName: "Your Company Legal Name Inc.",
  
  address: "1234 Business Park Drive",
  city: "Los Angeles",
  state: "CA",
  zipCode: "90001",
  country: "United States",
  
  phone: "+1 (555) 123-4567",
  email: "info@yourcompany.com",
  website: "www.yourcompany.com",
  
  taxId: "12-3456789",
  
  purchasingEmail: "purchasing@yourcompany.com",
  purchasingPhone: "+1 (555) 123-4567",
  
  pdfFooterText: "This Purchase Order is subject to the terms and conditions stated herein.",
  pdfTermsAndConditions: "Please acknowledge receipt of this order and confirm acceptance of terms within 24 hours.",
}

/**
 * Get company configuration
 * In production, this should fetch from API
 */
export async function getCompanyConfig(): Promise<CompanyConfig> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/company/config')
  // return response.json()
  
  return defaultCompanyConfig
}

/**
 * Get company configuration synchronously
 * Use this for client-side rendering when config is already loaded
 */
export function getCompanyConfigSync(): CompanyConfig {
  // In production, this might come from context or state management
  return defaultCompanyConfig
}

/**
 * Update company configuration
 * In production, this should call API to update database
 */
export async function updateCompanyConfig(config: Partial<CompanyConfig>): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch('/api/company/config', {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(config)
  // })
  
  console.log('Company config updated:', config)
}
