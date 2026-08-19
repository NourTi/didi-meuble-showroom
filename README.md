# Didi Meuble — Digital Showroom

An Arabic-first furniture showroom and delivery-inquiry foundation for **Didi Meuble** in El Oued, Algeria.

## Included

| Area | Scope |
| --- | --- |
| Product discovery | Bedrooms, salons, and children’s rooms with room-first navigation |
| Customer inquiries | Delivery requests with wilaya, commune, address, quantity, and contact details |
| Owner tools | Protected catalogue and inquiry management workspace |
| Product interaction | Local Three.js material study for the main furniture collections |
| Quality foundations | Responsive UI, metadata, structured data, security headers, and validation tests |

## Public presentation

The repository’s GitHub Pages site is a lightweight static introduction to the Didi Meuble showroom. The working application runs separately because it includes server-side validation, database persistence, protected owner tools, and inquiry notifications.

## Local development

```bash
pnpm install
pnpm dev
```

Validation commands:

```bash
pnpm check
pnpm test
pnpm build
```

## Next implementation steps

1. Add Didi’s approved product photography, prices, and exact dimensions.
2. Configure delivery coverage and fees by wilaya.
3. Add a compliant remote-payment checkout for confirmed orders.
