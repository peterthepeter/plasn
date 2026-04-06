# The Executive Design System: Dark Editorial Edition

## 1. Overview & Creative North Star: "The Digital Obsidian"
This design system is built for 'Groly' to evoke the feeling of a high-end, late-night concierge. Our Creative North Star is **"The Digital Obsidian."** Like polished volcanic glass, the interface should feel deep, reflective, and expensive. 

We break the "template" look by rejecting standard grid-bound containers. Instead, we use **Intentional Asymmetry**—where headlines may bleed off-center and imagery overlaps container boundaries—to create an editorial flow found in premium fashion journals. This isn't just a dark mode; it’s a high-contrast environment where light is used as a surgical tool to guide the eye toward emerald accents.

---

## 2. Colors: Depth Without Lines
The palette is anchored in `#0e0e0e` (Surface/Background), providing a richer, "inkier" depth than standard grey.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. 
Boundaries must be created through **Background Color Shifts**. To separate a content area from the main background, shift from `surface` (#0e0e0e) to `surface-container-low` (#131313). This creates a sophisticated, "carved" look rather than a "boxed" one.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
*   **Base:** `surface` (#0e0e0e)
*   **Recessed Elements:** `surface-container-lowest` (#000000) for input fields or secondary zones.
*   **Elevated Elements:** `surface-container-high` (#20201f) for cards and primary interaction zones.

### Signature Textures & The Glass Rule
*   **The Emerald Glow:** Use `primary` (#59f3c5) with a 20% opacity drop-shadow or outer glow to simulate neon gas tubes for active states.
*   **Glassmorphism:** Floating navigation bars or modal headers must use `surface-container` (#1a1a1a) at 70% opacity with a `20px` backdrop-blur. This allows the emerald accents to "bleed" through as the user scrolls, maintaining a sense of spatial awareness.

---

## 3. Typography: Editorial Authority
We utilize **Plus Jakarta Sans** for its geometric clarity and modern "ink-trap" aesthetic, which performs exceptionally well in high-contrast dark modes.

*   **Display (lg/md):** Used for "Hero" moments. Use `display-lg` (3.5rem) with `-0.02em` letter spacing. This creates a tight, authoritative "masthead" feel.
*   **Headline (lg/md):** The workhorse for section titles. Pair `headline-md` with `primary` (#59f3c5) color to signify a new content chapter.
*   **Title (lg/md):** Use for card headings. Always use `on-surface` (#ffffff) to ensure maximum legibility against dark backgrounds.
*   **Body (lg/md):** For long-form content, use `on-surface-variant` (#adaaaa). Pure white text on black backgrounds causes "halation" (blurring in the eye); this slightly dimmed grey prevents eye strain while maintaining a premium feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "muddy" in dark mode. We achieve hierarchy through **Tonal Layering**.

*   **The Layering Principle:** To "lift" a card, place a `surface-container-highest` (#262626) element on a `surface` (#0e0e0e) background. The contrast in value creates the lift naturally.
*   **Ambient Shadows:** If a floating action button (FAB) or modal requires a shadow, use a large blur (30px+) with the color `primary` (#59f3c5) at 10% opacity. This mimics an "Emerald Glow" rather than a dark shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` (#484847) at 20% opacity. **Never use 100% opaque borders.**

---

## 5. Components: Modernist Refinement

### Buttons (The "Light Source")
*   **Primary:** Background `primary-container` (#04c59b), Text `on-primary-container` (#003628). Add a subtle inner-top-glow of 1px using `primary` (#59f3c5) to simulate a light source hitting the top edge.
*   **Secondary:** No background. Use a `Ghost Border` (outline-variant at 20%) and `primary` text.
*   **Tertiary:** Text-only in `on-surface-variant`. On hover, transition text to `primary`.

### Cards & Lists
*   **Layout:** Forbid divider lines. Use `spacing-6` (2rem) of vertical whitespace to separate items.
*   **Interaction:** On hover, a card should shift from `surface-container` to `surface-bright` (#2c2c2c).

### Input Fields
*   **State:** Filled style only. Use `surface-container-low` (#131313) as the base. 
*   **Active State:** Change the bottom 2px to `primary` (#59f3c5) with a subtle `3px` glow.

### Signature Component: The "Emerald Progress Pulse"
For Groly's tracking features, use a `primary` (#59f3c5) line that features a `1.5rem` gradient tail (fading to transparent). This mimics a moving light source across the "Digital Obsidian" surface.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Offset your display text by `spacing-4` to create an editorial rhythm.
*   **Embrace the Void:** Use `spacing-12` and `spacing-16` to let components breathe. Luxury is defined by wasted space.
*   **Tint your Greys:** Ensure all neutral surfaces have a hint of the emerald hue to keep the palette cohesive.

### Don't:
*   **Don't use Dividers:** Never use a line to separate content. Use a background color shift or whitespace.
*   **Don't use Pure White for Body Text:** It is too harsh. Use `on-surface-variant` (#adaaaa).
*   **Don't use Standard Shadows:** Dark mode "shadows" should be glows or tonal shifts, not black blurs.