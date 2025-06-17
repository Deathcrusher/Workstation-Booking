# UI Design Guide

This app supports light and dark themes. Use the toggle in the top-right corner to switch modes. The initial theme matches your operating system preference and is stored in local storage.

Custom colours are defined in `tailwind.config.js` using CSS HSL variables (`--color-primary`, `--color-muted-50`, `--color-muted-950`). Extend the palette by adding more variables and referencing them inside the config.
