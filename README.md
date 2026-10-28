# TrustTag: Anti-Counterfeit Verification Platform
> **Aadhaar-Style Cryptographic & AI Provenance Verification for Physical Products**  
> *Target Market: India (Pharmaceuticals, Footwear/Fashion, Consumer Electronics, and P2P Resale)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ERC-721](https://img.shields.io/badge/Solidity-ERC--721-363636.svg)](docs/02_SMART_CONTRACTS_SPEC.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-009688.svg)](docs/03_FASTAPI_BACKEND_SPEC.md)
[![Isolation Forest](https://img.shields.io/badge/scikit--learn-Isolation_Forest-F7931E.svg)](docs/04_ML_PIPELINE_SPEC.md)
[![MobileNetV2](https://img.shields.io/badge/TensorFlow-MobileNetV2-FF6F00.svg)](docs/04_ML_PIPELINE_SPEC.md)
[![Framer Motion](https://img.shields.io/badge/UI-Framer_Motion_&_Shadcn-0055FF.svg)](src/)

---

## 1. Problem Formulation
In high-risk consumer markets like India, counterfeit goods (fake antibiotics, duplicate sneakers, counterfeit chargers) cause fatal healthcare tragedies, destroy brand enterprise value, and defraud consumers.

- **Blockchain Alone Is Insufficient**: Blockchain only proves data immutability on a digital ledger; it cannot determine whether the physical shoe or medicine pack is genuine or if the QR code was photostat-replicated 5,000 times across 10 cities.
- **AI Alone Is Insufficient**: Computer vision alone cannot prove authorized manufacturing authority or unbroken distributor custody.
- **The TrustTag Solution**: Fuses **4 independent parallel signals** into an auditable **Trust Score (0–100)** with dynamic weight re-normalization, hard safety overrides, and plain-language explanations in English and Hinglish.

---

## 2. High-Level System Architecture

```
                                [ Consumer Scan / Retail Kiosk ]
                                               │
                                 POST /verify (Async Parallel)
                                               │
             ┌─────────────────────────┬───────┴─────────────────┬─────────────────────────┐
             ▼                         ▼                         ▼                         ▼
   [ Signal 1: Web3 ]       [ Signal 2: Anomaly ]      [ Signal 3: Vision ]      [ Signal 4: OCR ]
    Solidity ERC-721          Isolation Forest          MobileNetV2               EasyOCR + Regex
    Mint & Custody            Spatial-Temporal          1280-dim Cosine           Batch / Expiry Hash
    Chain Verification        Velocity & Entropy        vs IPFS Canonical         vs On-Chain Digest
    (Base Weight: 30%)        (Base Weight: 30%)        (Base Weight: 25%)        (Base Weight: 15%)
             │                         │                         │                         │
             └─────────────────────────┼─────────────────────────┴─────────────────────────┘
                                       │
                         [ Trust Score Aggregator ]
                  Dynamic Re-normalization + Hard Overrides
                                       │
                                       ▼
                   [ Score Dial (0-100) + Auditable Verdict ]
                   [ Web Speech API (Hinglish/English TTS) ]
                   [ Real-Time India Threat Heatmap Alert ]
```

---

## 3. Monorepo Directory Layout

```
trusttag-monorepo/
├── contracts/                        # Smart Contracts (Hardhat / Solidity 0.8.20)
│   ├── contracts/
│   │   └── TrustTagRegistry.sol      # ERC-721 with AccessControl & Emergency Recalls
│   ├── test/
│   │   └── TrustTag.test.ts          # Complete unit test suite (mint, transfer, recall)
│   ├── scripts/
│   │   └── deploy.ts                 # Hardhat deployment script for Polygon Amoy
│   └── hardhat.config.ts
├── backend/                          # High-Performance FastAPI Microservice (Python 3.11)
│   ├── app/
│   │   ├── main.py                   # Async /verify, /scan, /reports, /chat endpoints
│   │   ├── core/
│   │   │   ├── blockchain.py         # Web3.py Polygon RPC client
│   │   │   └── config.py             # Configurable signal weights & thresholds
│   │   ├── services/
│   │   │   ├── anomaly_detector.py   # Isolation Forest inference
│   │   │   ├── vision_matcher.py     # MobileNetV2 embedding extractor
│   │   │   ├── ocr_normalizer.py     # EasyOCR + Indian packaging regex engine
│   │   │   └── xai_explainer.py      # Rule & SHAP-based English & Hinglish reasoning
│   │   └── schemas/                  # Pydantic v2 schemas
│   ├── Dockerfile
│   └── requirements.txt
├── ml_engine/                        # ML Training & Synthetic Generation
│   ├── train_isolation_forest.py    # Synthetic spatial-temporal data generator & training
│   ├── train_vision_embedder.py      # MobileNetV2 transfer learning on sneaker dataset
│   └── artifacts/                    # Serialized models (.joblib, .onnx)
├── docs/                             # Engineering Specs & Viva Documentation
│   ├── 01_TRUSTTAG_ARCHITECTURE.md   # Mathematical models, equations, and threat model
│   ├── 02_SMART_CONTRACTS_SPEC.md    # Solidity contracts & gasless relayer spec
│   ├── 03_FASTAPI_BACKEND_SPEC.md    # FastAPI endpoints, schemas, and async pipeline
│   ├── 04_ML_PIPELINE_SPEC.md        # ML training scripts and EasyOCR regex patterns
│   └── 05_DEMO_AND_VIVA_GUIDE.md     # Academic demo walkthrough & viva defense answers
├── src/                              # Interactive Web & Mobile Verification Platform
│   ├── components/
│   │   ├── ScannerView.tsx           # Customer verification UI (reticle, shutter flash, shimmer)
│   │   ├── ScoreGauge.tsx            # Animated 0-100 score gauge with Framer Motion
│   │   ├── SignalsBreakdown.tsx      # 4-signal breakdown cards with XAI explanations
│   │   ├── AttackSimulator.tsx       # XYZ Shoes cloned QR attack simulator
│   │   ├── AdminHeatmap.tsx          # Real-time India geo-threat map & recall controls
│   │   ├── SupplyChainView.tsx       # Role-based custody progression tracker
│   │   ├── ChatbotModal.tsx          # ChatDKG decentralized knowledge RAG assistant
│   │   └── DocsViewer.tsx            # In-app interactive documentation explorer
│   ├── services/
│   │   ├── verificationEngine.ts     # Client-side 4-signal engine & Web Speech API
│   │   └── geminiChat.ts             # Google Gemini API & local RAG retriever
│   ├── types/                        # TypeScript definitions
│   └── App.tsx                       # Master layout & routing
├── docker-compose.yml                # Multi-container orchestration (FastAPI + Redis + Web)
└── README.md
```

---

## 4. The 4 Signal Mathematical Formulations

### Signal 1: Blockchain Provenance ($S_{\text{chain}} \in [0, 1]$)
- Verifies contract address and token ID minted by authorized `BRAND_ROLE`.
- Validates token status: $0 = \text{Active}$, $1 = \text{Recalled}$, $2 = \text{Expired}$.
- Checks custody progression: Factory $\to$ Distributor $\to$ Retailer.

### Signal 2: QR Clone Anomaly Detection ($S_{\text{anomaly}} \in [0, 1]$)
Trained via an un-supervised **Isolation Forest** on spatial-temporal scan history $H = \{(t_i, \text{lat}_i, \text{lon}_i, \text{dev}_i)\}_{i=1}^n$:
- **Velocity Feature ($v$)**: Haversine distance between consecutive scans divided by $\Delta t$:
  $$v = \frac{2R \arcsin\left(\sqrt{\sin^2(\frac{\Delta \phi}{2}) + \cos \phi_1 \cos \phi_2 \sin^2(\frac{\Delta \lambda}{2})}\right)}{\Delta t}$$
  If $v > 850\text{ km/h}$ (impossible travel speed between retail scans), the anomaly index spikes.
- **City Dispersion ($N_{\text{cities}}$)**: Number of distinct geographic clusters observed within a 2-hour window.
- **Scan Frequency**: Scans per hour compared against normal consumer baseline ($< 3\text{ scans/day}$).

### Signal 3: Computer Vision Embedding Match ($S_{\text{vision}} \in [0, 1]$)
- Extracts feature vector $e_{\text{user}} = f_{\text{MobileNetV2}}(I_{\text{user}}) \in \mathbb{R}^{1280}$ from the user's photo.
- Computes cosine similarity against canonical reference embedding $e_{\text{ref}}$ fetched via IPFS CID:
  $$S_{\text{vision}} = \frac{e_{\text{user}} \cdot e_{\text{ref}}}{\|e_{\text{user}}\| \|e_{\text{ref}}\|}$$

### Signal 4: Packaging OCR Batch Match ($S_{\text{ocr}} \in [0, 1]$)
- Extracts printed packaging text via EasyOCR with Indian regulatory regex patterns (`B.No`, `Mfg`, `Exp`).
- Hashes normalized string and compares with on-chain digest:
  $$S_{\text{ocr}} = \begin{cases} 1.0 & \text{if } \text{SHA256}(\text{Normalized}) == H_{\text{on-chain}} \\ 0.0 & \text{if mismatch} \\ \text{null} & \text{if photo skipped} \end{cases}$$

### Dynamic Renormalization & Hard Overrides
- **Dynamic Renormalization**: $W'_j = \frac{W_j}{\sum_{k \in \text{Available}} W_k}$, ensuring score always totals 100%.
- **Hard Override 1 (Recall)**: Recalled batches are capped at $\le 10$ with an unmissable red hazard alert.
- **Hard Override 2 (Cloned QR)**: Velocity $>1,000\text{ km/h}$ across $\ge 3$ cities caps score at $\le 28$.
- **Hard Override 3 (Unregistered)**: Tokens not found on ledger score 0 ("Likely Fake").

---

## 5. Quickstart & Local Installation

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.11$ (for backend microservices)
- npm or pnpm

### Run the Interactive Platform
```bash
# Clone the repository
git clone https://github.com/your-username/trusttag.git
cd trusttag

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

Visit `http://localhost:3000` to interact with:
1. **Consumer Scanner**: Pulsing reticle, shutter snap feedback, and Framer Motion animated score gauge.
2. **XYZ Shoes Attack Simulator**: Step-by-step visual playback of the multi-city counterfeit clone attack.
3. **Supply Chain Station**: Role-based custody progression (BRAND, DISTRIBUTOR, RETAILER).
4. **Admin Threat Heatmap**: Interactive India map, anomalous scan pings, and emergency recall controller.
5. **ChatDKG RAG**: Decentralized knowledge graph assistant in English & Hinglish.
6. **Specs & Code Explorer**: View and copy all production contract and backend codes.

---

## 6. Comprehensive Threat Model

| Threat Vector | Attack Mechanism | TrustTag Defense |
| :--- | :--- | :--- |
| **QR Code Cloning** | Counterfeiter buys 1 genuine shoe, copies QR sticker onto 500 fake shoes. | **Isolation Forest spatial-temporal telemetry**: As the cloned stickers are scanned in different cities, impossible velocity ($>1,000$ km/h) and multi-city divergence immediately trigger a clone alarm. |
| **Packaging Photo Spoofing** | Attacker uploads genuine stock photo from the web. | **Client camera session attestation** + timestamp validation + live gyroscope challenge. |
| **Replay Attacks** | Intercepting past genuine `/verify` HTTP payload and re-submitting it. | Nonce-signed requests + 60-second timestamp freshness window. |
| **Supply Chain Collusion** | Corrupt distributor injects counterfeit units into genuine shipment. | Supply chain custody checkpoint transfers require `DISTRIBUTOR_ROLE` or `RETAILER_ROLE` wallet signatures. Broken custody drops score. |
| **Insider Minting** | Rogue employee mints unauthorized tokens. | Multi-signature AccessControl contract requirement (`DEFAULT_ADMIN_ROLE` + `BRAND_ROLE` quorum). |

---

## 7. License & Credits
Developed for academic presentation, portfolio evaluation, and open-source supply chain transparency. Distributed under the MIT License.
