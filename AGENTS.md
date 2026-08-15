# Repository Instructions

## Scope and authority

These instructions apply to the entire repository.

- Follow the site owner's latest explicit request when it conflicts with this file.
- Keep changes within the requested scope. Do not add pages, dependencies, features or content merely to make the site appear more complete.
- Inspect the current repository before changing it. Preserve working behaviour and unrelated owner changes.
- Do not commit, push, deploy or publish unless the owner explicitly asks.

## Product intent

JetDev is a recruitment-focused portfolio and online resume for Jiahang "Jet" Sun. Its primary audience is recruiters and hiring managers considering candidates for Graduate or Junior Software Developer, Frontend, Backend and general IT roles in Australia.

Optimise the experience for a short recruitment scan. The content priority is:

1. Projects
2. Experience
3. Hero

The intended scope is one primary page and up to three project detail pages. Do not turn the site into a large content platform without approval.

## Language and editorial rules

All public-facing content must use Australian English.

This includes navigation, headings, body copy, buttons, forms, validation, errors, empty states, metadata, Open Graph text, image alternative text, ARIA labels, downloadable copy and project case studies.

- Use Australian spelling such as `colour`, `organisation`, `optimise` and `centre`.
- Set the document language to `en-AU`.
- Use Australian date formats in prose, for example `16 August 2026`.
- Keep official product names, programming identifiers, library names and quoted source text in their canonical form.
- Use `Resume` consistently for the agreed navigation and call-to-action label.
- Prefer short, concrete sentences. Avoid hype, filler, forced metaphors and generic claims.
- As a project house style, do not use em dashes or en dashes as separators in public-facing copy. Rewrite the sentence or use a regular hyphen where appropriate.

## Content integrity

Never invent or embellish personal information.

- Do not fabricate projects, employers, responsibilities, outcomes, metrics, dates, qualifications, technologies, testimonials, links or availability.
- Treat examples in planning documents as proposed content until the owner confirms they are factual.
- Mark missing source content as `TODO: content confirmation` in source files and do not render it on the public site.
- Do not ship lorem ipsum, fake links, fake company names, fake screenshots or realistic-looking placeholder data.
- Describe Jet's own contribution separately from team outcomes.
- Do not expose private employer code, confidential data or restricted screenshots.
- Hide a GitHub, Live Demo, Case Study or Resume action when its real destination is unavailable. Never render an inactive or misleading call to action.
- List only technologies Jet has genuinely used. Never use skill percentages, star ratings or unverified proficiency labels.
- Prefer accurate qualitative outcomes when no verified quantitative result is available.

When the available evidence is incomplete, reduce or hide the content. Do not fill gaps to make the page look finished.

## Technology

- Use Vue. For a new scaffold, use the current stable Vue 3 release unless the owner specifies otherwise.
- Prefer the Composition API and single-file components.
- Do not introduce React, Angular or another front-end framework.
- Confirm a dependency exists in `package.json` before importing it. Add a dependency only when it solves a real project need.
- Keep state local unless multiple distant components genuinely need shared state.
- Use Vue Router only for routes that have been approved, such as project detail pages.
- Tailwind CSS is approved. Map its theme to `src/styles/tokens.css`; do not use arbitrary utilities or default visual scales that bypass semantic tokens.
- Use Inspira UI selectively through its copy-and-customise component model. Approved adaptations are Particles Background for the homepage Hero, Text Highlight and a single-use Blur Reveal for the About Me copy, and Liquid Logo for the colour treatment inside the owner-approved `JET` SVG outline. Do not extend these effects or add another Inspira component without a concrete product need and owner approval.
- Keep components focused and named by responsibility. Extract reusable primitives when repetition is proven, not in anticipation of it.
- Use semantic HTML before adding JavaScript behaviour or ARIA.
- After the project is scaffolded, record the exact install, development, test and build commands in `README.md`. Do not guess commands before they exist.

## Global design tokens

Every authored visual decision must come from the shared global token system.

Once the Vue application is scaffolded, use `src/styles/tokens.css` as the single source of truth and import it once at the application entry point. If the final scaffold requires a different path, keep one clearly documented global source rather than duplicating token definitions.

The global tokens must cover at least:

- colours and semantic states
- font families, sizes, weights, letter spacing and line heights
- spacing and section rhythm
- component and layout sizes, aspect ratios and opacity
- container widths and layout gutters
- border widths and styles
- corner radii
- shadows
- z-index layers
- motion durations and easing
- shared responsive breakpoints or their central configuration

Use two layers where useful:

1. Primitive tokens, such as `--colour-neutral-950` and `--space-4`.
2. Semantic tokens, such as `--colour-text-primary`, `--colour-surface-page` and `--space-section-block`.

Components should consume semantic tokens. Do not make component files depend directly on raw palette values when a semantic role can express the intent.

### Token enforcement

- Outside the global token source, do not hard-code visual values in any Vue component, page stylesheet, base stylesheet, utility stylesheet, inline style or JavaScript or TypeScript style object.
- Do not hard-code hex, RGB, HSL or named design colours outside the global token source.
- Do not hard-code design spacing, font metrics, aspect ratios, opacity, borders, radii, shadows, z-index values, animation durations or easing outside the global token source.
- Do not declare component-local custom properties as a way to bypass the global token system. Add a properly named global token instead.
- Components may use calculations composed from semantic tokens only when the calculation is intrinsically fluid or structural. Do not multiply primitive tokens to create a one-off design value. Add a reusable semantic token instead.
- Structural CSS values such as `0`, `auto`, `100%`, `none`, `inherit`, `currentColor`, grid line numbers and fractional grid units are allowed when they do not encode a reusable visual decision.
- Keep breakpoint values in one shared configuration because standard CSS custom properties cannot be used directly in media-query conditions.
- If a utility CSS framework is introduced with approval, map it to the same global tokens. Arbitrary values such as `bg-[#123456]`, `px-[13px]` or `rounded-[7px]` are prohibited.
- If light and dark modes are implemented, switch semantic token values globally. Components must not carry separate local colour palettes.

## Geometry and shape system

The interface uses an all-sharp shape system with one approved navigation exception.

- Use only straight lines and right-angled rectangles for interface structure, containers and decoration.
- The default radius token is `--radius-none: 0`.
- The outer top-navigation surface may use `--radius-navigation-small`, as explicitly approved by the owner. This token must not be reused by cards, buttons, menu items or other surfaces.
- Buttons, cards, inputs, navigation controls, modals, menus, tags, project images, focus indicators and content panels must have square corners.
- Do not use rounded cards, pill buttons, pill tags, circular badges, circular icon containers, blobs, curved dividers, arched masks or decorative curves.
- Project screenshots and photography may contain naturally curved subjects, but their page containers and crops must remain rectangular with square corners.
- Existing third-party brand marks may retain their official geometry. Do not place them inside a rounded or circular container.
- A rounded exception is permitted only after an explicit owner request. Add a named global token for the approved exception and document where it applies. Never add a one-off radius literal.

References such as Linear, Vercel and Raycast are inspiration for typography, hierarchy, spacing and restraint only. Do not copy their rounded components.

## Visual direction

Design read: a developer portfolio for recruiters, using a restrained modern SaaS and editorial layout language with strong typography, purposeful whitespace and orthogonal geometry.

Use these design controls as an initial working direction:

- `DESIGN_VARIANCE: 6/10` for controlled asymmetry rather than a centred template.
- `MOTION_INTENSITY: 4/10` for subtle feedback and restrained entry transitions.
- `VISUAL_DENSITY: 4/10` for quick scanning without sparse filler.

These values are design heuristics, not numerical acceptance tests. Revisit them when the owner provides a more specific visual direction.

Additional rules:

- Start with a neutral palette and one consistent accent colour. Treat this as an initial direction and change it through the global tokens when the owner approves a different palette.
- Prefer borders, alignment and whitespace over excessive cards and shadows.
- Use cards only when a distinct container communicates real hierarchy.
- Avoid a generic row of three identical cards. Give selected projects a deliberate hierarchy.
- The initial composition preference is a left-aligned or asymmetric hero rather than a generic centred hero. Change it when a later visual brief gives a stronger reason.
- Use real, owner-approved project screenshots. Do not recreate fake project interfaces from decorative `div` elements.
- Glassmorphism is approved only for the top-navigation surface. The homepage Hero may use the approved Inspira-derived square-particle background. Do not extend either treatment to other sections without approval.
- Do not default to neon, glow effects, typing animations, custom cursors, skill bars, decorative status dots or scroll cues.
- Keep Inspira UI restrained. Adapt selected components to the global tokens, accessibility requirements, reduced-motion behaviour and approved geometry instead of importing their generic theme.
- Every animation must communicate hierarchy, feedback or a state change. Animate only `transform` and `opacity` where practical.
- Honour `prefers-reduced-motion` for all non-essential movement.
- Dark and light mode are optional. If added, both must be implemented through global semantic tokens and verified independently.

## Information architecture

Use this default desktop navigation:

`Home | About | Projects | Experience | Contact`

Place `Resume` as the distinct action on the right. Keep desktop navigation on one line.

Use this homepage order:

1. Hero
2. About Me
3. Selected Projects
4. Technical Skills
5. Experience
6. Education
7. Contact

Place a concise `Currently` statement near the Hero when the owner's job-search status and target locations have been confirmed.

### Section contracts

#### Hero

- Show the confirmed name, professional title, Melbourne location and one short positioning sentence.
- Keep the supporting sentence to no more than 20 words where possible.
- Prioritise `View Projects` and `Download Resume`.
- Include verified GitHub and LinkedIn destinations without overcrowding the primary call to action.
- Keep the primary actions visible in the initial viewport.

#### About Me

- Use approximately 100 to 150 words.
- Focus on confirmed education, development direction, relevant experience, the problems Jet likes solving and the roles being sought.
- Do not repeat the full resume.

#### Technical Skills

- Group confirmed skills under Frontend, Backend, Database and Tools when those groups fit the evidence.
- Do not use progress bars, percentages, ratings or decorative scoring.

#### Projects

- Aim for three substantial, confirmed projects rather than many small exercises.
- Give the projects the strongest visual and editorial emphasis on the page.
- Do not disclose confidential employer material.

Each project should provide, when confirmed:

- project name
- one-sentence problem statement
- technology stack
- Jet's specific responsibilities
- two or three technically meaningful implementation points
- principal features or outcome
- real screenshot with accurate alternative text
- working GitHub, Live Demo and Case Study links only when each exists

Use this case-study sequence:

`Problem -> Your Role -> Technical Approach -> Challenges -> Result`

#### Experience and Education

- Include only the most relevant confirmed experience.
- Use three or four evidence-based bullets per role rather than copying the resume.
- Keep education to the qualification, institution and completion year unless a course is directly relevant.

#### Contact and Resume

- Provide confirmed email, LinkedIn, GitHub and `Melbourne, Australia` details.
- A contact form is optional and should not be added without a clear need.
- Link only to the real resume PDF. A separate `/resume` page is optional, but it does not replace the PDF.

## Accessibility, responsiveness and performance

- Use semantic landmarks and a logical heading hierarchy.
- Use native links and buttons for their intended actions.
- Ensure all functionality works with a keyboard.
- Provide a clear, square-cornered focus indicator.
- Meet WCAG 2.2 AA colour contrast at minimum.
- Give meaningful images accurate alternative text and decorative images empty alternative text.
- Do not use colour alone to convey meaning.
- Provide explicit mobile, tablet and desktop layouts. Multi-column content must collapse intentionally below its shared breakpoint.
- Avoid fixed viewport heights. Use a shared viewport token, initially defined as `--size-viewport-block-min: 100dvh`, only when a full-height section is justified.
- Reserve image dimensions to prevent layout shift and lazy-load content below the initial viewport.
- Target LCP below 2.5 seconds, INP below 200 milliseconds and CLS below 0.1.
- Do not ship console errors, broken links, empty actions or inaccessible hidden content.

## Required workflow

For each implementation request:

1. Inspect the current code, assets and confirmed source content.
2. State any assumption that would materially affect content, scope or design.
3. Make the smallest coherent change that fulfils the request.
4. Reuse or extend global tokens before writing component styles.
5. Review every public-facing string for Australian English and factual accuracy.
6. Verify keyboard use, responsive behaviour and reduced-motion behaviour where relevant.
7. Run the applicable lint, tests and production build. Report any check that could not be run.

## Definition of done

- [ ] The implementation uses Vue.
- [ ] Every public-facing string uses Australian English.
- [ ] Every published personal claim has been confirmed by the owner.
- [ ] No placeholder content, fake metrics, fake screenshots or inactive links are visible.
- [ ] Every authored visual decision comes from the global design tokens.
- [ ] Component styles contain no arbitrary colours, spacing, typography, radii, shadows or motion values.
- [ ] Interface structure and decoration use only straight lines and square corners, except for the approved outer navigation radius.
- [ ] No rounded rectangle, pill, circle or curved decoration appears without explicit approval.
- [ ] The homepage follows the agreed information hierarchy.
- [ ] Skills are grouped without percentages or proficiency scores.
- [ ] Project responsibilities clearly describe Jet's own contribution.
- [ ] Navigation and interactive elements work by keyboard.
- [ ] Focus states are visible and square-cornered.
- [ ] Colour contrast meets WCAG 2.2 AA.
- [ ] Reduced-motion behaviour works.
- [ ] Mobile, tablet and desktop layouts have been checked.
- [ ] Resume, GitHub, LinkedIn, email and project links have been verified.
- [ ] There are no browser console errors.
- [ ] The applicable lint, tests and production build pass.
