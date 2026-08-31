# Semper Fi Booking & Entertainment

Public website for Semper Fi Booking & Entertainment.

## Local preview

Serve the repository root with any static web server, then open `index.html` through that server. The production deployment uses GitHub Pages through `.github/workflows/pages.yml`.

## Content updates

- Main page content: `index.html`
- Styling and responsive rules: `app/globals.css`
- Navigation and inquiry-builder behavior: `site.js`
- Website images: `images/`

The approved public phone number is `(402) 304-7059` / `+14023047059`.

## Booking inquiry integration point

The current booking form stores a draft only in the visitor's browser and prepares a copyable inquiry summary. It does not transmit personal information. When a business email or external form provider is approved, connect the submission in `site.js`; never commit private keys or secrets.

## Publishing

Push to `main`. GitHub Actions publishes the static site. The custom domain is `www.semperfibooking.com`, with the root domain redirected to it.
