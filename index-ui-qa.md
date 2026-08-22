# Index UI QA Notes

The attached reference uses a dark navy cyber-studio system with a sticky translucent header, cobalt-to-cyan primary CTA, pill-shaped action buttons, a mountain/mascot hero image, four service cards, an empty portfolio state when no verified work exists, a six-step process, and a lead contact form.

The existing Home already preserves the reference structure and real-data safeguards. The refresh added a stronger glass header shadow, pill-shaped CTA/outline buttons, rounded brand mark and form controls, deeper card shadows, a subtle service-card hover sheen, and tighter mobile spacing. Browser QA confirmed the Home route renders the Thai navigation, hero, service cards, empty portfolio state, process section, contact form, and footer. The contact navigation button scrolled the page down successfully. Portfolio remains an intentional empty state, so no share action is rendered until verified portfolio data exists.

Validation completed: desktop full-page screenshot at 1440x1000, mobile full-page screenshot at 390x844, `pnpm check`, `pnpm test` (23 tests), and `pnpm build` all passed.
