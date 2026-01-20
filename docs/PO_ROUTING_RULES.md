# PO Order Routing Rules

## Overview
The PO Order Routing system allows you to automate purchase order processing based on configurable rules. This feature helps streamline operations by automatically handling receipts, warehouse assignments, and WMS integrations.

## Key Features

1. **Configurable Receipt Creation Triggers** - Set when receipts should be automatically created based on PO status
2. **WMS Push Triggers** - Define when to push data to downstream WMS systems
3. **Auto-Create Missing Products** - Automatically create product records when receiving unknown items
4. **Auto-Complete Receipt** - Automatically complete receiving process for local warehouses
5. **Virtual Warehouse Auto-Receive** - Skip physical receiving for virtual warehouses
6. **Warehouse-Specific Overrides** - Customize behavior for individual warehouses

## UI Structure

### Main Page Layout
The routing configuration page consists of three main sections:

1. **Page Header** - Title, description, and "New Routing Rule" button
2. **Rules List** - Display all configured routing rules with management actions
3. **Global Configuration** - Left navigation + right form layout for system-wide settings

### Rule Dialog Layout
When creating or editing a rule, a dialog opens with:
- **Left Navigation** - Three sections: Basic Info, Conditions, Actions
- **Right Content Area** - Form fields for the selected section
- **Footer** - Cancel and Save buttons

This layout matches the user's preferred structure for better organization and usability.

## Features

### 1. Rule Management
- **Create Rule**: Click "New Routing Rule" button to open dialog
- **Edit Rule**: Click menu (⋮) on rule card and select "Edit Rule"
- **Enable/Disable Rule**: Toggle rule status from menu
- **Delete Rule**: Remove rule permanently from menu
- **Priority Display**: Rules show priority badge (#1, #2, etc.)
- **Status Indicators**: Visual indicators for enabled/disabled state

### 2. Rule Configuration Sections

#### Basic Info
- Rule Name (required)
- Priority (lower number = higher priority)
- Description
- Enable/Disable toggle

#### Conditions
Define when the rule should apply (leave empty to match all):
- **Suppliers**: Add specific supplier names
- **Warehouses**: Add specific warehouse names
- **Product Categories**: Add specific categories

Each condition supports multiple values with badge display and easy removal.

#### Actions
Define what happens when conditions match:

**Auto Create Receipt**
- Toggle to enable/disable
- Automatically create receipt when PO arrives

**Auto Receive for Virtual Warehouse**
- Toggle to enable/disable
- Automatically mark as received for virtual warehouses

**Push to Downstream WMS**
- Toggle to enable/disable
- WMS API endpoint configuration (shown when enabled)

**Warehouse Routing**
- Routing Type: Single / Split by SKU / Split by Quantity
- Target Warehouses: Add multiple warehouses

### 3. Global Configuration
System-wide settings that apply to all warehouses unless overridden:

#### Auto-Create Receipt
- **Enable/Disable**: Toggle automatic receipt creation
- **Trigger Node**: Choose when to create receipt
  - PO Created
  - PO Sent to Supplier
  - ASN Received
  - In Transit
  - Expected Arrival Date (with configurable days before)
- **Days Before Arrival**: For "Expected Arrival" trigger, specify how many days in advance

#### Auto-Complete Receipt (Local Warehouse)
- **Enable/Disable**: Automatically complete receiving process when receipt is created
- Applies only to local/physical warehouses
- Skips manual receiving step for faster processing

#### Auto-Receive for Virtual Warehouses
- **Enable/Disable**: Toggle automatic receiving for virtual warehouses
- **Trigger Node**: Choose when to auto-receive
  - PO Sent to Supplier
  - ASN Received
  - In Transit
- No physical receiving required

#### Auto-Create Missing Products
- **Enable/Disable**: Automatically create product records when receiving items not in system
- Prevents receiving errors due to missing product data
- New products created with basic information from PO

#### Push to WMS
- **Enable/Disable**: Toggle automatic WMS push
- **Trigger Node**: Choose when to push data
  - PO Created
  - PO Sent to Supplier
  - ASN Received
  - In Transit
  - Receipt Created
- Configure WMS endpoint and authentication per warehouse

## Rule Evaluation

Rules are evaluated in priority order (1 = highest priority):
1. System checks all enabled rules in priority order
2. First rule that matches conditions is applied
3. Only one rule is applied per PO
4. If no rules match, default behavior applies

## UI Components Used

### From shadcn/ui
- Dialog (with custom layout)
- Card
- Button
- Input
- Label
- Switch
- Select
- Badge
- Separator
- DropdownMenu

### Icons (lucide-react)
- Package, Warehouse, Route (action indicators)
- Settings, Filter, Zap (section icons)
- Plus, Edit, Trash2, Power, PowerOff (actions)
- ChevronRight (navigation indicator)

## Design System Compliance

The implementation follows the OMS React Design System:
- **Colors**: Uses CSS variables for primary, muted, destructive
- **Typography**: text-sm, text-base, text-lg for hierarchy
- **Spacing**: gap-2, gap-3, gap-4, p-3, p-4, p-6 (8px increments)
- **Components**: Consistent with existing patterns
- **Dark Mode**: All components support dark mode via CSS variables

## Configuration Examples

### Example 1: Global Settings - Standard Physical Warehouse
```
Auto-Create Receipt: Enabled
  Trigger: ASN Received
  
Auto-Complete Receipt: Disabled (manual receiving required)

Auto-Receive Virtual: Enabled
  Trigger: PO Sent

Auto-Create Missing Products: Enabled

Push to WMS: Disabled
```

### Example 2: 3PL Warehouse Override
```
Warehouse: 3PL Partner - NJ
Type: 3PL

Auto-Create Receipt: Enabled
  Trigger: ASN Received
  
Auto-Complete Receipt: Disabled

Auto-Create Missing Products: Enabled

Push to WMS: Enabled
  Trigger: Receipt Created
  Endpoint: https://3pl-partner.com/api/v1/inbound
```

### Example 3: Local Warehouse with Auto-Complete
```
Warehouse: Main Warehouse - LA
Type: Physical

Auto-Create Receipt: Enabled
  Trigger: In Transit
  
Auto-Complete Receipt: Enabled (skip manual receiving)

Auto-Create Missing Products: Disabled

Push to WMS: Disabled
```

### Example 4: Virtual Warehouse (Dropship)
```
Warehouse: Virtual WH - Dropship
Type: Virtual

Auto-Create Receipt: Disabled (not needed)

Auto-Receive Virtual: Enabled
  Trigger: PO Sent

Auto-Create Missing Products: Enabled

Push to WMS: Disabled
```

## Trigger Node Definitions

### Receipt Creation Triggers
- **PO Created**: Receipt created immediately when PO is created
- **PO Sent**: Receipt created when PO is sent to supplier
- **ASN Received**: Receipt created when Advanced Shipping Notice is received
- **In Transit**: Receipt created when shipment is in transit
- **Expected Arrival**: Receipt created X days before expected arrival date

### Virtual Warehouse Auto-Receive Triggers
- **PO Sent**: Auto-receive when PO is sent to supplier
- **ASN Received**: Auto-receive when ASN is received
- **In Transit**: Auto-receive when shipment is in transit

### WMS Push Triggers
- **PO Created**: Push data immediately when PO is created
- **PO Sent**: Push data when PO is sent to supplier
- **ASN Received**: Push data when ASN is received
- **In Transit**: Push data when shipment is in transit
- **Receipt Created**: Push data when receipt is created in system

## Warehouse Type Behaviors

### Physical Warehouse
- Can use auto-create receipt
- Can use auto-complete receipt (skip manual receiving)
- Can use auto-create missing products
- Can push to WMS

### Virtual Warehouse
- Uses auto-receive instead of receipt creation
- No physical receiving process
- Can use auto-create missing products
- Can push to WMS

### 3PL Warehouse
- Typically uses auto-create receipt
- Usually pushes to 3PL's WMS system
- May use auto-create missing products
- Receipt completion depends on 3PL integration

## Implementation Files

- `/app/automation/purchase-order/routing/page.tsx` - Main routing configuration page
- `/docs/PO_ROUTING_RULES.md` - Documentation

## Business Logic Flow

### Receipt Creation Flow
```
1. PO reaches configured trigger node
2. System checks if auto-create receipt is enabled
3. If enabled:
   a. Create receipt record
   b. If auto-complete is enabled AND warehouse is local:
      - Mark receipt as completed
      - Update inventory
   c. If auto-create product is enabled:
      - Check for missing products
      - Create product records as needed
4. If WMS push is enabled and trigger matches:
   - Send data to WMS endpoint
```

### Virtual Warehouse Flow
```
1. PO reaches configured trigger node
2. System checks if auto-receive is enabled
3. If enabled:
   a. Skip receipt creation
   b. Mark PO as received
   c. Update inventory directly
   d. If auto-create product is enabled:
      - Check for missing products
      - Create product records as needed
4. If WMS push is enabled and trigger matches:
   - Send data to WMS endpoint
```

## Best Practices

1. **Receipt Triggers**: Use "ASN Received" or "In Transit" for most physical warehouses
2. **Auto-Complete**: Only enable for trusted local warehouses with reliable processes
3. **Auto-Create Products**: Enable for dropship/3PL scenarios where product data may be incomplete
4. **WMS Push**: Use "Receipt Created" trigger for 3PL integrations to ensure data accuracy
5. **Virtual Warehouses**: Use "PO Sent" trigger for fastest processing
6. **Testing**: Always test warehouse overrides before enabling globally

## Troubleshooting

### Receipt Not Created
- Check if trigger node has been reached
- Verify auto-create receipt is enabled
- Check warehouse-specific override settings

### WMS Push Failed
- Verify WMS endpoint is correct
- Check authentication credentials
- Ensure trigger node matches configuration
- Review WMS system logs

### Product Creation Issues
- Verify auto-create product is enabled
- Check product data in PO is complete
- Review product creation logs

---

**Last Updated**: 2025-01-07
**Version**: 3.0 (Added trigger nodes, auto-complete, and auto-create product features)
