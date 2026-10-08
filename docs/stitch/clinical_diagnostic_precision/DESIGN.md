---
name: Clinical Diagnostic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1daeb'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#e0e9f9'
  surface-container-highest: '#dae3f4'
  on-surface: '#131c28'
  on-surface-variant: '#3f484b'
  inverse-surface: '#28313d'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f797b'
  outline-variant: '#bfc8cb'
  surface-tint: '#1e6774'
  primary: '#004550'
  on-primary: '#ffffff'
  primary-container: '#0f5e6b'
  on-primary-container: '#93d5e4'
  inverse-primary: '#8fd1e0'
  secondary: '#525f73'
  on-secondary: '#ffffff'
  secondary-container: '#d6e3fb'
  on-secondary-container: '#586579'
  tertiary: '#004929'
  on-tertiary: '#ffffff'
  tertiary-container: '#00633a'
  on-tertiary-container: '#81dea5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#abedfc'
  primary-fixed-dim: '#8fd1e0'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#d6e3fb'
  secondary-fixed-dim: '#bac7de'
  on-secondary-fixed: '#0f1c2d'
  on-secondary-fixed-variant: '#3b485a'
  tertiary-fixed: '#98f6bb'
  tertiary-fixed-dim: '#7cd9a1'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#f8f9ff'
  on-background: '#131c28'
  surface-variant: '#dae3f4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
  mono-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.5rem
  mono-data-md:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  mono-data-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is tailored for clinical decision-support environments deployed across rural clinics and district health centers. The interface communicates absolute clinical integrity, calm analytical clarity, and rigorous objectivity. It avoids hyper-sensationalist tech styling or anxious emergency-room aesthetics, favoring steady, non-alarmist authority.

The visual style blends **Corporate / Modern** clinical neutrality with **Structured Scientific Functionalism**. The canvas prioritizes crisp readability under variable physical lighting conditions—such as low-grade monitors, high-glare rural consulting rooms, and outdoor mobile clinics. Visual weight is concentrated on clinical imagery (chest radiographs) and quantometric outputs (probabilities, confidence bands, measurements). UI chrome remains deliberately restrained to minimize cognitive fatigue during multi-hour review shifts.

## Colors

The palette enforces strict WCAG AA contrast conformance (minimum 4.5:1 for body and 3:1 for large graphical components) across every semantic pairing.

### Core Canvas & Neutrals
- **Background (`#F7F9FB`)**: Off-white clinical canvas reducing screen glare during long working hours.
- **Surface (`#FFFFFF`)**: Pure white reserved for modular diagnostic cards, tool palettes, and modal sheets.
- **Body Text (`#1B2430`)**: Deep slate charcoal, achieving over 12:1 contrast against `#FFFFFF` for continuous reading.
- **Muted Text (`#475467`)**: Secondary analytical labels, metric units, and metadata stamps.
- **Borders (`#D0D5DD`)**: Structural 1px boundary line separating diagnostic panels.
- **Dividers (`#E4E7EC`)**: Low-contrast internal table rules and sub-tier separators.

### Primary Identity
- **Primary Brand (`#0F5E6B`)**: Deep teal acting as the primary interactive and confirmation anchor.
- **Primary Hover (`#0B4A54`)**: Darkened teal state for definite pointer interaction.
- **Primary Subtle / Light Tint (`#E6F4F6`)**: Low-saturation teal background for active navigational tabs and selected panel states.

### Clinical Tiers & Diagnostic Uncertainty
Semantic colors strictly categorize triage findings and algorithm confidence without inducing panic:
- **Tier HIGH (`#B42318`)**: High diagnostic suspicion. Light background `#FEF3F2`, border `#FECDCA`.
- **Tier MEDIUM (`#B54708`)**: Moderate confidence or borderline finding. Light background `#FFFAEB`, border `#FEDF89`.
- **Tier LOW (`#475467`)**: Low suspicion or baseline variant. Light background `#F2F4F7`, border `#D0D5DD`.
- **Tier SUCCESS / Validated (`#067647`)**: Clinician-confirmed or clear benchmark. Light background `#ECFDF3`, border `#A6F4C5`.
- **Tier UNRELIABLE (`#475467`)**: Indicates sensor noise, motion blur, or model out-of-distribution input. Rendered using neutral text alongside a 45-degree repeating diagonal hash stroke pattern (`repeating-linear-gradient(45deg, #E4E7EC, #E4E7EC 4px, #FFFFFF 4px, #FFFFFF 8px)`).
- **Experimental Protocol (`#6941C6`)**: Violet indicator reserved for cutting-edge or provisional models. Light tint `#F9F5FF`, border `#D6BBFB`.

## Typography

The typography scale utilizes **Inter** for core UI, interactive mechanisms, and prose guidance, prioritizing legibility at dense information scales. 

### Monospace Precision
All statistical quantities, numerical observations, and technical attributes must use **JetBrains Mono** (or SF Mono / IBM Plex Mono system fallbacks). This applies strictly to:
- Model probability values (e.g., `87.4%`)
- Confidence boundaries (e.g., `[CI: 0.76 - 0.92]`)
- Physical dimensions (e.g., `14.2 mm`)
- DICOM timestamps and patient case serial hashes

Tabular numbers ensure that statistical metrics remain vertically aligned during comparative evaluations across multi-slice reads. Minimum general text is clamped to 14px, while 12px is permitted only for capitalized metadata badges and unit tags.

## Layout & Spacing

The layout is desktop-first, calibrated around a 1440px viewport while retaining graceful responsiveness down to a 360px mobile viewport.

### Grid & Layout Structure
- **Desktop (1024px to 1440px+)**: A rigid 12-column grid system with 24px gutters and 32px margins. The layout supports a persistent 280px left navigation and triage queue, an expandable central DICOM radiograph inspection canvas (columns 3 through 8), and a dedicated right-hand diagnostic evaluation panel (columns 9 through 12).
- **Tablet (768px to 1023px)**: Left navigation collapses into a condensed 72px icon rail. The primary canvas and evaluation panel stack into vertically scrollable regions or tabbed inspect/report views.
- **Mobile (360px to 767px)**: Single-column flow with 12px gutters and 16px page margins. The desktop navigation sidebar transforms into a fixed 60px bottom bar with clear 48px tactile zones.

### Spatial Rhythms
Spacing operates on a strict 4px/8px incremental grid. Data-dense panels apply compact 8px (`space-sm`) and 16px (`space-md`) paddings to maximize available display area for radiograph interpretation without crowding interactive controls.

## Elevation & Depth

Visual depth is achieved through **low-contrast outlines** paired with **delicate ambient elevation**, entirely avoiding heavy Dropcraft or high-blur decorative shadows that could obscure diagnostic image monitors.

- **Level 0 (Flat Surface / Canvas)**: `#F7F9FB`, completely flat, 0px border.
- **Level 1 (Card & Modular Panel)**: `#FFFFFF` fill with a crisp 1px solid `#D0D5DD` boundary and an ambient shadow: `0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)`.
- **Level 2 (Active Tools, Drawers, Dropdowns)**: `#FFFFFF` fill, 1px solid `#D0D5DD`, elevated using `0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)`.
- **Level 3 (Diagnostic Modals & Image Overlays)**: `#FFFFFF` fill, 1px solid `#D0D5DD`, with elevated focus shadow `0 12px 16px -4px rgba(16, 24, 40, 0.1), 0 4px 6px -2px rgba(16, 24, 40, 0.05)`.
- **Image Viewport Layer**: Encapsulated with a dark border `#1B2430` to prevent white luminance bleed onto grayscale radiograph regions.

## Shapes

The design system utilizes **Rounded (Tier 2)** architecture across cards and primary containers, balancing medical precision with modern clarity:

- **Cards & Data Panels**: Fixed `12px` (`0.75rem`) border radius, framing clinical findings cleanly.
- **Buttons & Form Fields**: `8px` (`0.5rem`) border radius, preserving structured alignment.
- **Status Chips & Probability Pills**: Fully rounded (`9999px` / pill) to clearly separate discrete status indicators from rectangular data containers.
- **Radiograph Viewport Framing**: `8px` corner radius with crisp inner clipping (`overflow: hidden`).
- **Interactive Checkboxes & Segmented Controls**: `4px` to `6px` radius.

## Components

### Buttons
All buttons maintain a strict minimum target size of 44px height (desktop) and 48px (mobile) to accommodate fast clinical interactions:
- **Primary**: Solid Deep Teal `#0F5E6B` background, white text, 8px radius. Hover: `#0B4A54`. Focused: 2px offset with `#0F5E6B` focus ring.
- **Secondary**: `#FFFFFF` background, 1px solid `#D0D5DD`, text `#1B2430`. Hover: `#F2F4F7`.
- **Destructive**: Solid Clinical Red `#B42318` background, white text. Hover: `#912018`.
- **Ghost**: Transparent background, text `#475467`. Hover: `#E6F4F6` with `#0F5E6B` text.

### Clinical Badges & Status Chips
Pill-shaped tokens (`padding: 4px 10px`, typography `label-sm` with monospace value pairing):
- **High Tier**: `#FEF3F2` background, `#B42318` text, 1px `#FECDCA` border.
- **Medium Tier**: `#FFFAEB` background, `#B54708` text, 1px `#FEDF89` border.
- **Low Tier**: `#F2F4F7` background, `#475467` text, 1px `#D0D5DD` border.
- **Success / Validated**: `#ECFDF3` background, `#067647` text, 1px `#A6F4C5` border.
- **Unreliable / Artifact**: `#F2F4F7` background with a diagonal 45° stripe pattern, `#475467` text, 1px `#D0D5DD` border.
- **Experimental Protocol**: `#F9F5FF` background, `#6941C6` text, 1px `#D6BBFB` border.

### Uncertainty & Confidence Indicators
Confidence intervals are presented using a standardized visual bar accompanied by numerical values:
- Monospace label display: `0.84 [95% CI: 0.78, 0.89]`.
- Horizontal micro-range bar: 4px track height `#E4E7EC`, filled confidence band `#0F5E6B` with a 2px vertical tick for the point estimate.

### Review Banners
- **Warning ("Needs clinician review")**: Background `#FFFAEB`, 1px solid border `#FEDF89`, text `#B54708`. Displays an amber icon alongside bold notification copy.
- **Info / Triage Notice**: Background `#E6F4F6`, border `#B2DFE6`, text `#0F5E6B`.

### Form Fields & DICOM Dropzones
- **Inputs**: Min-height 44px, background `#FFFFFF`, border 1px solid `#D0D5DD`, placeholder `#475467`. Active focus state triggers a 2px `#0F5E6B` outline with zero latency.
- **Dropzone Canvas**: 2px dashed border `#D0D5DD`, background `#F7F9FB`, transitioning to solid `#0F5E6B` with `#E6F4F6` fill on drag-over.

### Cards & Data Tables
- **Cards**: Surface `#FFFFFF`, 12px radius, 1px solid `#D0D5DD`, subtle elevation.
- **Tables**: Sticky header with `#F7F9FB` background, 1px bottom border `#D0D5DD`, uppercase `label-sm` headers. Cells use 14px body text, with all numerical measurements aligned right using `mono-data-md`.

### State Handling
- **Empty States**: Neutral slate illustration, clear title, concise recovery suggestion, and a primary action button.
- **Skeletons**: Linear shimmer pulse using `#E4E7EC` to `#F2F4F7`.
- **Error State**: Non-blocking card level alerts with `#FEF3F2` background, clear error diagnostics in monospace, and retry controls.

### Mandatory Regulatory Disclaimer
- **Persistent Footer Note**: Anchored at the bottom of the interface viewport or pinned to diagnostic export sheets:
  *"Decision support only. Not a diagnosis. Requires clinician review."*
  Set in `Inter` Medium, 12px, color `#475467`, background `#F2F4F7`, with a 1px top border `#E4E7EC`.