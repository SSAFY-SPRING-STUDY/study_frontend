# Design System Specification: The Engineering Editorial
 
## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Architect."** 
 
Standard LMS platforms often feel cluttered or overly "academic." This design system rejects that aesthetic in favor of a high-end, technical editorial experience. It is designed to feel like a premium IDE or a sophisticated developer tool (think Linear or Vercel) rather than a classroom. 
 
We break the "template" look by utilizing **intentional asymmetry** and **tonal depth**. Large, aggressive typography scales meet generous "breathing room" (whitespace), ensuring that complex technical information is never overwhelming. The goal is to create a sense of focused calm—an environment where the code is the hero and the UI is the invisible, supportive scaffolding.
 
---
 
## 2. Colors: Tonal Logic over Structural Lines
Our palette is rooted in deep indigos and refined grays, but its power lies in how these colors are layered to create depth without visual noise.
 
### The "No-Line" Rule
To achieve a signature premium feel, **prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit on a `surface` background to denote a new area. Lines create visual friction; color transitions create flow.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper.
- **Base Layer:** `surface` (#f8f9fa)
- **Secondary Logic:** `surface-container-low` (#f3f4f5) for sidebar or secondary navigation.
- **Actionable Surfaces:** `surface-container-lowest` (#ffffff) for primary content cards.
- **Interactive Layers:** `surface-container-high` (#e7e8e9) for hovered states or active utility panels.
 
### The "Glass & Gradient" Rule
To move beyond a flat SaaS look, use **Glassmorphism** for floating elements (like sticky headers or command palettes). Use `surface` colors at 80% opacity with a `20px` backdrop-blur. 
**Signature Texture:** Main CTAs or Hero sections should use a subtle linear gradient: `primary` (#3525cd) to `primary-container` (#4f46e5) at a 135-degree angle. This adds a "soul" to the interface that flat hex codes cannot achieve.
 
---
 
## 3. Typography: The Geist Technicality
We use **Geist Sans** for UI and **Geist Mono** for code blocks. This pairing establishes an immediate "engineered" authority.
 
- **Display (Geist Sans):** Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for landing headers. This creates a bold, editorial impact.
- **Headlines (Geist Sans):** `headline-md` (1.75rem) should be used for course titles. Pair this with `on-surface` (#191c1d) for high legibility.
- **Labels (Space Grotesk/Geist Mono):** Use `label-md` (0.75rem) for technical metadata (e.g., "EST. TIME," "DIFFCULTY"). These should be in All-Caps with +0.05em tracking to evoke a "blueprint" feel.
- **The Code Hero:** All code snippets must use **Geist Mono** within a `surface-container-highest` block. The contrast between the organic curves of the UI and the rigid geometry of the mono font reinforces the "technical" personality.
 
---
 
## 4. Elevation & Depth: Tonal Layering
We do not use shadows to show "height" in the traditional sense. We use them to show "floating."
 
- **The Layering Principle:** Depth is achieved by "stacking" tiers. Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a soft, natural lift without a single drop shadow.
- **Ambient Shadows:** When an element must float (e.g., a Modal or Popover), use an **Extra-Diffused Shadow**: `0 20px 50px -12px rgba(25, 28, 29, 0.08)`. The shadow color is a tinted version of `on-surface`, making it feel like ambient light rather than a gray smudge.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**: Use `outline-variant` (#c7c4d8) at **20% opacity**. 100% opaque borders are forbidden as they "box in" the content.
 
---
 
## 5. Components: Precision Engineered
All components follow the `xl` (1.5rem) or `lg` (1rem) roundedness scale to soften the technical "edge."
 
*   **Buttons**: 
    *   *Primary:* Gradient fill (Primary to Primary-Container), `xl` roundedness, white text. 
    *   *Tertiary:* No background, `primary` text, shifts to `surface-container-low` on hover.
*   **Chips (Status Badges)**: 
    *   High-contrast. For "Advanced" levels, use `tertiary` (#7e3000) text on `tertiary-fixed` (#ffdbcc) background. No borders.
*   **Input Fields**: 
    *   Use `surface-container-lowest` background with a "Ghost Border." On focus, the border opacity jumps to 100% using the `primary` color.
*   **Cards & Lists**: 
    *   **Strict Rule:** No divider lines. Separate items using `1.5rem` (xl) vertical white space or subtle background shifts between `surface-container` tiers.
*   **Code Playground (App Specific)**: 
    *   A split-pane view using `surface-container-highest` for the editor and `surface` for the output. Use a `2px` `primary` accent bar on the active line to denote focus.
 
---
 
## 6. Do's and Don'ts
 
### Do:
*   **Do** use asymmetrical layouts (e.g., a wide content column paired with a very slim, minimal metadata sidebar).
*   **Do** leverage "Space Grotesk" or "Geist Mono" for tiny utility labels to maintain the technical "spec-sheet" vibe.
*   **Do** use `surface-dim` for inactive states to keep the interface feeling quiet and focused.
 
### Don't:
*   **Don't** use 1px solid, high-contrast borders to separate content blocks.
*   **Don't** use standard "Drop Shadows." If it doesn't look like diffused natural light, it doesn't belong.
*   **Don't** use pure black (#000) for text. Use `on-surface` (#191c1d) to maintain a premium, ink-on-paper feel.
*   **Don't** crowd the interface. If in doubt, add an extra 16px of padding.