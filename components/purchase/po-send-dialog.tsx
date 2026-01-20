"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, FileText, Eye, Plus, X, Loader2, Building2, ChevronDown, ChevronUp, Layout } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { toast } from "sonner"
import { getCompanyConfigSync, type CompanyConfig } from "@/lib/company-config"
import { pdfTemplates, getDefaultTemplate, type PDFTemplate } from "@/lib/pdf-templates"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface POSendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poData: {
    orderNo: string
    supplierName: string
    supplierEmail?: string
    totalAmount: number
    currency: string
    itemCount: number
  }
  onSend?: (data: SendEmailData) => void
}

export interface SendEmailData {
  from: string
  recipients: string[]
  cc?: string[]
  subject: string
  body: string
  attachPDF: boolean
  pdfTemplate: string
}

export function POSendDialog({ open, onOpenChange, poData, onSend }: POSendDialogProps) {
  const { t } = useI18n()
  const [fromEmail, setFromEmail] = React.useState("")
  const [recipients, setRecipients] = React.useState<string[]>([])
  const [newRecipient, setNewRecipient] = React.useState("")
  const [cc, setCc] = React.useState<string[]>([])
  const [newCc, setNewCc] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [pdfGenerated, setPdfGenerated] = React.useState(false)
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null)
  
  // Company information state
  const [showCompanyInfo, setShowCompanyInfo] = React.useState(false)
  const [companyInfo, setCompanyInfo] = React.useState<CompanyConfig>(getCompanyConfigSync())
  
  // PDF template selection
  const [selectedTemplate, setSelectedTemplate] = React.useState<PDFTemplate>(getDefaultTemplate())

  // Initialize form with default values
  React.useEffect(() => {
    if (open) {
      // Load company config
      const config = getCompanyConfigSync()
      setCompanyInfo(config)
      
      // Set default from email
      setFromEmail(config.purchasingEmail || "purchasing@company.com")
      
      // Set default recipient from supplier email
      if (poData.supplierEmail && !recipients.includes(poData.supplierEmail)) {
        setRecipients([poData.supplierEmail])
      }
      
      // Set default subject
      setSubject(`Purchase Order ${poData.orderNo} - ${poData.supplierName}`)
      
      // Set default email body
      setBody(
        `Dear ${poData.supplierName},\n\n` +
        `Please find attached Purchase Order ${poData.orderNo} for your review and confirmation.\n\n` +
        `Order Summary:\n` +
        `- PO Number: ${poData.orderNo}\n` +
        `- Total Items: ${poData.itemCount}\n` +
        `- Total Amount: ${poData.currency} ${poData.totalAmount.toLocaleString()}\n\n` +
        `Please confirm receipt and provide your estimated delivery date.\n\n` +
        `Best regards`
      )
      
      setPdfGenerated(false)
      setPdfUrl(null)
      setShowCompanyInfo(false)
      setSelectedTemplate(getDefaultTemplate())
    }
  }, [open, poData])
  
  // Reset PDF when template changes
  React.useEffect(() => {
    if (pdfGenerated) {
      setPdfGenerated(false)
      setPdfUrl(null)
    }
  }, [selectedTemplate])

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Add recipient
  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return
    
    if (!isValidEmail(newRecipient)) {
      toast.error("Invalid email address")
      return
    }
    
    if (recipients.includes(newRecipient)) {
      toast.error("Email already added")
      return
    }
    
    setRecipients([...recipients, newRecipient])
    setNewRecipient("")
  }

  // Remove recipient
  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email))
  }

  // Add CC
  const handleAddCc = () => {
    if (!newCc.trim()) return
    
    if (!isValidEmail(newCc)) {
      toast.error("Invalid email address")
      return
    }
    
    if (cc.includes(newCc)) {
      toast.error("Email already added")
      return
    }
    
    setCc([...cc, newCc])
    setNewCc("")
  }

  // Remove CC
  const handleRemoveCc = (email: string) => {
    setCc(cc.filter(c => c !== email))
  }

  // Generate PDF preview
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true)
    
    try {
      // Pass company info and template as URL parameters
      const params = new URLSearchParams({
        poNo: poData.orderNo,
        template: selectedTemplate,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.address || '',
        companyCity: companyInfo.city || '',
        companyState: companyInfo.state || '',
        companyZip: companyInfo.zipCode || '',
        companyCountry: companyInfo.country || '',
        companyPhone: companyInfo.phone || '',
        companyEmail: companyInfo.email || '',
        companyTaxId: companyInfo.taxId || '',
      })
      
      const pdfWindow = window.open(`/po-pdf-preview?${params.toString()}`, '_blank', 'width=800,height=1000')
      
      if (pdfWindow) {
        setPdfGenerated(true)
        setPdfUrl(`/po-pdf-preview?${params.toString()}`)
        toast.success("PDF generated successfully")
      } else {
        toast.error("Please allow popups to preview PDF")
      }
    } catch (error) {
      toast.error("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Preview PDF
  const handlePreviewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'width=800,height=1000')
    }
  }

  // Send email
  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient")
      return
    }

    if (!subject.trim()) {
      toast.error("Please enter email subject")
      return
    }

    if (!pdfGenerated) {
      toast.error("Please generate PDF first")
      return
    }

    setIsSending(true)

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000))

      const emailData: SendEmailData = {
        from: fromEmail,
        recipients,
        cc: cc.length > 0 ? cc : undefined,
        subject,
        body,
        attachPDF: true,
        pdfTemplate: selectedTemplate,
      }

      onSend?.(emailData)
      
      toast.success(
        "Email sent successfully",
        {
          description: `Sent to ${recipients.join(', ')}`
        }
      )
      
      onOpenChange(false)
      
      // Reset form
      setRecipients([])
      setCc([])
      setNewRecipient("")
      setNewCc("")
      setPdfGenerated(false)
    } catch (error) {
      toast.error("Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {t('send') || "Send"} Purchase Order
          </DialogTitle>
          <DialogDescription>
            Send PO to supplier via email with PDF attachment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* PO Information */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('poNo') || "PO Number"}:</span>
              <Badge variant="outline" className="font-mono">{poData.orderNo}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('supplierName') || "Supplier"}:</span>
              <span className="text-sm">{poData.supplierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('totalAmount') || "Total Amount"}:</span>
              <span className="text-sm font-semibold">{poData.currency} {poData.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          {/* PDF Template Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              PDF Template
            </Label>
            <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as PDFTemplate)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {pdfTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Template Features */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {pdfTemplates.find(t => t.id === selectedTemplate)?.name} includes:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                {pdfTemplates.find(t => t.id === selectedTemplate)?.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          {/* Company Information (Collapsible) */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCompanyInfo(!showCompanyInfo)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Information (for PDF)
              </span>
              {showCompanyInfo ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showCompanyInfo && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  This information will appear in the PDF "From (Buyer)" section
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyName" className="text-xs">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyInfo.companyName}
                      onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
                      placeholder="Your Company Name"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyAddress" className="text-xs">Address</Label>
                    <Input
                      id="companyAddress"
                      value={companyInfo.address || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                      placeholder="1234 Business Park Drive"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyCity" className="text-xs">City</Label>
                    <Input
                      id="companyCity"
                      value={companyInfo.city || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                      placeholder="Los Angeles"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyState" className="text-xs">State</Label>
                    <Input
                      id="companyState"
                      value={companyInfo.state || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, state: e.target.value})}
                      placeholder="CA"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyZip" className="text-xs">ZIP Code</Label>
                    <Input
                      id="companyZip"
                      value={companyInfo.zipCode || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, zipCode: e.target.value})}
                      placeholder="90001"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyCountry" className="text-xs">Country</Label>
                    <Input
                      id="companyCountry"
                      value={companyInfo.country || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
                      placeholder="United States"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone" className="text-xs">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={companyInfo.phone || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail" className="text-xs">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyInfo.email || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                      placeholder="info@company.com"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyTaxId" className="text-xs">Tax ID</Label>
                    <Input
                      id="companyTaxId"
                      value={companyInfo.taxId || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                      placeholder="12-3456789"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  💡 Tip: These changes only apply to this PDF. To save as default, visit Company Settings.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* From Email */}
          <div className="space-y-2">
            <Label htmlFor="fromEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              From <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fromEmail"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="Enter sender email address"
            />
            <p className="text-xs text-muted-foreground">
              This email address will appear as the sender
            </p>
          </div>

          <Separator />

          {/* Recipients */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              To <span className="text-destructive">*</span>
            </Label>
            
            {/* Recipient list */}
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {recipients.map((email, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {email}
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Add recipient */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddRecipient()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddRecipient}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CC */}
          <div className="space-y-3">
            <Label>CC (Optional)</Label>
            
            {/* CC list */}
            {cc.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {cc.map((email, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {email}
                    <button
                      onClick={() => handleRemoveCc(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Add CC */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newCc}
                onChange={(e) => setNewCc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCc()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCc}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter email body"
              rows={8}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* PDF Attachment */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF Attachment
            </Label>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || pdfGenerated}
                className="flex-1"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : pdfGenerated ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Ready
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewPDF}
                disabled={!pdfGenerated}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
            
            {pdfGenerated && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{poData.orderNo}.pdf</span>
                  <span className="text-muted-foreground">(Ready)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            {t('cancel') || "Cancel"}
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !pdfGenerated || recipients.length === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t('send') || "Send"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
