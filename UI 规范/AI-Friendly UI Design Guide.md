 AI-Friendly UI Design Guide

  Based on Item Design System (design.item.com)

  ---
  1. Design System Overview

  Purpose

  A design system ensures brand consistency, professional presentation, and recognition across all
  touchpoints—digital, print, and co-branded materials.

  Core Principle

  Every interaction should accurately reflect brand values and distinctive personality.

  ---
  2. Logo Guidelines

  Logo Variants

  | Variant       | Use Case                               |
  |---------------|----------------------------------------|
  | Full Logo     | Primary usage with text                |
  | Logo Mark     | Standalone icon for brand recognition  |
  | Vertical Logo | Stacked layout for vertical spaces     |
  | Favicon       | Browser tabs, bookmarks (16x16, 32x32) |

  Clear Space

  - Minimum padding = height of logo mark on all sides
  - Ensures uncluttered visibility and legibility

  Do's ✅

  - Use original forms with clear visibility
  - Maintain correct proportions and colors
  - Select appropriate version for background
  - Preserve proper spacing

  Don'ts ❌

  - Alter colors or add gradients
  - Distort, rotate, or stretch
  - Add effects, strokes, or shadows
  - Place on cluttered backgrounds
  - Resize elements disproportionately

  ---
  3. Color System

  Primary Colors

  | Color  | Hex     | RGB           | Meaning        |
  |--------|---------|---------------|----------------|
  | White  | #FFFFFF | 255, 255, 255 | Clarity        |
  | Black  | #000000 | 0, 0, 0       | Elegance       |
  | Purple | #6B46C1 | 107, 70, 193  | Innovation     |
  | Orange | #F97316 | 249, 115, 22  | Dynamic energy |

  UI Theme Colors (Element Plus)

  | State   | Light Mode | Dark Mode |
  |---------|------------|-----------|
  | Primary | #753BBD    | #763ABF   |
  | Hover   | #9561D0    | #6C38AD   |
  | Active  | #A788E1    | #693f9d   |
  | Pressed | #5B2D94    | #5c2a9a   |

  Semantic Colors

  | Type    | Color   | Light Variant | Usage                            |
  |---------|---------|---------------|----------------------------------|
  | Success | #15803D | #DCFCE7       | Confirmations, completed actions |
  | Warning | #e79f04 | #FEF3C7       | Cautions, attention needed       |
  | Danger  | #F0283C | #FECACA       | Errors, destructive actions      |
  | Info    | #666666 | #DEDFE0       | Neutral information              |

  Text Colors

  | Level       | Light Mode | Dark Mode | Usage                    |
  |-------------|------------|-----------|--------------------------|
  | Primary     | #181818    | #ffffff   | Headings, important text |
  | Regular     | #3c3c3c    | #ffffff   | Body text                |
  | Secondary   | #666666    | #999999   | Captions, labels         |
  | Placeholder | #666666    | #737373   | Input placeholders       |
  | Disabled    | #6666665d  | #7373736d | Inactive elements        |

  CSS Variables Pattern

  /* Use semantic variables for consistency */
  color: hsl(var(--primary));
  background: hsl(var(--bg-color));
  border: 1px solid hsl(var(--border-color));

  ---
  4. Typography

  Primary Typeface

  Satoshi — A geometric sans-serif providing balance between professionalism and approachability.

  Font Weights

  - Light
  - Regular
  - Medium
  - Bold
  - Black

  Type Scale

  | Element    | Size Name   | Pixels | Use Case               |
  |------------|-------------|--------|------------------------|
  | H1         | 9x Large    | 128px  | Hero headlines         |
  | H2         | 8x Large    | 96px   | Page titles            |
  | H3         | 7x Large    | 64px   | Section headers        |
  | H4         | 6x Large    | 48px   | Subsection headers     |
  | H5         | 5x Large    | 36px   | Card titles            |
  | H6         | 4x Large    | 28px   | Small headings         |
  | Subtitle 1 | 3x Large    | 24px   | Lead paragraphs        |
  | Subtitle 2 | 2x Large    | 20px   | Secondary leads        |
  | Body 1     | Extra Large | 20px   | Large body text        |
  | Body 2     | Large       | 18px   | Standard body          |
  | Base       | Base        | 16px   | Default text           |
  | Button 1   | Small       | 14px   | Buttons, labels        |
  | Button 2   | Extra Small | 12px   | Small labels, captions |

  Key Principles

  - Clear visual hierarchy
  - Optimal readability across screen sizes
  - Responsive scaling

  ---
  5. Spacing & Layout

  Business Card Reference (Translates to UI)

  - Margins: Minimum 0.25" (translates to 16-24px in UI)
  - Hierarchy: Logo top-left, content left-aligned
  - Spacing: Adequate gaps between text blocks

  Recommended UI Spacing Scale

  | Token | Value | Usage            |
  |-------|-------|------------------|
  | xs    | 4px   | Tight gaps       |
  | sm    | 8px   | Related elements |
  | md    | 16px  | Standard spacing |
  | lg    | 24px  | Section gaps     |
  | xl    | 32px  | Major sections   |
  | 2xl   | 48px  | Page sections    |
  | 3xl   | 64px  | Hero areas       |

  ---
  6. Photography & Imagery

  Style Principles

  - Authentic over staged
  - Clean, professional aesthetic
  - Natural lighting preferred
  - Balanced color palette aligned with brand

  Technical Specs

  | Context        | Resolution | Dimensions       |
  |----------------|------------|------------------|
  | Print          | 300 DPI    | As needed        |
  | Digital/Web    | 72 DPI     | As needed        |
  | Hero Images    | —          | Min 2000px width |
  | Content Images | —          | Min 1200px width |

  Color Profiles

  - Web: sRGB
  - Print: Adobe RGB or CMYK

  Do's ✅

  - Capture authentic moments
  - Ensure sharp focus
  - Maintain consistent lighting
  - Show diversity and organized spaces

  Don'ts ❌

  - Cluttered backgrounds
  - Heavy filters or excessive editing
  - Compromised resolution
  - Generic stock photos when authentic options exist

  ---
  7. Component Patterns

  Shadcn/UI Integration

  The system uses shadcn/ui for:
  - Consistency
  - Accessibility
  - Scalability

  Dark Mode Support

  All components include .dark selector rules for theme-consistent rendering.

  Recommended Component Libraries

  - shadcn/ui — React/Next.js
  - Element Plus — Vue.js

  ---
  8. AI Implementation Notes

  For AI Code Generation

  When generating UI code, always:

  1. Use CSS variables for colors (not hardcoded hex)
  /* Good */
  background: hsl(var(--primary));

  /* Avoid */
  background: #753BBD;
  2. Follow the type scale — Don't invent sizes
  /* Good */
  font-size: var(--text-base); /* 16px */

  /* Avoid */
  font-size: 15px;
  3. Respect spacing tokens — Use consistent increments (4, 8, 16, 24, 32, 48, 64)
  4. Include dark mode — Always define both light and dark variants
  5. Semantic color usage:
    - Green = Success
    - Yellow/Amber = Warning
    - Red = Danger/Error
    - Gray = Info/Neutral
  6. Accessibility first:
    - Sufficient color contrast
    - Proper heading hierarchy
    - Focus states for interactive elements

  Quick Reference for AI

  Primary: #753BBD (purple)
  Accent: #F97316 (orange)
  Success: #15803D
  Warning: #e79f04
  Danger: #F0283C
  Text Primary: #181818 (light) / #ffffff (dark)
  Text Secondary: #666666 (light) / #999999 (dark)
  Font: Satoshi
  Base Size: 16px
  Spacing Unit: 8px

  ---
  10. Real Implementation Patterns

  Based on actual OMS React implementation

  Page Layout Structure

  /* List Page Layout */
  - Container: space-y-6 (24px vertical spacing)
  - Page Title: text-3xl (24px) font-semibold tracking-tight
  - Description: text-sm (14px) text-muted-foreground mt-2 (8px)
  - Action Buttons: size="sm" gap-2 (8px)

  /* Detail Page Layout */
  - Header Card: p-6 (24px) border rounded-lg
  - Title: text-3xl (24px) font-bold
  - Meta Info: text-sm (14px) gap-2 (8px) mt-2 (8px)
  - Icon Size: h-4 w-4 (16px)
  - Cards Grid: gap-6 (24px) grid-cols-1 md:grid-cols-2 xl:grid-cols-4

  Navigation & Selection States

  /* Sidebar Menu */
  - Active: bg-primary text-primary-foreground (purple bg + white text)
  - Hover: hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
  - Disabled: opacity-50 cursor-not-allowed
  - Padding: px-3 py-2 (12px 8px)
  - Gap: gap-3 (12px)

  /* Tabs */
  - Container: bg-muted p-1 rounded-md
  - Active Tab: bg-primary text-primary-foreground (purple bg + white text)
  - Inactive Tab: text-muted-foreground
  - Tab Padding: px-3 py-1.5 (12px 6px)
  - Badge in Tab (Active): bg-transparent text-primary-foreground border-0
  - Badge in Tab (Inactive): bg-secondary text-secondary-foreground

  Badges & Tags

  /* Status Badges */
  - Success: bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400
  - Warning: bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400
  - Info: bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400
  - Danger: bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400

  /* Filter Badges */
  - Style: bg-primary/10 text-primary border border-primary/20
  - Hover: hover:bg-primary/20
  - With Close Button: gap-1 with X icon (h-3 w-3)

  Data Tables

  /* Table Structure */
  - Container: Card with pt-6 (24px)
  - Header: bg-muted/50 text-sm (14px) font-medium p-3 (12px)
  - Body: text-xs (12px) p-3 (12px)
  - Row Hover: hover:bg-muted/50
  - Border: border rounded-lg

  /* Column Widths */
  - Order Number: 150px
  - Customer Name: 200px
  - Status: 120px
  - Amount: 120px
  - Date: 120px
  - Actions: 80px

  Cards & Info Display

  /* Info Cards */
  - Padding: pt-6 (24px) space-y-3 (12px)
  - Title: text-sm (14px) font-medium with icon h-4 w-4 (16px)
  - Label: text-xs (12px) text-muted-foreground
  - Value: text-xs (12px) font-medium
  - Icon Color: text-primary

  /* Card Grid */
  - Gap: gap-6 (24px)
  - Responsive: grid-cols-1 md:grid-cols-2 xl:grid-cols-4

  Buttons & Actions

  /* Button Sizes */
  - Small: size="sm" (h-9 px-3)
  - Icon: size="icon" (h-9 w-9)
  - Default: h-10 px-4

  /* Button Variants */
  - Primary: bg-primary text-primary-foreground hover:bg-primary/90
  - Outline: border border-input hover:bg-accent
  - Ghost: hover:bg-accent hover:text-accent-foreground
  - Destructive: bg-destructive text-destructive-foreground

  Forms & Inputs

  /* Input Fields */
  - Height: h-10 (40px)
  - Padding: px-3 py-2 (12px 8px)
  - Border: border border-input rounded-md
  - Focus: focus-visible:ring-2 focus-visible:ring-ring

  /* Filter Bar */
  - Search: flex-1 with search icon
  - Filter Buttons: gap-2 (8px)
  - Active Filters: flex gap-2 (8px) flex-wrap

  Spacing Patterns

  /* Common Gaps */
  - Tight: gap-2 (8px) - buttons, inline elements
  - Normal: gap-3 (12px) - form fields, list items
  - Comfortable: gap-4 (16px) - sections
  - Spacious: gap-6 (24px) - major sections, cards

  /* Vertical Spacing */
  - space-y-2 (8px) - tight lists
  - space-y-3 (12px) - form groups
  - space-y-4 (16px) - content sections
  - space-y-6 (24px) - page sections

  Dark Mode Patterns

  /* Background Colors */
  - Page: bg-background (white / black)
  - Card: bg-card (white / gray-950)
  - Muted: bg-muted (gray-100 / gray-800)
  - Accent: bg-accent (gray-100 / gray-800)

  /* Text Colors */
  - Primary: text-foreground (#181818 / #ffffff)
  - Secondary: text-muted-foreground (#666666 / #999999)
  - Disabled: opacity-50

  /* Border Colors */
  - Default: border-border (gray-200 / gray-800)
  - Input: border-input (gray-200 / gray-800)

  Accessibility

  /* Focus States */
  - Ring: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  - Outline: focus-visible:outline-none

  /* Interactive Elements */
  - Minimum Touch Target: 40px (h-10)
  - Icon Buttons: h-9 w-9 (36px)
  - Hover States: Always include hover:bg-* or hover:text-*

  /* Color Contrast */
  - Text on Background: Minimum 4.5:1
  - Large Text: Minimum 3:1
  - Interactive Elements: Minimum 3:1

  ---
  9. Quick Checklist

  Before shipping any UI:

  - Logo has proper clear space
  - Colors use CSS variables
  - Typography follows scale
  - Spacing uses consistent tokens (8px increments)
  - Dark mode supported
  - Semantic colors applied correctly
  - Images meet resolution requirements
  - Accessibility checked
  - Selection states use primary color (purple)
  - Hover states defined for interactive elements
  - Focus states visible for keyboard navigation

  ---
  Guide compiled from Item Design System (design.item.com) — December 2025