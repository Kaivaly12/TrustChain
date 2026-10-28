# TrustTag Academic Demo & Viva Presentation Guide
## End-to-End Walkthrough of the Acceptance Scenario & Technical Defense

---

### 1. Acceptance Scenario Walkthrough: XYZ Shoes Attack Simulation

#### Act 1: Legitimate Minting & Supply Chain Journey
1. **Manufacturer Mint**:
   - Brand (XYZ Footwear Pvt Ltd, Agra) mints ERC-721 Token `#1042` with batch `B-SNEAK-2026` on Polygon Amoy.
   - Reference photo and MobileNetV2 embedding are pinned to IPFS CID `QmXYZSneakerCanonicalEmbeddings2026`.
   - On-chain hashes recorded: `batchHash = 0x5e884898...`, `status = ACTIVE`.
2. **Authorized Supply Chain Custody**:
   - Checkpoint 1 (Factory Outbound, Agra): Custody transferred to Delhi Logistics.
   - Checkpoint 2 (Distributor Hub, Okhla): Scanned and signed by `DISTRIBUTOR_ROLE`.
   - Checkpoint 3 (Retail Store, Connaught Place, New Delhi): Received by `RETAILER_ROLE`.
3. **Legitimate Customer Verification**:
   - Consumer scans QR code in New Delhi at 11:30 AM.
   - Verification Engine runs 4 signals in parallel:
     - Blockchain: Valid token, intact custody $\to 1.0$ (30/30)
     - Isolation Forest: 1 scan, 0 km/h velocity $\to 0.94$ (28/30)
     - MobileNetV2: User photo has 93% cosine match with IPFS sample $\to 0.93$ (23/25)
     - OCR: Batch "B-SNEAK-2026" on shoebox matches on-chain hash $\to 1.0$ (15/15)
   - **Result**: Trust Score = **96 / 100**, Verdict: **GENUINE**. Green verification seal issued.

#### Act 2: The Counterfeit Cloned-QR Attack
1. **The Attack**:
   - A counterfeiter photographs the QR code on Token `#1042` and prints 500 duplicate stickers.
   - The fake stickers are placed on low-grade replica shoes sold in gray markets across India.
2. **The Cloned Scans**:
   - 12:15 PM: Scanned by buyer in Mumbai (Bandra).
   - 12:45 PM: Scanned by buyer in Bengaluru (Indiranagar).
   - 01:10 PM: Scanned by buyer in Kolkata (Park Street).
3. **The Detection Trigger**:
   - Inter-scan distance: Mumbai to Bengaluru is 840 km in 30 minutes $\to \mathbf{1,680\text{ km/h}}$!
   - Bengaluru to Kolkata is 1,560 km in 25 minutes $\to \mathbf{3,744\text{ km/h}}$!
   - **Isolation Forest Alarm**: Anomaly score collapses from 0.94 to **0.08**.
   - **Hard Override**: Triggered by $v > 1000$ km/h and $\ge 3$ cities.
   - **Result**: Trust Score plummets to **28 / 100**, Verdict: **LIKELY FAKE / CLONED QR DETECTED**.
   - Consumer UI displays red warning banner with Hinglish audio explanation:
     > *"Clone alert: Ye QR code pichhle 2 ghante mein 3 shehron mein 1,850 km/h ki namumkin speed par scan hua hai!"*
   - Brand admin dashboard instantly plots a crimson flashing cluster on the India Geo-Heatmap.

---

### 2. Viva Defense & Technical Questions

#### Q1: "Why use blockchain if AI is doing the heavy lifting?"
**Answer**:
Blockchain provides **tamper-proof provenance and decentralized trust**:
1. No single entity or corrupted employee can secretly alter a manufacturing date or wipe an official safety recall record.
2. It establishes a cryptographically verifiable supply chain custody chain (Factory $\to$ Distributor $\to$ Retailer) using public-key cryptography.
3. However, blockchain has the **"Oracle / Garbage-In Garbage-Out" problem**: it cannot see the physical shoe. That is why AI (computer vision + OCR + spatial-temporal anomaly detection) is essential to verify physical identity and cloned tags.

#### Q2: "How does the Isolation Forest prevent false positives if a traveler flies on an airplane?"
**Answer**:
1. Commercial flights in India cruise at $700$–$850\text{ km/h}$ and require boarding/deplaning time ($\ge 3$ hours between city scans).
2. The model checks the travel velocity threshold against flight timetables: a scan in Mumbai at 12:00 and Bengaluru at 12:15 represents $3,360\text{ km/h}$, which is supersonic and physically impossible.
3. Furthermore, the model combines velocity with **unique device IDs**: an authentic flying traveler uses the *same* phone device hash; cloned QRs originate from *multiple distinct unlinked devices* concurrently.

#### Q3: "How does gasless scanning work without crypto wallets?"
**Answer**:
We use the **EIP-2771 / Relayer pattern**:
- The consumer scans the QR in standard mobile web.
- The app sends a lightweight telemetry packet to our backend relayer.
- The relayer validates rate-limits and signs an on-chain transaction calling `recordScan()` using the platform's gas wallet.
- The end-consumer never sees gas fees, seed phrases, or wallet prompts.

#### Q4: "What happens if the customer has poor internet or no camera?"
**Answer**:
The scoring engine features **dynamic weight renormalization**:
- If pack photo or product photo is missing, the engine renormalizes weights across available signals (e.g. Blockchain 50%, QR Anomaly 50%).
- If offline, the mobile PWA caches the scan and syncs when reconnected.
