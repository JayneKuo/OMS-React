"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Phone, Globe, FileText, Save } from "lucide-react"
import { getCompanyConfigSync, updateCompanyConfig, type CompanyConfig } from "@/lib/company-config"
import { toast } from "sonner"

export default function CompanySettingsPage() {
  const [config, setConfig] = React.useState<CompanyConfig>(getCompanyConfigSync())
  const [isSaving, setIsSaving] = React.useState(false)

  const handleChange = (field: keyof CompanyConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateCompanyConfig(config)
      toast.success("Company settings saved successfully")
    } catch (error) {
      toast.error("Failed to save company settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your company information for PDF documents and email communications
          </p>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Company name and legal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name</Label>
                <Input
                  id="legalName"
                  value={config.legalName || ''}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  placeholder="Your Company Legal Name Inc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Address Information
            </CardTitle>
            <CardDescription>
              Company address for purchase orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={config.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="1234 Business Park Drive"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={config.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={config.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  value={config.zipCode || ''}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="90001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={config.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="United States"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              General contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={config.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@yourcompany.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                value={config.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="www.yourcompany.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Department Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Department Contacts
            </CardTitle>
            <CardDescription>
              Specific department contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasingEmail">Purchasing Email</Label>
                <Input
                  id="purchasingEmail"
                  type="email"
                  value={config.purchasingEmail || ''}
                  onChange={(e) => handleChange('purchasingEmail', e.target.value)}
                  placeholder="purchasing@yourcompany.com"
                />
                <p className="text-xs text-muted-foreground">
                  Used as default sender for PO emails
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasingPhone">Purchasing Phone</Label>
                <Input
                  id="purchasingPhone"
                  value={config.purchasingPhone || ''}
                  onChange={(e) => handleChange('purchasingPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountsPayableEmail">Accounts Payable Email</Label>
              <Input
                id="accountsPayableEmail"
                type="email"
                value={config.accountsPayableEmail || ''}
                onChange={(e) => handleChange('accountsPayableEmail', e.target.value)}
                placeholder="ap@yourcompany.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax & Legal Information
            </CardTitle>
            <CardDescription>
              Tax ID and business registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  value={config.taxId || ''}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  placeholder="12-3456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
                <Input
                  id="businessRegistrationNumber"
                  value={config.businessRegistrationNumber || ''}
                  onChange={(e) => handleChange('businessRegistrationNumber', e.target.value)}
                  placeholder="BR123456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF Document Settings
            </CardTitle>
            <CardDescription>
              Customize text that appears on PDF documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdfFooterText">PDF Footer Text</Label>
              <Textarea
                id="pdfFooterText"
                value={config.pdfFooterText || ''}
                onChange={(e) => handleChange('pdfFooterText', e.target.value)}
                placeholder="This Purchase Order is subject to the terms and conditions stated herein."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Appears at the bottom of purchase order PDFs
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfTermsAndConditions">PDF Terms & Conditions</Label>
              <Textarea
                id="pdfTermsAndConditions"
                value={config.pdfTermsAndConditions || ''}
                onChange={(e) => handleChange('pdfTermsAndConditions', e.target.value)}
                placeholder="Please acknowledge receipt of this order and confirm acceptance of terms within 24 hours."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Additional terms that appear in the PDF footer
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setConfig(getCompanyConfigSync())}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  How this information is used:
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• <strong>Purchase Orders:</strong> Company info appears in the "From (Buyer)" section</li>
                  <li>• <strong>Email Communications:</strong> Purchasing email is used as default sender</li>
                  <li>• <strong>PDF Footer:</strong> Contact info and terms appear at the bottom of PDFs</li>
                  <li>• <strong>Legal Compliance:</strong> Tax ID appears on all purchase documents</li>
                </ul>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                  <strong>Note:</strong> In production, this data should be stored in a database and fetched via API.
                  Currently using local configuration for demonstration purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
