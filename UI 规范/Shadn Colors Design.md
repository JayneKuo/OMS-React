# Item Shadcn Colors Guidelines

## Overview

We use the shadcn/ui color system to ensure consistency, accessibility, and scalability across our UI. This comprehensive color system provides a robust foundation for building modern, accessible, and visually cohesive user interfaces.

The shadcn/ui color system is built on CSS custom properties (variables) that enable seamless theme switching, maintain consistent design patterns, and ensure WCAG accessibility standards are met across all components.

## Why Shadcn/UI Colors?

- **Consistency**: Unified color tokens across all UI components
- **Accessibility**: WCAG-compliant color contrasts for all text and interactive elements
- **Scalability**: Easy to maintain and extend as the design system grows
- **Theme Support**: Built-in light and dark mode support
- **Developer-Friendly**: CSS variables that work seamlessly with Tailwind CSS

## Color System Structure

Our color system is organized into seven main categories, each serving specific purposes in the UI:

### 1. Primary Theme Colors

The foundation of our brand identity and primary user interactions.

**Background** - `#000000` (Dark) / `#fafafa` (Light)

- RGB: 0, 0, 0 (Dark) / 250, 250, 250 (Light)
- HSL: 0, 0%, 0% (Dark) / 0, 0%, 98% (Light)
- OKLCH: 0, 0, 0 (Dark) / 0.9851, 0, 0 (Light)
- **Usage**: Main application background

**Foreground** - `#ffffff` (Dark) / `#181818` (Light)

- RGB: 255, 255, 255 (Dark) / 24, 24, 24 (Light)
- HSL: 0, 0%, 100% (Dark) / 0, 0%, 9% (Light)
- OKLCH: 1, 0, 0 (Dark) / 0.2090, 0, 0 (Light)
- **Usage**: Primary text color

**Primary** - `#763abf` (Universal)

- RGB: 118, 58, 191
- HSL: 267, 53%, 49%
- OKLCH: 0.489, 0.134, 294
- **Usage**: Primary buttons, links, and key interactive elements

**Primary Foreground** - `#ffffff` (Universal)

- RGB: 255, 255, 255
- HSL: 0, 0%, 100%
- OKLCH: 1, 0, 0
- **Usage**: Text on primary colored backgrounds

### 2. Secondary & Accent Colors

Supporting colors for secondary actions and highlighted content.

**Secondary** - `#2b2e31` (Dark) / `#dbdbdb` (Light)

- RGB: 43, 46, 49 (Dark) / 219, 219, 219 (Light)
- HSL: 210, 7%, 18% (Dark) / 0, 0%, 86% (Light)
- OKLCH: 0.195, 0.008, 230 (Dark) / 0.8914, 0, 0 (Light)
- **Usage**: Secondary buttons and less prominent actions

**Secondary Foreground** - `#ededed` (Dark) / `#18181b` (Light)

- RGB: 237, 237, 237 (Dark) / 24, 24, 27 (Light)
- HSL: 0, 0%, 93% (Dark) / 240, 6%, 10% (Light)
- OKLCH: 0.929, 0, 0 (Dark) / 0.2102, 0.0060, 285 (Light)
- **Usage**: Text on secondary colored backgrounds

**Accent** - `#202222` (Dark) / `#f2f2f2` (Light)

- RGB: 32, 34, 34 (Dark) / 242, 242, 242 (Light)
- HSL: 180, 3%, 13% (Dark) / 0, 0%, 95% (Light)
- OKLCH: 0.145, 0.003, 180 (Dark) / 0.9612, 0, 0 (Light)
- **Usage**: Highlighted sections and accent areas

**Accent Foreground** - `#ffffff` (Universal)

- RGB: 255, 255, 255
- HSL: 0, 0%, 100%
- OKLCH: 1, 0, 0
- **Usage**: Text on accent colored backgrounds

### 3. UI Component Colors

Specialized colors for cards, popovers, and muted content.

**Card** - `#0d0d0d` (Dark) / `#ffffff` (Light)

- RGB: 13, 13, 13 (Dark) / 255, 255, 255 (Light)
- HSL: 0, 0%, 5% (Dark) / 0, 0%, 100% (Light)
- OKLCH: 0.057, 0, 0 (Dark) / 1.0000, 0, 0 (Light)
- **Usage**: Card backgrounds

**Card Foreground** - `#fcfcfc` (Dark) / `#181818` (Light)

- RGB: 252, 252, 252 (Dark) / 24, 24, 24 (Light)
- HSL: 0, 0%, 99% (Dark) / 0, 0%, 9% (Light)
- OKLCH: 0.988, 0, 0 (Dark) / 0.2090, 0, 0 (Light)
- **Usage**: Text on cards

**Muted** - `#202122` (Dark) / `#e6e6e6` (Light)

- RGB: 32, 33, 34 (Dark) / 230, 230, 230 (Light)
- HSL: 210, 3%, 13% (Dark) / 0, 0%, 90% (Light)
- OKLCH: 0.143, 0.003, 230 (Dark) / 0.9249, 0, 0 (Light)
- **Usage**: Muted backgrounds

**Muted Foreground** - `#999999` (Dark) / `#666666` (Light)

- RGB: 153, 153, 153 (Dark) / 102, 102, 102 (Light)
- HSL: 0, 0%, 60% (Dark) / 0, 0%, 40% (Light)
- OKLCH: 0.648, 0, 0 (Dark) / 0.5103, 0, 0 (Light)
- **Usage**: Muted text, placeholders, and subtle content

**Popover** - `#0d0d0d` (Dark) / `#ffffff` (Light)

- RGB: 13, 13, 13 (Dark) / 255, 255, 255 (Light)
- HSL: 0, 0%, 5% (Dark) / 0, 0%, 100% (Light)
- OKLCH: 0.057, 0, 0 (Dark) / 1.0000, 0, 0 (Light)
- **Usage**: Popover and dropdown backgrounds

**Popover Foreground** - `#fcfcfc` (Dark) / `#09090b` (Light)

- RGB: 252, 252, 252 (Dark) / 9, 9, 11 (Light)
- HSL: 0, 0%, 99% (Dark) / 240, 10%, 4% (Light)
- OKLCH: 0.988, 0, 0 (Dark) / 0.1417, 0.0044, 285 (Light)
- **Usage**: Text in popovers and dropdowns

### 4. Utility & Form Colors

Essential colors for borders, inputs, and focus states.

**Border** - `#292929` (Dark) / `#e0e0e0` (Light)

- RGB: 41, 41, 41 (Dark) / 224, 224, 224 (Light)
- HSL: 0, 0%, 16% (Dark) / 0, 0%, 88% (Light)
- OKLCH: 0.174, 0, 0 (Dark) / 0.9067, 0, 0 (Light)
- **Usage**: Component borders and dividers

**Input** - `#1b1a1f` (Dark) / `#e4e4e7` (Light)

- RGB: 27, 26, 31 (Dark) / 228, 228, 231 (Light)
- HSL: 252, 9%, 11% (Dark) / 240, 6%, 90% (Light)
- OKLCH: 0.120, 0.010, 265 (Dark) / 0.9197, 0.0041, 286 (Light)
- **Usage**: Input field backgrounds

**Ring** - `#828282` (Dark) / `#763abf` (Light)

- RGB: 130, 130, 130 (Dark) / 118, 58, 191 (Light)
- HSL: 0, 0%, 51% (Dark) / 267, 53%, 49% (Light)
- OKLCH: 0.568, 0, 0 (Dark) / 0.4969, 0.1969, 299 (Light)
- **Usage**: Focus rings and outlines

### 5. Status & Feedback Colors

Colors for error states and destructive actions.

**Destructive** - `#f0283c` (Dark) / `#e01529` (Light)

- RGB: 240, 40, 60 (Dark) / 224, 21, 41 (Light)
- HSL: 354, 86%, 55% (Dark) / 354, 83%, 48% (Light)
- OKLCH: 0.579, 0.187, 22 (Dark) / 0.5767, 0.2261, 25 (Light)
- **Usage**: Error messages, delete buttons, destructive actions

**Destructive Foreground** - `#220202` (Dark) / `#fff5f7` (Light)

- RGB: 34, 2, 2 (Dark) / 255, 245, 247 (Light)
- HSL: 0, 89%, 7% (Dark) / 348, 100%, 98% (Light)
- OKLCH: 0.075, 0.051, 22 (Dark) / 0.9785, 0.0110, 3 (Light)
- **Usage**: Text on destructive colored backgrounds

### 6. Chart & Visualization Colors

Distinct colors for data visualization and charts.

**Chart 1** - `#763abf` (Universal)

- RGB: 118, 58, 191
- HSL: 267, 53%, 49%
- OKLCH: 0.489, 0.134, 294
- **Usage**: Primary chart color

**Chart 2** - `#a176d6` (Dark) / `#ff5b26` (Light)

- RGB: 161, 118, 214 (Dark) / 255, 91, 38 (Light)
- HSL: 267, 54%, 65% (Dark) / 15, 100%, 57% (Light)
- OKLCH: 0.651, 0.090, 294 (Dark) / 0.6839, 0.2089, 37 (Light)
- **Usage**: Secondary chart color

**Chart 3** - `#247b69` (Universal)

- RGB: 36, 123, 105
- HSL: 168, 55%, 31%
- OKLCH: 0.456, 0.072, 165
- **Usage**: Tertiary chart color

**Chart 4** - `#ffba26` (Universal)

- RGB: 255, 186, 38
- HSL: 41, 100%, 57%
- OKLCH: 0.815, 0.133, 70
- **Usage**: Quaternary chart color

**Chart 5** - `#ff5b26` (Dark) / `#a176d6` (Light)

- RGB: 255, 91, 38 (Dark) / 161, 118, 214 (Light)
- HSL: 15, 100%, 57% (Dark) / 267, 54%, 65% (Light)
- OKLCH: 0.685, 0.189, 45 (Dark) / 0.6478, 0.1447, 303 (Light)
- **Usage**: Quinary chart color

### 7. Sidebar & Navigation Colors

Specialized colors for sidebar and navigation components.

**Sidebar Background** - `#141414` (Dark) / `#f2f2f2` (Light)

- RGB: 20, 20, 20 (Dark) / 242, 242, 242 (Light)
- HSL: 0, 0%, 8% (Dark) / 0, 0%, 95% (Light)
- OKLCH: 0.090, 0, 0 (Dark) / 0.9612, 0, 0 (Light)
- **Usage**: Sidebar background

**Sidebar Foreground** - `#f4f4f5` (Dark) / `#3f3f46` (Light)

- RGB: 244, 244, 245 (Dark) / 63, 63, 70 (Light)
- HSL: 240, 5%, 96% (Dark) / 240, 5%, 26% (Light)
- OKLCH: 0.957, 0.002, 265 (Dark) / 0.3705, 0.0120, 285 (Light)
- **Usage**: Sidebar text

**Sidebar Primary** - `#763abf` (Dark) / `#18181b` (Light)

- RGB: 118, 58, 191 (Dark) / 24, 24, 27 (Light)
- HSL: 267, 53%, 49% (Dark) / 240, 6%, 10% (Light)
- OKLCH: 0.489, 0.134, 294 (Dark) / 0.2103, 0.0059, 285 (Light)
- **Usage**: Active sidebar items

**Sidebar Primary Foreground** - `#fafafa` (Universal)

- RGB: 250, 250, 250
- HSL: 0, 0%, 98%
- OKLCH: 0.9850, 0, 0
- **Usage**: Text on active sidebar items

**Sidebar Accent** - `#282929` (Dark) / `#e6e6e6` (Light)

- RGB: 40, 41, 41 (Dark) / 230, 230, 230 (Light)
- HSL: 180, 1%, 16% (Dark) / 0, 0%, 90% (Light)
- OKLCH: 0.174, 0.002, 180 (Dark) / 0.9249, 0, 0 (Light)
- **Usage**: Hovered sidebar items

**Sidebar Accent Foreground** - `#ffffff` (Dark) / `#18181b` (Light)

- RGB: 255, 255, 255 (Dark) / 24, 24, 27 (Light)
- HSL: 0, 0%, 100% (Dark) / 240, 6%, 10% (Light)
- OKLCH: 1, 0, 0 (Dark) / 0.2103, 0.0059, 285 (Light)
- **Usage**: Text on hovered sidebar items

**Sidebar Border** - `#292929` (Dark) / `#e5e7eb` (Light)

- RGB: 41, 41, 41 (Dark) / 229, 231, 235 (Light)
- HSL: 0, 0%, 16% (Dark) / 220, 13%, 91% (Light)
- OKLCH: 0.174, 0, 0 (Dark) / 0.9278, 0.0058, 264 (Light)
- **Usage**: Sidebar borders

**Sidebar Ring** - `#471584` (Dark) / `#763abf` (Light)

- RGB: 71, 21, 132 (Dark) / 118, 58, 191 (Light)
- HSL: 267, 73%, 30% (Dark) / 267, 53%, 49% (Light)
- OKLCH: 0.3494, 0.1669, 296 (Dark) / 0.4969, 0.1969, 299 (Light)
- **Usage**: Sidebar focus rings

## Implementation

### File Structure

```
components/shadcn-color/
├── dashboard.tsx                    # Main dashboard component
├── color-palette-enhanced.tsx       # Color palette display
├── css-theme-data.ts               # CSS theme definitions
├── css-themes.tsx                  # Theme code display
├── theme-context.tsx               # Theme provider and context
├── pricing.tsx                     # Pricing component example
├── charts.tsx                      # Chart components
├── icons.tsx                       # Icon components
├── cards/                          # Card component examples
│   ├── activity-goal.tsx
│   ├── calendar.tsx
│   ├── chat.tsx
│   ├── cookie-settings.tsx
│   ├── create-account.tsx
│   ├── data-table.tsx
│   ├── date-picker-with-range.tsx
│   ├── date-picker.tsx
│   ├── github-cards.tsx
│   ├── metric.tsx
│   ├── notifications.tsx
│   ├── payment-method.tsx
│   ├── report-an-issue.tsx
│   ├── share.tsx
│   ├── stats.tsx
│   └── team-members.tsx
└── dashboard/                      # Dashboard components
    ├── date-range-picker.tsx
    ├── main-nav.tsx
    ├── overview.tsx
    ├── recent-sales.tsx
    ├── search.tsx
    ├── team-switcher.tsx
    └── user-nav.tsx
```

### Theme Context Implementation

The color system uses a local theme provider for isolated theme switching:

```typescript
"use client";

import React, { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export function LocalThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useLocalTheme() {
  return useContext(ThemeContext);
}
```

### Dashboard Features

The shadcn colors page includes an interactive dashboard with:

- **Cards Tab**: Showcase of various card components using the color system
- **Pricing Tab**: Pricing component examples
- **Color Palette Tab**: Complete color palette with all color values
- **Theme Toggle**: Switch between light and dark modes
- **Code View**: View and copy CSS theme code

### Using the Color System

#### In Tailwind CSS

```tsx
// Using color tokens
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Click me</button>
</div>
```

#### In CSS

```css
.custom-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
```

## CSS Theme Formats

The color system is available in multiple CSS formats:

### Tailwind v3 Format

Uses CSS custom properties with HSL values:

```css
:root {
  --background: 0 0% 98.0392%;
  --foreground: 0 0% 9.4118%;
  --primary: 267.0677 53.4137% 48.8235%;
  /* ... */
}

.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --primary: 267.0677 53.4137% 48.8235%;
  /* ... */
}
```

### Tailwind v4 Format

Uses CSS custom properties with HSL values and `@theme inline`:

```css
:root {
  --background: hsl(0 0% 98.0392%);
  --foreground: hsl(0 0% 9.4118%);
  --primary: hsl(267.0677 53.4137% 48.8235%);
  /* ... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}
```

### RGB Format

```css
:root {
  --background: rgb(250, 250, 250);
  --foreground: rgb(24, 24, 24);
  --primary: rgb(118, 58, 191);
  /* ... */
}
```

### HEX Format

```css
:root {
  --background: #fafafa;
  --foreground: #181818;
  --primary: #763abf;
  /* ... */
}
```

### OKLCH Format

```css
:root {
  --background: oklch(0.9851 0 0);
  --foreground: oklch(0.209 0 0);
  --primary: oklch(0.4969 0.1969 299.8283);
  /* ... */
}
```

## Additional Theme Variables

### Typography

```css
--font-sans:
  ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
  "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
--font-mono:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
  "Courier New", monospace;
```

### Border Radius

```css
--radius: 0.625rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

### Shadows

```css
--shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0);
--shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0);
--shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0), 0 1px 2px -1px hsl(0 0% 0% / 0);
--shadow: 0 1px 3px 0px hsl(0 0% 0% / 0), 0 1px 2px -1px hsl(0 0% 0% / 0);
--shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0), 0 2px 4px -1px hsl(0 0% 0% / 0);
--shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0), 0 4px 6px -1px hsl(0 0% 0% / 0);
--shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0), 0 8px 10px -1px hsl(0 0% 0% / 0);
--shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0);
```

### Spacing

```css
--spacing: 0.25rem;
--tracking-normal: 0em;
```

## Best Practices

### Accessibility

- Always use foreground colors with their corresponding background colors
- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Test color combinations in both light and dark modes
- Use semantic color tokens (e.g., `destructive` for errors) rather than hardcoded colors

### Consistency

- Use color tokens consistently across all components
- Don't mix different color formats (stick to CSS variables)
- Follow the established color hierarchy
- Use muted colors for less important content

### Theme Switching

- Always test components in both light and dark modes
- Use the `LocalThemeProvider` for isolated theme contexts
- Ensure all custom components respect theme changes
- Avoid hardcoded color values

### Component Development

- Use semantic color tokens in component props
- Provide color variants that map to theme colors
- Document which colors work best for each component
- Test color combinations for accessibility

## Usage Examples

### Cards

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-6">
  <h3 className="text-foreground font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card description</p>
</div>
```

### Buttons

```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Action
</button>

// Destructive button
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
  Delete
</button>
```

### Forms

```tsx
<input
  className="bg-input border border-border text-foreground 
             focus:ring-2 focus:ring-ring focus:border-transparent"
  placeholder="Enter text..."
/>
```

### Navigation

```tsx
<nav className="bg-sidebar border-r border-sidebar-border">
  <a
    className="text-sidebar-foreground hover:bg-sidebar-accent 
                hover:text-sidebar-accent-foreground"
  >
    Menu Item
  </a>
  <a className="bg-sidebar-primary text-sidebar-primary-foreground">
    Active Item
  </a>
</nav>
```

## Download & Export

### Accessing Theme Code

The shadcn colors page includes a "Code" button that displays the complete CSS theme code in multiple formats:

1. Click the "Code" button in the dashboard
2. Select your preferred format (HSL, RGB, HEX, OKLCH)
3. Choose between Tailwind v3 or v4 format
4. Copy the code for use in your project

### File Location

Theme data is stored in: `components/shadcn-color/css-theme-data.ts`

## Related Resources

- **Official Documentation**: [shadcn/ui](https://ui.shadcn.com/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)
- **WCAG Guidelines**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/)
- **Color Contrast Checker**: [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)

## Navigation

- **Previous**: [Brand Colors](/guidelines/brand-colors)
- **Next**: [Logos](/guidelines/logos)

---

_For questions about the color system, implementation details, or accessibility concerns, please contact the design system team._
