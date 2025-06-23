# UI Design Guide

This app supports light and dark themes. Use the toggle in the top-right corner to switch modes. The initial theme matches your operating system preference and is stored in local storage.

Custom colours are defined in `globals.css` and referenced in `tailwind.config.js`.
The primary palette uses a soft blue tone for a smoother look. Light and dark themes
share the same variables, so updating them in `:root` automatically adjusts the entire UI.
