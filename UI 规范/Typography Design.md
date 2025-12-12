# Item Typography Guidelines

## Overview

Typography is a key element of Item's brand identity, ensuring clarity, consistency, and a distinct visual voice across all touchpoints. This guide defines our typefaces, hierarchy, spacing, and best practices to create a cohesive and impactful brand experience.

Typography serves as the foundation of our visual communication, establishing tone, hierarchy, and readability across all brand materials. Through careful selection and consistent application of our typeface system, we create a unified brand experience that is both professional and approachable.

## Typography Library

Download our complete typography library containing Satoshi font family in multiple formats.

**Available Formats:**

- OTF (OpenType Font) - Preferred for design applications
- TTF (TrueType Font) - Universal compatibility

**Download Link:**
Access the typography library through the environment variable: `NEXT_PUBLIC_TYPOGRAPHY_DOWNLOAD_URL`

**What's Included:**

- Satoshi Variable font files
- Multiple font weights (Light to Black)
- Both regular and italic variants
- Web font formats
- Desktop font formats
- Font licensing information

## Primary Typeface: Satoshi

Satoshi is our primary typeface, chosen for its modern, clean aesthetic and exceptional readability. This versatile sans-serif font family provides a perfect balance of professionalism and approachability, making it ideal for both digital interfaces and branded content. With its geometric structure and balanced proportions, Satoshi ensures consistent brand communication across all platforms.

### About Satoshi

**Designer:** Indian Type Foundry
**Classification:** Geometric Sans-Serif
**Characteristics:**

- Modern, clean aesthetic
- Exceptional readability
- Geometric structure
- Balanced proportions
- Versatile application

### Font Weights

Satoshi offers a comprehensive range of weights to establish clear visual hierarchy:

**Satoshi Light (300)**

- **Usage**: Subtle text, decorative elements, large display text
- **Best for**: Hero sections, decorative quotes, light emphasis
- **Avoid**: Body text, small sizes, critical information

**Satoshi Regular (400)**

- **Usage**: Body text, paragraphs, standard content
- **Best for**: Main content, descriptions, general text
- **Recommended**: Default weight for most text

**Satoshi Medium (500)**

- **Usage**: Subheadings, emphasis, navigation items
- **Best for**: Section titles, button text, menu items
- **Ideal**: Balancing hierarchy without being too bold

**Satoshi Bold (700)**

- **Usage**: Headings, important information, calls-to-action
- **Best for**: Page titles, card headers, emphasis
- **Impact**: Strong visual weight for key elements

**Satoshi Black (900)**

- **Usage**: Display text, hero headings, maximum impact
- **Best for**: Large headlines, marketing materials, hero sections
- **Caution**: Use sparingly for maximum effect

## Typography Scale

Our typography system is built on a carefully crafted scale that ensures consistency and hierarchy across all our digital products. Each size is purposefully selected to create clear visual hierarchy while maintaining optimal readability. From large display text to small interface elements, our sizing system adapts seamlessly across different screen sizes and contexts.

### Heading Styles

**Heading 1 (9x Large - 128px)**

- **Font Size**: 128px (8rem)
- **Font Weight**: 800 (Extra Bold)
- **Line Height**: 1.1
- **Letter Spacing**: -0.02em
- **Usage**: Hero sections, landing page titles
- **Responsive**: Scales down to 32px on mobile
- **Example**: Main page headlines, marketing hero text

**Heading 2 (8x Large - 96px)**

- **Font Size**: 96px (6rem)
- **Font Weight**: 700 (Bold)
- **Line Height**: 1.15
- **Letter Spacing**: -0.015em
- **Usage**: Section headers, major divisions
- **Responsive**: Scales down to 28px on mobile
- **Example**: Section titles, feature headings

**Heading 3 (7x Large - 64px)**

- **Font Size**: 64px (4rem)
- **Font Weight**: 600 (Semi-Bold)
- **Line Height**: 1.2
- **Letter Spacing**: -0.01em
- **Usage**: Subsection headers, card titles
- **Responsive**: Scales down to 24px on mobile
- **Example**: Article titles, component headers

**Heading 4 (6x Large - 48px)**

- **Font Size**: 48px (3rem)
- **Font Weight**: 500 (Medium)
- **Line Height**: 1.25
- **Letter Spacing**: -0.005em
- **Usage**: Content headers, dialog titles
- **Responsive**: Scales down to 20px on mobile
- **Example**: Modal headers, sidebar titles

**Heading 5 (5x Large - 36px)**

- **Font Size**: 36px (2.25rem)
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.3
- **Letter Spacing**: 0
- **Usage**: Small headers, list titles
- **Responsive**: Scales down to 18px on mobile
- **Example**: List headers, group titles

**Heading 6 (4x Large - 28px)**

- **Font Size**: 28px (1.75rem)
- **Font Weight**: 300 (Light)
- **Line Height**: 1.35
- **Letter Spacing**: 0
- **Usage**: Subtle headers, category labels
- **Responsive**: Scales down to 16px on mobile
- **Example**: Category names, subtle divisions

### Subtitle Styles

**Subtitle 1 (3x Large - 24px)**

- **Font Size**: 24px (1.5rem)
- **Font Weight**: 200 (Extra Light)
- **Line Height**: 1.4
- **Letter Spacing**: 0
- **Usage**: Supporting text for headers, taglines
- **Responsive**: Scales down to 14px on mobile
- **Example**: Hero subtitles, section descriptions

**Subtitle 2 (2x Large - 20px)**

- **Font Size**: 20px (1.25rem)
- **Font Weight**: 180
- **Line Height**: 1.45
- **Letter Spacing**: 0
- **Usage**: Secondary supporting text
- **Responsive**: Scales down to 14px on mobile
- **Example**: Card descriptions, secondary info

### Body Styles

**Body 1 (Extra Large - 20px)**

- **Font Size**: 20px (1.25rem)
- **Font Weight**: 160
- **Line Height**: 1.6
- **Letter Spacing**: 0
- **Usage**: Large body text, featured content
- **Responsive**: Scales down to 14px on mobile
- **Example**: Article introductions, featured descriptions

**Body 2 (Large - 18px)**

- **Font Size**: 18px (1.125rem)
- **Font Weight**: 140
- **Line Height**: 1.65
- **Letter Spacing**: 0
- **Usage**: Standard body text, paragraphs
- **Responsive**: Scales down to 12px on mobile
- **Example**: Article content, descriptions

### Base & Button Styles

**Base 1 (Base - 16px)**

- **Font Size**: 16px (1rem)
- **Font Weight**: 160
- **Line Height**: 1.5
- **Letter Spacing**: 0
- **Usage**: Default text size, UI elements
- **Responsive**: Scales down to 14px on mobile
- **Example**: Form labels, navigation items

**Button 1 (Small - 14px)**

- **Font Size**: 14px (0.875rem)
- **Font Weight**: 140
- **Line Height**: 1.4
- **Letter Spacing**: 0.01em
- **Usage**: Button text, small UI elements
- **Responsive**: Scales down to 12px on mobile
- **Example**: Primary buttons, action links

**Button 2 (Extra Small - 12px)**

- **Font Size**: 12px (0.75rem)
- **Font Weight**: 120
- **Line Height**: 1.3
- **Letter Spacing**: 0.02em
- **Usage**: Small buttons, tags, labels
- **Responsive**: Scales down to 10px on mobile
- **Example**: Tags, badges, small labels

## Implementation

### Web Fonts (CSS)

```css
/* Satoshi Variable Font */
@font-face {
  font-family: "Satoshi";
  src: url("/fonts/Satoshi-Variable.ttf") format("truetype");
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: "Satoshi";
  src: url("/fonts/Satoshi-VariableItalic.ttf") format("truetype");
  font-weight: 300 900;
  font-display: swap;
  font-style: italic;
}

/* Apply to body */
body {
  font-family:
    "Satoshi",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
      },
      fontSize: {
        "9xl": ["128px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "8xl": ["96px", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "7xl": ["64px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "6xl": ["48px", { lineHeight: "1.25", letterSpacing: "-0.005em" }],
        "5xl": ["36px", { lineHeight: "1.3" }],
        "4xl": ["28px", { lineHeight: "1.35" }],
        "3xl": ["24px", { lineHeight: "1.4" }],
        "2xl": ["20px", { lineHeight: "1.45" }],
        xl: ["20px", { lineHeight: "1.6" }],
        lg: ["18px", { lineHeight: "1.65" }],
        base: ["16px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        xs: ["12px", { lineHeight: "1.3", letterSpacing: "0.02em" }],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        bold: "700",
        black: "900",
      },
    },
  },
};
```

### React/Next.js Implementation

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/Satoshi-Variable.ttf',
      weight: '300 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-VariableItalic.ttf',
      weight: '300 900',
      style: 'italic',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Vue.js Implementation

```javascript
// main.js
import { createApp } from "vue";
import App from "./App.vue";

// Import font CSS
import "./styles/fonts.css";

const app = createApp(App);
app.mount("#app");
```

```css
/* styles/fonts.css */
@font-face {
  font-family: "Satoshi";
  src: url("/fonts/Satoshi-Variable.ttf") format("truetype");
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
}

* {
  font-family:
    "Satoshi",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}
```

## Typography in Use

### Hero Section Example

```html
<section class="hero">
  <h1 class="text-9xl font-black">The Next Generation.</h1>
  <p class="text-2xl text-muted-foreground">
    Empowering businesses and individuals with cutting-edge technology
    solutions.
  </p>
  <button class="text-sm font-medium">Join Here</button>
</section>
```

### Card Component Example

```html
<div class="card">
  <h3 class="text-5xl font-semibold">Feature Title</h3>
  <p class="text-lg text-muted-foreground">
    Description text using our standard body size for optimal readability.
  </p>
  <button class="text-sm font-medium">Learn More</button>
</div>
```

### Navigation Example

```html
<nav>
  <a class="text-base font-medium">Home</a>
  <a class="text-base font-medium">About</a>
  <a class="text-base font-medium">Services</a>
  <a class="text-base font-medium">Contact</a>
</nav>
```

## Best Practices

### Hierarchy

- **Establish Clear Hierarchy**: Use size and weight to create visual distinction
- **Limit Heading Levels**: Use no more than 3-4 heading levels per page
- **Consistent Spacing**: Maintain consistent spacing between heading levels
- **Progressive Scale**: Each level should be noticeably different from the next

### Readability

- **Line Length**: Keep body text between 50-75 characters per line
- **Line Height**: Use 1.5-1.6 line height for body text
- **Paragraph Spacing**: Add space between paragraphs (0.75-1em)
- **Contrast**: Ensure sufficient contrast between text and background

### Responsive Typography

- **Fluid Sizing**: Use clamp() or responsive units for smooth scaling
- **Mobile Optimization**: Reduce sizes appropriately for mobile devices
- **Touch Targets**: Ensure buttons and links are at least 44x44px
- **Readability**: Maintain readability across all screen sizes

### Accessibility

- **Minimum Size**: Never use text smaller than 12px
- **Color Contrast**: Maintain WCAG AA standards (4.5:1 for normal text)
- **Font Weight**: Avoid very light weights for small text
- **Spacing**: Ensure adequate spacing for readability

### Performance

- **Font Loading**: Use `font-display: swap` for better performance
- **Variable Fonts**: Prefer variable fonts to reduce file size
- **Subsetting**: Only include characters you need
- **Preloading**: Preload critical fonts for faster rendering

## Typography Don'ts

### Common Mistakes to Avoid

1. **Don't Mix Too Many Weights**
   - Stick to 3-4 weights maximum
   - Too many weights create visual confusion

2. **Don't Use All Caps Excessively**
   - All caps reduces readability
   - Use sparingly for emphasis only

3. **Don't Stretch or Condense**
   - Never artificially stretch or condense the font
   - Use the designed weights only

4. **Don't Use Insufficient Contrast**
   - Avoid light text on light backgrounds
   - Ensure WCAG compliance

5. **Don't Ignore Line Length**
   - Lines that are too long reduce readability
   - Lines that are too short disrupt reading flow

6. **Don't Forget Mobile**
   - Always test typography on mobile devices
   - Ensure touch targets are adequate

7. **Don't Overuse Bold**
   - Too much bold text loses its impact
   - Use bold strategically for emphasis

8. **Don't Use Justified Text**
   - Justified text creates uneven spacing
   - Use left-aligned text for better readability

## File Structure

Recommended font file organization:

```
your-project/
├── public/
│   └── fonts/
│       ├── Satoshi-Variable.ttf
│       ├── Satoshi-VariableItalic.ttf
│       ├── Satoshi-Light.ttf (optional)
│       ├── Satoshi-Regular.ttf (optional)
│       ├── Satoshi-Medium.ttf (optional)
│       ├── Satoshi-Bold.ttf (optional)
│       └── Satoshi-Black.ttf (optional)
├── src/
│   └── styles/
│       └── fonts.css
└── package.json
```

## Download Resources

### Font Files

**Primary Download:**

- Environment Variable: `NEXT_PUBLIC_TYPOGRAPHY_DOWNLOAD_URL`
- Includes: Complete Satoshi font family
- Formats: OTF, TTF, WOFF, WOFF2

**Font Weights Included:**

- Satoshi Light (300)
- Satoshi Regular (400)
- Satoshi Medium (500)
- Satoshi Bold (700)
- Satoshi Black (900)

**Variable Fonts:**

- Satoshi-Variable.ttf (300-900 weight range)
- Satoshi-VariableItalic.ttf (300-900 weight range)

### Additional Resources

- **Typography Specimens**: Visual examples of all weights and sizes
- **Implementation Guide**: Step-by-step setup instructions
- **Best Practices Document**: Detailed usage guidelines
- **Font License**: Usage rights and restrictions

## Technical Specifications

### Font Metrics

- **Cap Height**: 700 units
- **X-Height**: 520 units
- **Ascender**: 900 units
- **Descender**: -200 units
- **Units per Em**: 1000

### Supported Characters

- **Latin**: Full support including extended Latin
- **Numbers**: Lining and tabular figures
- **Punctuation**: Complete set
- **Symbols**: Common symbols and currency
- **Ligatures**: Standard ligatures included

### File Sizes

- **Variable TTF**: ~150KB
- **Individual Weights (TTF)**: ~40KB each
- **WOFF2 (Variable)**: ~80KB
- **WOFF2 (Individual)**: ~20KB each

## Browser Support

- Chrome 88+
- Firefox 62+
- Safari 11+
- Edge 88+
- iOS Safari 11+
- Android Chrome 88+

## Related Guidelines

- **Colors**: [Color Guidelines](/guidelines/colors)
- **Logo**: [Logo Guidelines](/guidelines/logo)
- **Business Card**: [Business Card Guidelines](/guidelines/business-card)

## Navigation

- **Previous**: [Colors](/guidelines/colors)
- **Next**: [Business Card](/guidelines/business-card)

---

_For questions about typography implementation, font licensing, or additional formats, please contact the design system team._
