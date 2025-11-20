# 🎨 CoaChess Design System

**Theme**: Elegant, Minimalist, Sophisticated

---

## 🎯 Design Philosophy

- **Minimalist**: Clean, spacious layouts with purposeful white space
- **Sophisticated**: Black and white color palette with subtle gray tones
- **Elegant**: Light typography with wide letter spacing
- **Timeless**: Classic design that won't feel dated

---

## 🎨 Color Palette

### Primary Colors
- **Pure Black**: `#000000` - Primary text, borders, buttons
- **Pure White**: `#FFFFFF` - Background, button text
- **Charcoal**: `#1A1A1A` - Hover states for black elements

### Grayscale
- **Gray 900**: `#111827` - Very dark text
- **Gray 700**: `#374151` - Secondary text
- **Gray 600**: `#4B5563` - Tertiary text
- **Gray 500**: `#6B7280` - Muted text, captions
- **Gray 400**: `#9CA3AF` - Placeholder text
- **Gray 300**: `#D1D5DB` - Subtle borders
- **Gray 200**: `#E5E7EB` - Borders
- **Gray 100**: `#F3F4F6` - Light backgrounds
- **Gray 50**: `#F9FAFB` - Hover backgrounds

### Accent (Minimal Use)
- **Success Green**: `#10B981` - Success states only
- **Error Red**: `#EF4444` - Error states only
- **Warning Amber**: `#F59E0B` - Warning states only

---

## 📝 Typography

### Font Family
- **Primary**: Geist Sans (Variable font)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Mono**: Geist Mono (for code/PGN)

### Font Weights
- **Light**: 300 - Large headings, elegant text
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headlines only

### Letter Spacing
- **Ultra Wide**: `0.3em` - Brand name (COACHESS)
- **Extra Wide**: `0.2em` - Taglines
- **Wide**: `0.15em` - Subheadings, labels
- **Medium**: `0.1em` - Buttons, CTA text
- **Normal**: `0.05em` - Headings
- **Tight**: `0.01em` - Body text (default)

### Font Sizes
```
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)
text-5xl: 3rem (48px)
text-6xl: 3.75rem (60px)
text-7xl: 4.5rem (72px)
```

---

## 🎭 Component Styles

### Buttons

#### Primary Button (Black)
```jsx
className="px-8 py-4 bg-black text-white text-sm tracking-[0.1em] uppercase font-medium hover:bg-gray-800 transition-all duration-300 border-2 border-black"
```

#### Secondary Button (White)
```jsx
className="px-8 py-4 bg-white text-black text-sm tracking-[0.1em] uppercase font-medium hover:bg-gray-50 transition-all duration-300 border-2 border-black"
```

#### Ghost Button
```jsx
className="px-6 py-3 text-black text-sm tracking-[0.1em] uppercase font-medium hover:bg-gray-50 transition-all duration-300"
```

### Input Fields
```jsx
className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-all duration-200 bg-white text-black"
```

### Cards
```jsx
className="p-6 border border-gray-200 hover:border-black transition-colors duration-300 bg-white"
```

### Badges/Tags
```jsx
className="px-3 py-1 text-xs tracking-[0.1em] uppercase border border-black text-black"
```

---

## 🎨 Decorative Patterns

### Pattern Types Used

1. **Concentric Circles**: Top right corner
   - Creates sense of focus and target
   - 20 circles, stroke-width 0.3px

2. **Heart/Wave Pattern**: Top left & bottom right
   - Organic, flowing lines
   - Quadratic bezier curves

3. **Dot Grid**: Bottom left
   - Modern, technical feel
   - Regular spacing, 2px dots

### Usage Guidelines
- Always at 10% opacity
- Position in corners only
- Size: 256px × 256px (w-64 h-64)
- Black color (inherits from currentColor)

---

## 📐 Spacing System

### Padding/Margin Scale
```
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

### Container Widths
- **Max Content**: `max-w-4xl` (896px) - For text-heavy pages
- **Max Container**: `max-w-6xl` (1152px) - For general pages
- **Max Wide**: `max-w-7xl` (1280px) - For dashboards

---

## 🖼️ Layout Principles

### Grid Systems
- 3 columns on desktop for features
- 1 column on mobile
- 8px gap minimum
- 16-24px gap recommended

### White Space
- Section padding: `py-20` (80px)
- Between sections: `mb-20` (80px)
- Around content: `px-6` minimum

### Alignment
- Text: Center for landing/hero, left for content
- Buttons: Center for CTA, right for actions
- Forms: Left-aligned labels, full-width inputs

---

## ✨ Interactive States

### Hover Effects
- Buttons: Background darkens by one shade
- Cards: Border changes from gray-200 to black
- Links: Slight opacity change (0.8)
- Duration: 300ms ease-in-out

### Focus States
- Inputs: Border changes to black
- Buttons: Outline 2px black with 2px offset
- Links: Underline appears

### Active States
- Buttons: Scale down slightly (scale-95)
- Cards: Shadow appears

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile-First Approach
- Base styles for mobile
- Use `md:` prefix for tablets+
- Use `lg:` prefix for desktop
- Stack elements vertically on mobile

---

## 🎯 Logo & Branding

### Logo Composition
- 3 chess pieces: Rook, Queen, Rook
- Queen in center (tallest)
- Rooks on sides (shorter)
- All pieces solid black

### Brand Text
- Name: "COACHESS"
  - Font: Light (300)
  - Size: text-4xl
  - Spacing: tracking-[0.3em]
  
- Tagline: "ELEVATE YOUR GAME"
  - Font: Light (300)
  - Size: text-sm
  - Spacing: tracking-[0.2em]
  - Color: gray-500

---

## 📋 Page Templates

### Landing Page Structure
1. Header with logo (centered)
2. Hero section ("LAUNCHING SOON")
3. Tagline
4. CTA buttons (2)
5. Features grid (3 columns)
6. Footer

### Auth Pages Structure
1. Logo (centered, smaller)
2. Page title (uppercase, tracked)
3. Form (max-w-md, centered)
4. Submit button (full width)
5. Link to alternate action
6. Minimal footer

### Dashboard Structure
1. Top nav (logo left, actions right)
2. Page title (left-aligned)
3. Stats cards (grid)
4. Main content area
5. Sticky footer if needed

---

## 🚫 What to Avoid

- ❌ Rounded corners (keep square/minimal border-radius)
- ❌ Shadows (except subtle hover states)
- ❌ Gradients
- ❌ Bright colors
- ❌ Heavy fonts (max 700 weight)
- ❌ Emojis (except sparingly in content)
- ❌ Busy backgrounds
- ❌ Multiple border styles
- ❌ Inconsistent spacing

---

## ✅ Do's

- ✅ Use plenty of white space
- ✅ Keep borders thin (1-2px)
- ✅ Use uppercase for labels/buttons
- ✅ Use wide letter spacing for emphasis
- ✅ Keep color palette minimal
- ✅ Use light font weights
- ✅ Make touch targets large (44px minimum)
- ✅ Test on mobile first
- ✅ Use consistent spacing scale

---

## 🎨 Implementation Checklist

When creating a new page:
- [ ] White background
- [ ] Add corner decorative patterns (optional)
- [ ] Use consistent spacing (multiples of 4px)
- [ ] Apply proper letter spacing
- [ ] Use uppercase for labels/buttons
- [ ] Test responsive breakpoints
- [ ] Ensure 44px minimum touch targets
- [ ] Check contrast ratios (AA minimum)
- [ ] Test with keyboard navigation
- [ ] Verify hover/focus states

---

## 📚 Component Library

### Quick Reference

**Heading 1 (Page Title)**
```jsx
<h1 className="text-6xl md:text-7xl font-bold tracking-tight text-black">
```

**Heading 2 (Section Title)**
```jsx
<h2 className="text-3xl font-light tracking-[0.05em] text-black">
```

**Body Text**
```jsx
<p className="text-base text-gray-700 leading-relaxed">
```

**Label/Caption**
```jsx
<span className="text-sm tracking-[0.15em] uppercase text-gray-600 font-light">
```

**Link**
```jsx
<a className="text-black hover:opacity-80 transition-opacity duration-200 underline">
```

---

This design system ensures consistency across all pages and components!
