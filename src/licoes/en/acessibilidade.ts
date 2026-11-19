import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Accessibility and semantics',
  resumo: 'Semantic HTML as a free foundation, the accessibility tree, keyboard focus, contrast and aria-live for content that changes on its own.',
  objetivos: [
    'What the accessibility tree is',
    'Why semantic HTML comes before ARIA',
    'What ARIA does and does not do',
    'Focus and keyboard navigation',
    'WCAG minimum contrast',
    'Announce changes with aria-live',
  ],
  passos: {
    arvore: {
      titulo: 'The browser builds one more tree',
      narracao:
        'Besides the DOM and the render tree, the browser builds the accessibility tree. For each relevant element it stores a role (button, link, heading), an accessible name and a state (checked, expanded). Screen readers, voice control and tests using getByRole read this tree, not the pixels. If something is not in it, for those people it does not exist.',
    },
    semantica: {
      titulo: 'Semantic HTML is accessibility for free',
      narracao:
        'A <button> comes with the button role, joins the Tab order, responds to Enter and Space and takes its name from its own text. A <div onClick> has none of that: it disappears from the keyboard and the reader announces just loose text. <nav>, <main>, <h1> to <h6>, <label> and lists become navigation landmarks. The first rule of ARIA: if a native element has the behavior, use it.',
    },
    aria: {
      titulo: 'ARIA: for what HTML does not cover',
      narracao:
        'ARIA adds role, name and state when there is no native element, as in tabs, comboboxes and trees: role="tab", aria-selected, aria-expanded, aria-controls. But it only changes what is announced, never the behavior: role="button" gives no focus and does not respond to Enter, that is up to you. The WAI-ARIA Authoring Practices describe the expected keyboard for each component. Bad ARIA is worse than no ARIA.',
    },
    teclado: {
      titulo: 'Focus and keyboard',
      narracao:
        'Everything that works with a mouse has to work with a keyboard. Tab order follows DOM order, so visual order and code order must match; avoid positive tabindex. Focus must be visible (:focus-visible) and, in a modal, move into it, stay trapped while it is open and return to the trigger when it closes. In this project, the closed menu drawer is inert and leaves the Tab order.',
      nota: 'the focus ring shows where the keyboard is',
    },
    contraste: {
      titulo: 'Contrast and color',
      narracao:
        'WCAG asks for a contrast of at least 4.5:1 between text and background, and 3:1 for large text and for icons and control borders. Color must never be the only way to convey something: a field with an error needs text or an icon besides the red. Respecting prefers-reduced-motion and handling 200% zoom without breaking the page are part of the same care.',
    },
    'aria-live': {
      titulo: 'aria-live: announce what changes on its own',
      narracao:
        'When content changes without focus moving to it (a toast, a counter, a search result), the screen reader does not notice. An aria-live="polite" region (or role="status") announces the change when the person pauses; "assertive" (role="alert") interrupts and should be rare. The region has to exist in the DOM before the change. This lesson’s guide uses aria-live="polite": each new step is read aloud.',
    },
  },
  fontes: {
    'https://www.w3.org/TR/using-aria/#rule1': 'The rules for using ARIA, starting with preferring native HTML.',
    'https://www.w3.org/WAI/ARIA/apg/': 'Component patterns with the expected keyboard and ARIA.',
    'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html': 'Why 4.5:1 and 3:1, and what counts as large text.',
    'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html': 'Contrast for icons, borders and focus states.',
    'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions': 'polite, assertive, role="status" and the caveats of each.',
    'https://web.dev/learn/accessibility': 'A full course: semantics, focus, color, motion and testing.',
    'https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree': 'What the tree stores and how to inspect it in DevTools.',
  },
} satisfies TraducaoDeLicao;
