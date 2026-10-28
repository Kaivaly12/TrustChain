# TrustTag: Anti-Counterfeit Verification Engine Architecture
## Aadhaar-Style Cryptographic & AI Provenance Verification for Physical Products

---

### 1. Executive Summary & Problem Formulation
In high-risk markets like India (pharmaceuticals, footwear, electronics, luxury fashion, and P2P resale), counterfeit goods cause fatal health outcomes (counterfeit antibiotics and cardiac medications), destroy brand enterprise value, and defraud consumers.

Traditional anti-counterfeit solutions suffer from a fundamental flaw:
- **Physical QR / Hologram alone**: Easily photostat-copied, cloned, or replicated onto fake items.
- **Blockchain alone**: Only proves data immutability on a digital ledger; it cannot verify whether the physical object holding the QR code is authentic or if the QR was copied 1,000 times across 10 cities.

**TrustTag** bridges this cyber-physical verification gap by fusing **4 real-time independent signals** into a unified, explainable **Trust Score (0–100)**:
1. **Blockchain Provenance (ERC-721)**: Verifies mint authorization, distributor custody transfer, batch status (Active/Recalled), and on-chain batch/expiry hashes.
2. **QR Clone Anomaly Detection (Isolation Forest)**: Analyzes spatial-temporal scan telemetry (scans/hour, distinct cities, impossible travel velocity km/h, time-of-day entropy).
3. **Computer Vision Embedding Match (MobileNetV2)**: Generates 1,280-dim feature vector from the customer's photo and computes cosine similarity against canonical reference images stored on IPFS.
4. **Batch & Expiry OCR Normalization (EasyOCR + Regex)**: Extracts printed "B.No", "Mfg", and "Exp" on packaging, normalizes Indian date formats, hashes the values, and matches them against the immutable on-chain hash.

```
       [ Consumer Mobile App / Kiosk / Web3 Scanner ]
                            │
               POST /verify (Parallel Pipeline)
                            │
       ┌────────────────────┼────────────────────┬────────────────────┐
       ▼                    ▼                    ▼                    ▼
[ Signal 1: Web3.py ] [ Signal 2: ML ]  [ Signal 3: Vision ] [ Signal 4: OCR ]
 ERC-721 Contract     Isolation Forest    MobileNetV2 Emb      EasyOCR + Regex
 Token Validity &     Velocity & Geo      Cosine Similarity    SHA-256 Hash
 Custody History      Clone Anomaly       vs IPFS Canon        Match on Pack
       │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┘
                                    │
                       [ Trust Score Aggregator ]
                     Dynamic Weight Renormalization
                       + Hard Override Policies
                                    │
                                    ▼
       [ Explainable AI Verdict (English & Hinglish) ]
       [ Voice Synthesizer (TTS) + Geo Heatmap Alert ]
```

---

### 2. The 4 Signal Mathematical Formulations

#### Signal 1: Blockchain Provenance ($S_{\text{chain}} \in [0, 1]$)
- Verifies contract address and token ID minted by authorized `BRAND_ROLE`.
- Validates token status: $0 = \text{Active}$, $1 = \text{Recalled}$, $2 = \text{Expired}$.
- Checks full custody handover: Factory $\to$ Authorized Distributor $\to$ Verified Retailer.
- Metric formula:
  $$S_{\text{chain}} = \begin{cases} 
  1.0 & \text{Valid token, authorized mint, active status, unbroken custody chain} \\
  0.7 & \text{Valid token, but distributor transfer was skipped} \\
  0.0 & \text{Token recalled, expired, or non-existent on contract}
  \end{cases}$$

#### Signal 2: QR Clone Anomaly Detection ($S_{\text{anomaly}} \in [0, 1]$)
Trained via an un-supervised **Isolation Forest** with temporal scan history $H = \{(t_i, \text{lat}_i, \text{lon}_i, \text{dev}_i)\}_{i=1}^n$:
- **Velocity Feature ($v_{i, i-1}$)**: Haversine distance between consecutive scans divided by $\Delta t$:
  $$v = \frac{2R \arcsin\left(\sqrt{\sin^2(\frac{\Delta \phi}{2}) + \cos \phi_1 \cos \phi_2 \sin^2(\frac{\Delta \lambda}{2})}\right)}{\Delta t}$$
  If $v > 850\text{ km/h}$ (impossible commercial travel speed between scans), anomaly weight spikes.
- **Spatial Diversity ($N_{\text{cities}}$)**: Number of unique geographic clusters observed within a 2-hour window.
- **Scan Frequency ($f_{\text{scan}}$)**: Scans per hour compared against normal consumer baseline ($< 3\text{ scans/day}$).
- Output Anomaly Score: $A \in [0, 1]$ (where 1 is normal, 0 is extreme outlier).
  $$S_{\text{anomaly}} = \max(0, 1 - \text{AnomalyIndex})$$

#### Signal 3: Computer Vision Embedding Match ($S_{\text{vision}} \in [0, 1]$)
- The model extracts feature embeddings $e_{\text{user}} = f_{\text{MobileNetV2}}(I_{\text{user}}) \in \mathbb{R}^{1280}$ from the user's camera photo.
- Compares with genuine canonical reference embedding $e_{\text{ref}}$ fetched via IPFS CID:
  $$S_{\text{vision}} = \frac{e_{\text{user}} \cdot e_{\text{ref}}}{\|e_{\text{user}}\| \|e_{\text{ref}}\|}$$
- If similarity $< 0.50$, flags high probability of wrong product or counterfeit packaging.

#### Signal 4: OCR Batch & Expiry Validation ($S_{\text{ocr}} \in [0, 1]$)
- Optical character recognition extracts raw packaging strings (e.g. `B.No: B402`, `EXP: 10/2027`).
- Regex canonicalizes to standard schema:
  $$\text{Normalized} = \text{LOWER}(\text{CLEAN}(\text{Batch})) + \text{"|"|"} + \text{YYYY-MM}(\text{Expiry})$$
- Computes cryptographic digest:
  $$H_{\text{computed}} = \text{SHA256}(\text{Normalized})$$
- Match evaluation:
  $$S_{\text{ocr}} = \begin{cases} 1.0 & \text{if } H_{\text{computed}} == H_{\text{on-chain}} \\ 0.0 & \text{if mismatch} \\ \text{null} & \text{if photo not provided / text unreadable} \end{cases}$$

---

### 3. Trust Score Aggregation & Hard Override Policies

#### Default Base Weights:
- $W_{\text{chain}} = 0.30$ (Blockchain status)
- $W_{\text{anomaly}} = 0.30$ (QR clone anomaly)
- $W_{\text{vision}} = 0.25$ (Image similarity)
- $W_{\text{ocr}} = 0.15$ (OCR batch match)
- Total base weight: $\sum W_i = 1.00$.

#### Dynamic Renormalization:
If an optional signal is missing (e.g. consumer scanned QR in poor lighting without taking pack text photo, so OCR is null):
$$W'_j = \frac{W_j}{\sum_{k \in \text{Available}} W_k}$$
$$\text{Trust Score} = 100 \times \sum_{j \in \text{Available}} W'_j \cdot S_j$$

#### Hard Overrides (Non-Negotiable Safety Rules):
1. **Token Recalled**: If status is `RECALLED` $\implies$ Score is hard-capped at **10**, Verdict: `DO NOT USE (RECALLED BATCH)`.
2. **Token Not Found**: If token does not exist on contract $\implies$ Score is hard-capped at **0**, Verdict: `LIKELY COUNTERFEIT`.
3. **Cloned QR Trigger**: If $v > 1,000\text{ km/h}$ across $\ge 3$ cities within 2 hours $\implies$ Score is hard-capped at **30**, Verdict: `COUNTERFEIT / CLONED QR DETECTED`.

#### Verdict Classification Bands:
- **80 – 100**: `GENUINE` (Product authentic, supply chain unbroken, verified on ledger)
- **50 – 79**: `SUSPICIOUS` (Anomalous scans or minor visual discrepancy; inspect seal)
- **0 – 49**: `LIKELY FAKE` (Counterfeit detected; alert sent to brand dashboard)

---

### 4. Complete Threat Model

| Threat Vector | Attack Mechanism | TrustTag Countermeasure |
| :--- | :--- | :--- |
| **QR Code Cloning** | Fraudster buys 1 genuine pair of shoes, scans QR, prints 5,000 replica stickers on counterfeit shoes. | **Isolation Forest spatial-temporal telemetry**: As the cloned stickers are scanned across different PIN codes in quick succession, impossible velocity ($>850$ km/h) and high city dispersion immediately flag the token. |
| **Packaging Photo Spoofing** | Attacker uploads a downloaded genuine stock photo instead of taking live photo. | **EXIF metadata analysis + client camera session attestation** + timestamp validation. In production, mobile camera captures live gyroscope/depth feed. |
| **Replay Attacks** | Intercepting past genuine `/verify` HTTP payload and re-submitting it. | Nonce-signed requests + client timestamp verification within a 60-second window. |
| **Supply Chain Collusion** | Corrupt distributor injects counterfeit units into genuine shipment. | Supply chain custody checkpoint transfers require `DISTRIBUTOR_ROLE` or `RETAILER_ROLE` wallet signatures. Broken custody drops blockchain score from 1.0 to 0.7 or raises red flag. |
| **Insider Minting** | Rogue employee mints unauthorized tokens. | Multi-signature AccessControl contract requirement (`DEFAULT_ADMIN_ROLE` + `BRAND_ROLE` quorum). |

---

### 5. Privacy & Regulatory Compliance (India DPDP Act)
1. **Zero Personal Identifiable Information (PII) On-Chain**: No consumer names, mobile numbers, or exact addresses are ever committed to Ethereum/Polygon.
2. **Coarse Geolocation**: GPS coordinates are truncated to 2 decimal places ($\approx 1.1\text{ km}$ precision) before storage, preventing exact address tracking.
3. **Cryptographic Hashes**: Batch numbers and manufacturing details are stored solely as SHA-256 hashes on the public smart contract. Reference high-res packaging blueprints reside on IPFS.
