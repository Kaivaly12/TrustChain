# Trust Chain

A product lookup and registration demo built with React, TypeScript, Vite, and Express.

Scan a barcode or QR code, upload a barcode photo, or enter a product code. The app looks for a complete match in its local registry (including equivalent UPC-A and zero-padded EAN/GTIN forms) and displays the recorded batch, origin, and any recall notice. Brand accounts can add products individually or with a CSV file. Shoppers can submit reports and questions.

## What the results mean

- The included product records, ledger blocks, and catalog information are demo data.
- A registered code scores 100; a recalled record scores 10; an unregistered code scores 0. These scores describe registry matching, not the probability that a physical item is genuine.
- A copied barcode can match a registered record. No matching record does not prove an item is counterfeit.
- The app does not query GS1 or independently inspect packaging seals. Reference nutrition and allergen details may differ from the pack in your hand.
- The ledger and account flows run locally. Reports are held in server memory and disappear when the server restarts. This is not a production authentication or blockchain deployment.

## Run locally

Use Node.js 24 and Bun with the checked-in lockfile:

```bash
git clone https://github.com/Kaivaly12/TrustChain.git
cd TrustChain
bun install --frozen-lockfile
npm run dev
```

Open `http://localhost:3000`. To use another port, set `PORT` when starting the server.

## Optional assistant

The server can use `GEMINI_API_KEY` from a local `.env` file for product suggestions and chat. Without it, the app uses built-in sample data and help responses. Generated information is reference material and cannot establish authenticity. Keep API keys on the server.

## Checks

```bash
npm run lint
npm test
npm run build
```

## Project layout

- `src/components/`: scanner, registration, reports, and account screens
- `src/services/`: local ledger, product lookup, barcode utilities, and assistant client
- `server.ts`: Express API and Vite development server
- `docs/`: design proposals for a larger system, including smart contracts, FastAPI, and machine learning. Those proposals do not describe deployed integrations in this demo.
