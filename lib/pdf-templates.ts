/**
 * PDF Template Configurations
 * 
 * Define different PDF layout templates for purchase orders
 */

export type PDFTemplate = 'standard' | 'compact' | 'detailed' | 'minimal'

export interface PDFTemplateConfig {
  id: PDFTemplate
  name: string
  description: string
  features: string[]
  preview?: string
}

export const pdfTemplates: PDFTemplateConfig[] = [
  {
    id: 'standard',
    name: 'Standard US Format',
    description: 'Professional US business standard layout with all details',
    features: [
      'Full company information',
      'Detailed line items table',
      'Terms and conditions',
      'Signature lines',
      'Professional footer'
    ]
  },
  {
    id: 'compact',
    name: 'Compact Format',
    description: 'Space-efficient layout for shorter documents',
    features: [
      'Condensed header',
      'Simplified line items',
      'Essential information only',
      'Single page preferred'
    ]
  },
  {
    id: 'detailed',
    name: 'Detailed Format',
    description: 'Comprehensive layout with extended information',
    features: [
      'Extended product descriptions',
      'Additional notes section',
      'Detailed terms',
      'Multiple signature lines',
      'Shipping instructions'
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Format',
    description: 'Clean and simple layout with essential information only',
    features: [
      'Basic company info',
      'Simple line items',
      'No decorative elements',
      'Quick print format'
    ]
  }
]

export function getPDFTemplate(templateId: PDFTemplate): PDFTemplateConfig {
  return pdfTemplates.find(t => t.id === templateId) || pdfTemplates[0]
}

export function getDefaultTemplate(): PDFTemplate {
  return 'standard'
}
