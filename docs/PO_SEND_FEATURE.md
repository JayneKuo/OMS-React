# PO Send Feature Implementation

## Overview
Implemented a complete email sending feature for Purchase Orders (PO) that allows users to send PO documents to suppliers via email with PDF attachments. The PDF follows US industry standards for professional purchase order documentation.

## Components Created

### 1. POSendDialog Component
**Location:** `components/purchase/po-send-dialog.tsx`

**Features:**
- ✅ **Sender Email Configuration** - Set custom "From" email address
- ✅ Multiple recipient management (To field)
- ✅ CC field support
- ✅ Email validation
- ✅ Customizable subject and body
- ✅ **US Standard PDF Generation** - Professional PO format
- ✅ **PDF Preview** - Opens in new window with print/download options
- ✅ Auto-populated default values from PO data
- ✅ Loading states for PDF generation and email sending
- ✅ Success/error toast notifications
- ✅ Responsive design with dark mode support

**Props:**
```typescript
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

interface SendEmailData {
  from: string              // Sender email address
  recipients: string[]      // To recipients
  cc?: string[]            // CC recipients (optional)
  subject: string          // Email subject
  body: string             // Email body
  attachPDF: boolean       // Whether to attach PDF
}
```

**Key Functionality:**
1. **Sender Configuration**: Set custom "From" email address for the sender
2. **Recipient Management**: Add/remove multiple email addresses with validation
3. **PDF Generation**: Opens US standard PO PDF in new window
4. **PDF Preview**: Full-featured preview with print and download capabilities
5. **Email Sending**: Validates all required fields before sending
6. **Default Content**: Auto-generates professional email body with PO details

### 2. PO PDF Preview Page
**Location:** `app/po-pdf-preview/page.tsx`

**Features:**
- ✅ **US Industry Standard Format** - 8.5" x 11" letter size
- ✅ Professional header with PO number and dates
- ✅ Buyer (From) and Vendor (To) information sections
- ✅ Ship To address section
- ✅ Terms & Conditions (Payment, Shipping, Delivery)
- ✅ Detailed line items table with:
  - Line number, Part number, Description
  - Quantity, Unit of Measure (UOM)
  - Unit Price, Tax Rate, Line Amount
- ✅ Financial summary (Subtotal, Tax, Total)
- ✅ Notes and special instructions section
- ✅ Signature lines for approval
- ✅ Print-optimized layout with proper page breaks
- ✅ Download PDF functionality
- ✅ Professional footer with company information

**PDF Layout Sections:**
1. **Header**: PO number, dates, "This is not an invoice" disclaimer
2. **Company Information Grid**: Buyer and Vendor details side-by-side
3. **Shipping & Terms Grid**: Ship To address and Terms & Conditions
4. **Line Items Table**: Comprehensive product details with pricing
5. **Totals Section**: Subtotal, Tax, and Grand Total
6. **Notes**: Special instructions and delivery requirements
7. **Signatures**: Prepared By and Approved By with dates
8. **Footer**: Terms acceptance and contact information

## Integration Points

### 1. PO List Page
**Location:** `app/purchase/po/page.tsx`

**Changes:**
- Added import for `POSendDialog`
- Added state management for dialog visibility and current PO
- Updated "Send" action in NEW status to open the dialog
- Added dialog component at the end of the page

**Usage:**
```typescript
// State
const [showSendDialog, setShowSendDialog] = useState(false)
const [currentPOForSend, setCurrentPOForSend] = useState<PurchaseOrder | null>(null)

// Action
{ label: t('send'), action: () => {
  setCurrentPOForSend(row)
  setShowSendDialog(true)
}}

// Dialog
<POSendDialog
  open={showSendDialog}
  onOpenChange={setShowSendDialog}
  poData={{...}}
  onSend={handleSendPO}
/>
```

### 2. PO Detail Page
**Location:** `app/purchase/po/[id]/page.tsx`

**Changes:**
- Added import for `POSendDialog`
- Added state management for dialog visibility
- Updated "Send" button action in DRAFT and CREATED statuses
- Added dialog component at the end of the page

**Usage:**
```typescript
// State
const [showSendDialog, setShowSendDialog] = useState(false)

// Action
{ label: "发送", icon: <Send />, action: () => setShowSendDialog(true) }

// Dialog
<POSendDialog
  open={showSendDialog}
  onOpenChange={setShowSendDialog}
  poData={{...}}
  onSend={handleSendPO}
/>
```

### 3. Test Page
**Location:** `app/po-send-test/page.tsx`

A standalone test page to demonstrate and test the Send dialog functionality.

**Access:** Navigate to `/po-send-test` in the application

## User Flow

1. **Open Dialog**: User clicks "Send" button on PO list or detail page
2. **Review PO Info**: Dialog displays PO summary (number, supplier, amount)
3. **Set Sender Email**: 
   - Default sender email pre-filled (purchasing@company.com)
   - Can be customized to any valid email address
4. **Add Recipients**: 
   - Default recipient pre-filled from supplier email
   - Add additional recipients by typing email and clicking "+"
   - Add CC recipients (optional)
   - Remove recipients by clicking "X" on badge
   - Email validation prevents invalid addresses
5. **Customize Email**:
   - Subject is auto-generated but editable
   - Email body is pre-filled with professional template but editable
6. **Generate PDF**:
   - Click "Generate PDF" button
   - Opens US standard PO PDF in new window
   - PDF is immediately available for preview
   - Success indicator shows PDF is ready
7. **Preview PDF** (Optional):
   - Click "Preview" button to re-open PDF window
   - PDF includes:
     - Professional header and company information
     - Complete line items with pricing
     - Terms and conditions
     - Signature lines
   - Print directly from preview window
   - Download as PDF file
8. **Send Email**:
   - Click "Send" button
   - Validation ensures:
     - At least one recipient
     - Valid subject
     - PDF has been generated
   - Loading state during send
   - Success toast notification with recipient list
   - Dialog closes automatically

## Design System Compliance

The component follows the OMS React Design System:

- **Colors**: Uses CSS variables for all colors
- **Typography**: Follows type scale (text-sm, text-base, etc.)
- **Spacing**: Uses 8px increments (gap-2, gap-3, gap-4, etc.)
- **Components**: Reuses existing shadcn/ui components
- **Dark Mode**: Full dark mode support with proper color variants
- **Accessibility**: Proper focus states, ARIA labels, keyboard navigation

## API Integration Points

The implementation is ready for backend integration. Replace the simulated functions with actual API calls:

### 1. PDF Generation (Server-Side)
For production, implement server-side PDF generation using libraries like:
- **Node.js**: `puppeteer`, `pdfkit`, or `jsPDF`
- **Python**: `ReportLab`, `WeasyPrint`
- **Java**: `iText`, `Apache PDFBox`

```typescript
// Current (opens preview page)
window.open(`/po-pdf-preview?poNo=${poData.orderNo}`, '_blank')

// Replace with API endpoint
const response = await fetch(`/api/po/${poData.orderNo}/generate-pdf`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    poId: poData.orderNo,
    includeLineItems: true,
    includeTerms: true
  })
})
const { pdfUrl } = await response.json()
setPdfUrl(pdfUrl)
```

### 2. PDF Preview
```typescript
// Current (opens preview page)
window.open(pdfUrl, '_blank')

// With API
window.open(`/api/po/${poData.orderNo}/pdf`, '_blank')
```

### 3. Email Sending
```typescript
// Current (simulated)
await new Promise(resolve => setTimeout(resolve, 2000))

// Replace with
const response = await fetch('/api/po/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: emailData.from,
    poId: poData.orderNo,
    recipients: emailData.recipients,
    cc: emailData.cc,
    subject: emailData.subject,
    body: emailData.body,
    attachPDF: true,
    pdfUrl: pdfUrl  // URL to generated PDF
  })
})

if (!response.ok) {
  throw new Error('Failed to send email')
}
```

### 4. Backend Email Service Integration
Integrate with email service providers:
- **SendGrid**: Enterprise email delivery
- **AWS SES**: Amazon Simple Email Service
- **Mailgun**: Developer-friendly email API
- **SMTP**: Direct SMTP server integration

Example with SendGrid:
```javascript
// Backend API endpoint
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  from: emailData.from,
  to: emailData.recipients,
  cc: emailData.cc,
  subject: emailData.subject,
  text: emailData.body,
  html: convertToHtml(emailData.body),
  attachments: [
    {
      content: pdfBase64,
      filename: `${poData.orderNo}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ]
}

await sgMail.send(msg)
```

## Testing

### Manual Testing
1. **Test Page**: Navigate to `/po-send-test` to test the dialog in isolation
2. **PO List**: Navigate to `/purchase/po` and click "Send" on a NEW status PO
3. **PO Detail**: Navigate to `/purchase/po/[id]` and click "Send" button in header
4. **PDF Preview**: Navigate to `/po-pdf-preview?poNo=PO202403150001` to view PDF directly

### Test Cases

#### Email Dialog
- ✅ Set custom sender email address
- ✅ Add/remove recipients
- ✅ Email validation (invalid format shows error)
- ✅ Duplicate email prevention
- ✅ CC field functionality
- ✅ Subject and body editing
- ✅ PDF generation opens new window
- ✅ PDF preview button (disabled until generated)
- ✅ Send button validation (requires recipients and PDF)
- ✅ Loading states
- ✅ Success/error notifications
- ✅ Dialog close/cancel
- ✅ Dark mode appearance

#### PDF Preview
- ✅ Professional US standard layout
- ✅ All PO information displayed correctly
- ✅ Line items table with proper formatting
- ✅ Financial calculations (subtotal, tax, total)
- ✅ Print functionality
- ✅ Download functionality
- ✅ Responsive layout
- ✅ Print-optimized styling (proper page breaks)
- ✅ Company branding and footer

## Future Enhancements

### Email Features
1. **Email Templates**: Add multiple email templates for different scenarios
2. **Attachment Management**: Allow adding additional attachments beyond PDF
3. **Email History**: Track sent emails in PO detail page with timestamps
4. **Scheduled Sending**: Allow scheduling emails for later delivery
5. **Email Tracking**: Track when emails are opened/read (read receipts)
6. **Bulk Send**: Send multiple POs in one operation
7. **Email Signature**: Add customizable company email signature
8. **Reply-To Configuration**: Set custom reply-to addresses
9. **Send Test Email**: Send test email before actual send
10. **Email Templates Library**: Save and reuse custom email templates

### PDF Features
1. **Custom PDF Branding**: Add company logo and custom branding
2. **PDF Templates**: Multiple PDF layouts (detailed, summary, international)
3. **Multi-Language PDFs**: Generate PDFs in different languages
4. **Digital Signatures**: Add digital signatures to PDFs
5. **Watermarks**: Add "DRAFT" or "COPY" watermarks
6. **QR Codes**: Add QR codes for quick PO lookup
7. **Barcode Integration**: Add barcodes for warehouse scanning
8. **Custom Fields**: Allow adding custom fields to PDF
9. **PDF Compression**: Optimize PDF file size
10. **PDF/A Compliance**: Generate archival-quality PDFs

### Integration Features
1. **ERP Integration**: Sync with ERP systems (SAP, Oracle, etc.)
2. **Document Management**: Store PDFs in document management systems
3. **Audit Trail**: Complete audit trail of all email sends
4. **Approval Workflow**: Require approval before sending
5. **Supplier Portal**: Allow suppliers to acknowledge receipt via portal

## Files Created/Modified

### New Files
1. `components/purchase/po-send-dialog.tsx` - Email send dialog component
2. `app/po-pdf-preview/page.tsx` - US standard PO PDF preview page
3. `app/po-send-test/page.tsx` - Test page for send functionality
4. `lib/company-config.ts` - Company configuration management
5. `app/company-settings/page.tsx` - Company settings UI page
6. `docs/PO_SEND_FEATURE.md` - This documentation

### Modified Files
1. `app/purchase/po/page.tsx` - Added Send dialog integration to PO list
2. `app/purchase/po/[id]/page.tsx` - Added Send dialog integration to PO detail

## Dependencies

All dependencies are already in the project:
- React
- shadcn/ui components (Dialog, Button, Input, Textarea, Badge, etc.)
- lucide-react icons
- sonner (toast notifications)
- i18n provider (for translations)

No additional npm packages required.

## Configuration

### Company Information Setup

The PDF footer and buyer information come from the company configuration. There are three ways to set this up:

#### 1. Using the Company Settings Page (Recommended)
Navigate to `/company-settings` to configure:
- ✅ Company name and legal name
- ✅ Address information
- ✅ Contact details (phone, email, website)
- ✅ Department contacts (purchasing, accounts payable)
- ✅ Tax ID and business registration
- ✅ PDF footer text and terms & conditions

**All fields are optional except company name.** If fields are not provided, the PDF will gracefully handle missing information.

#### 2. Editing the Configuration File
Edit `lib/company-config.ts` and update the `defaultCompanyConfig` object:

```typescript
export const defaultCompanyConfig: CompanyConfig = {
  companyName: "Your Company Name",
  address: "1234 Business Park Drive",
  city: "Los Angeles",
  state: "CA",
  zipCode: "90001",
  country: "United States",
  phone: "+1 (555) 123-4567",
  email: "info@yourcompany.com",
  purchasingEmail: "purchasing@yourcompany.com",
  taxId: "12-3456789",
  pdfFooterText: "Your custom footer text",
  pdfTermsAndConditions: "Your terms and conditions",
  // ... other fields
}
```

#### 3. API Integration (Production)
In production, implement API endpoints to:
- Fetch company config: `GET /api/company/config`
- Update company config: `PUT /api/company/config`
- Store in database with multi-tenant support

Update the functions in `lib/company-config.ts`:
```typescript
export async function getCompanyConfig(): Promise<CompanyConfig> {
  const response = await fetch('/api/company/config')
  return response.json()
}

export async function updateCompanyConfig(config: Partial<CompanyConfig>): Promise<void> {
  await fetch('/api/company/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
}
```

### Handling Missing Information

The PDF preview page **gracefully handles missing company information**:

- ✅ **Missing address fields**: Only displays available fields
- ✅ **Missing contact info**: Skips empty fields in footer
- ✅ **Missing footer text**: Uses default professional text
- ✅ **Missing terms**: Uses standard terms and conditions

Example of conditional rendering:
```typescript
{buyerInfo.phone && <p>Phone: {buyerInfo.phone}</p>}
{buyerInfo.email && <p>Email: {buyerInfo.email}</p>}
```

The footer will display:
- Custom footer text if configured, otherwise default text
- Company name, phone, and email (if available)
- Website (if configured)
- All fields are optional and won't break the PDF if missing
