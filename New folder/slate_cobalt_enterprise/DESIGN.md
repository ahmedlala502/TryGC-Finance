# Design System Specification: The Architectural CRM

## 1. Overview & Creative North Star
This design system is built for high-stakes Sales Operations where data density meets executive clarity. Our Creative North Star is **"The Precision Curator."** 

Unlike standard "out-of-the-box" SaaS templates that rely on heavy borders and boxy grids, this system treats the interface as a series of curated, layered planes. We move away from "software as a tool" toward "software as an environment." We achieve this through **intentional asymmetry**, where key performance indicators (KPIs) are given editorial breathing room, and **tonal depth**, where the UI feels like stacked sheets of frosted glass rather than a flat digital canvas. The goal is to make the user feel like they are looking at a premium financial publication, not just a database.

---

## 2. Colors & Surface Logic

### The "No-Line" Rule
Standard CRM interfaces are cluttered with 1px borders. **In this system, 1px solid borders for sectioning are prohibited.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` data table sits on a `surface` background, creating a clean, edge-less transition that reduces visual noise and cognitive load.

### Surface Hierarchy & Nesting
We use a "Physical Layering" model. Use the `surface-container` tiers to define importance and nesting:
- **Base Level (`surface` / `#f8f9ff`):** The primary canvas for the application.
- **Section Level (`surface-container-low` / `#eff4ff`):** Large structural areas (e.g., the main content area).
- **Component Level (`surface-container` / `#e5eeff`):** The primary background for cards or widgets.
- **Active/Elevated Level (`surface-container-highest` / `#d3e4fe`):** Focused states or nested child elements.

### The "Glass & Gradient" Rule
To elevate the "Deep Navy" primary (`#000000` / Primary Container `#131b2e`), we utilize **Glassmorphism** for floating elements like tooltips, dropdowns, and sticky headers. Use semi-transparent surface colors with a `backdrop-blur` (12px–20px). 
*Signature Texture:* For primary CTAs, do not use flat hex codes. Apply a subtle linear gradient from `primary` to `primary_container` (Top-Left to Bottom-Right) to provide a "machined" satin finish.

---

## 3. Typography: The Editorial Scale

We pair **Manrope** (Display/Headlines) with **Inter** (Data/Labels) to balance character with utility.

| Level | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | High-level KPI values (Annual Recurring Revenue). |
| **Headline** | `headline-sm` | Manrope | 1.5rem | Page titles and major section headers. |
| **Title** | `title-md` | Inter | 1.125rem | Card titles and modal headers. |
| **Body** | `body-md` | Inter | 0.875rem | Standard data entries and descriptions. |
| **Label** | `label-sm` | Inter | 0.6875rem | Metadata, timestamps, and micro-copy. |

*Editorial Tip:* Use `display` tokens for numbers to give them "weight." Use `label-sm` in `on_surface_variant` (`#45464d`) for secondary data to create a high-contrast, professional hierarchy.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by "stacking" surface tiers. To create a "lift" for a sales card, place a `surface-container-lowest` (`#ffffff`) card on a `surface-container-low` (`#eff4ff`) background. This creates a soft, natural distinction without the "dirty" look of heavy shadows.

### Ambient Shadows
When an element must float (e.g., a Kanban card being dragged), use **Ambient Shadows**:
- **Blur:** 24px–40px.
- **Opacity:** 4%–6% of `on_surface` (`#0b1c30`).
- **Tint:** The shadow should not be grey; it should be a deep navy tint to match the brand's primary atmosphere.

### The "Ghost Border" Fallback
If accessibility requirements demand a border (e.g., in high-contrast modes), use the **Ghost Border**:
- Token: `outline_variant` (`#c6c6cd`) at **15% opacity**.
- *Prohibition:* Never use 100% opaque borders.

---

## 5. Components

### Buttons & Interaction
- **Primary:** Gradient fill (`primary` to `primary_container`) with `on_primary` text. Use `xl` (0.75rem) rounding.
- **Secondary:** Surface-tinted. No border. Use `secondary_container` background with `on_secondary_container` text.
- **Ghost/Tertiary:** No background. Transition to a subtle `surface_variant` on hover.

### Inputs & Fields
- **Text Inputs:** Use `surface_container_lowest` for the field background. The active state is indicated by a 2px "underline" or a subtle glow using `surface_tint`, rather than a full box stroke.
- **Validation:** Error states use `error` (`#ba1a1a`) for text, but the container should use `error_container` at 20% opacity to maintain the "Glass" aesthetic.

### Data Tables & Lists
- **The Divider Ban:** Do not use horizontal lines between rows. Use **vertical white space** (Spacing `3` / `0.6rem`) and alternating row tints (`surface` vs `surface_container_low`) to guide the eye.
- **Kanban Boards:** Columns should be defined by `surface_container_low` backgrounds with `lg` (0.5rem) rounded corners. Cards within the columns use `surface_container_lowest` to "pop" forward.

### Tooltips
- Always use Glassmorphism. `surface_container_highest` with 80% opacity and 12px blur. This ensures the data beneath is felt, even if obscured.

---

## 6. Do’s and Don’ts

### Do
- **DO** use the Spacing Scale religiously. Consistent gaps of `4` (0.9rem) or `8` (1.75rem) create the "Editorial" feel.
- **DO** use `surface_dim` for "disabled" or "empty" states to maintain a sophisticated tonal palette.
- **DO** leverage `surface_bright` for highlight areas to draw the user's eye to primary actions.

### Don't
- **DON'T** use pure black (#000000) for text. Always use `on_surface` (#0b1c30) to maintain the Deep Navy sophisticated undertone.
- **DON'T** use the default 8px rounding for everything. Use the scale: `xl` for large cards, `md` for small chips, and `none` for sidebars that anchor to the screen edge.
- **DON'T** use high-saturation reds/greens. Use the `success` and `error` tokens provided, which are calibrated for the `surface` palette.