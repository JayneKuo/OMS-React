---
inclusion: always
---

# OMS React Design System Rules

This file contains the design system rules for the OMS React project, based on the Item Design System and existing component library.

## Color System

### Primary Colors
- Primary: `hsl(var(--primary))` (#753BBD - Purple)
- Primary Foreground: `hsl(var(--primary-foreground))` (White on purple)
- Accent: #F97316 (Orange)

### Semantic Colors
- Success: `hsl(var(--success))` (#15803D)
- Warning: `hsl(var(--warning))` (#e79f04) 
- Destructive: `hsl(var(--destructive))` (#F0283C)
- Info: #666666

### Text Colors
- Foreground: `hsl(var(--foreground))` (#181818 light / #ffffff dark)
- Muted Foreground: `hsl(var(--muted-foreground))` (#666666 light / #999999 dark)

### Background Colors
- Background: `hsl(var(--background))`
- Card: `hsl(var(--card))`
- Muted: `hsl(var(--muted))`

## Typography

### Font Family
- Primary: Satoshi (geometric sans-serif)
- Fallback: system fonts

### Type Scale (Tailwind Classes)
- H1: `text-6xl` (64px) - Hero headlines
- H2: `text-5xl` (48px) - Page titles  
- H3: `text-4xl` (36px) - Section headers
- H4: `text-3xl` (24px) - Subsection headers
- H5: `text-2xl` (20px) - Card titles
- H6: `text-xl` (18px) - Small headings
- Body Large: `text-lg` (18px)
- Body: `text-base` (16px) - Default
- Small: `text-sm` (14px) - Labels, buttons
- Extra Small: `text-xs` (12px) - Captions

### Font Weights
- Light: `font-light`
- Regular: `font-normal`
- Medium: `font-medium`
- Semibold: `font-semibold`
- Bold: `font-bold`

## Spacing System

### Spacing Scale (8px base unit)
- xs: `space-1` (4px)
- sm: `space-2` (8px)
- md: `space-4` (16px)
- lg: `space-6` (24px)
- xl: `space-8` (32px)
- 2xl: `space-12` (48px)
- 3xl: `space-16` (64px)

### Common Patterns
- Tight gaps: `gap-2` (8px)
- Normal gaps: `gap-3` (12px)
- Comfortable gaps: `gap-4` (16px)
- Spacious gaps: `gap-6` (24px)

## Component Patterns

### Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- Outline: `border border-input hover:bg-accent`
- Ghost: `hover:bg-accent hover:text-accent-foreground`
- Destructive: `bg-destructive text-destructive-foreground`

### Button Sizes
- Small: `h-9 px-3` (size="sm")
- Default: `h-10 px-4`
- Large: `h-11 px-8` (size="lg")
- Icon: `h-9 w-9` (size="icon")

### Cards
- Container: `bg-card text-card-foreground border rounded-lg`
- Padding: `p-6` (24px) for content
- Header: `pt-6` (24px top padding)

### Status Badges
- Success: `bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`
- Warning: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`
- Info: `bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`
- Danger: `bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`

### Navigation States
- Active: `bg-primary text-primary-foreground`
- Hover: `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`
- Disabled: `opacity-50 cursor-not-allowed`

### Form Elements
- Input: `h-10 px-3 py-2 border border-input rounded-md`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### Data Tables
- Header: `bg-muted/50 text-sm font-medium p-3`
- Body: `text-xs p-3`
- Row hover: `hover:bg-muted/50`

## Layout Patterns

### Page Structure
- Container: `space-y-6` (24px vertical spacing)
- Page title: `text-3xl font-semibold tracking-tight`
- Description: `text-sm text-muted-foreground mt-2`

### Grid Systems
- Card grid: `gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4`
- Form grid: `gap-4 grid-cols-1 md:grid-cols-2`

## Accessibility Requirements

### Focus States
- Ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Outline: `focus-visible:outline-none`

### Touch Targets
- Minimum: 40px (`h-10`)
- Icon buttons: 36px (`h-9 w-9`)

### Color Contrast
- Text on background: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Minimum 3:1

## Dark Mode Support

All components must include dark mode variants using the `.dark` selector or CSS variables that automatically adapt.

## Implementation Rules

1. **Always use CSS variables** for colors, not hardcoded hex values
2. **Follow the type scale** - don't invent custom font sizes
3. **Use spacing tokens** - stick to 8px increments (4, 8, 16, 24, 32, 48, 64)
4. **Include dark mode** - define both light and dark variants
5. **Semantic color usage** - Green=Success, Yellow=Warning, Red=Danger, Gray=Info
6. **Accessibility first** - sufficient contrast, proper hierarchy, focus states

## Component Library

The project uses:
- **shadcn/ui** for base components
- **Tailwind CSS** for styling
- **Custom components** in `/components/ui/`
- **Business components** in `/components/purchase/`, `/components/data-table/`, etc.

## Existing Components

### UI Components
- Button, Card, Input, Select, Dialog, Table
- Badge, Checkbox, Tabs, Tooltip, Progress
- Command, Popover, Scroll Area, Separator

### Business Components  
- Data Table with filtering and search
- Status badges and selectors
- Purchase order dialogs
- Supplier management components
- Layout components (sidebar, header, tenant switcher)

When generating new components, reuse existing patterns and components rather than creating duplicates.