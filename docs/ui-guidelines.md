# Shared site chrome

The header and footer of `saizeriya-order` follow the layout used in
`naoiw.github.io`, `sudoku-solver`, `market-tracker`, `switchbot-logger`
and `audio-visualizer`.

| Token | Desktop | Mobile (<=620px) |
| --- | --- | --- |
| Container max width | 1180px | 1180px |
| Horizontal gutter | 28px | 17px |
| Header height | 78px | 67px |
| Brand font size | 16px | 13px (saizeriya-specific fit) |
| Footer font size | 12px | 12px |
| Footer padding | 28px top / 32px bottom | same |

Horizontal dividers are drawn on `.header-inner` and `.footer-inner`
rather than on full-width outer containers, so both line endpoints align
with the main content. The repository link lives in the footer on the right.
Header navigation (Quiz / Gallery) remains accessible on a single row on
small devices. Keep the light background and green action buttons.

For future chrome changes, use CSS variables under `:root` instead of
hardcoding the same size independently. Gallery and quiz implementation
and the 31-item dataset should not be affected by chrome styling changes.

Preview: https://naoiw.github.io/saizeriya-order/develop/
