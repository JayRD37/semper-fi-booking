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

## Booking inquiries

The booking form keeps an in-progress draft in the visitor's browser and sends completed inquiries to `semperfibooking@outlook.com` through FormSubmit. The form includes spam protection and requires a one-time FormSubmit activation from that mailbox before delivery begins.

## Publishing

Push to `main`. GitHub Actions publishes the static site. The custom domain is `www.semperfibooking.com`, with the root domain redirected to it.
