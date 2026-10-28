# TrustTag FastAPI Backend Specification
## High-Performance Async Python 3.11 Microservice Architecture

---

### 1. Architecture & Endpoints Overview

The backend acts as an orchestrator executing 4 signals in parallel via `asyncio.gather()`:

```python
# Core Parallel Pipeline Concept
async def run_parallel_verification(payload: VerifyRequest):
    res_chain, res_anomaly, res_vision, res_ocr = await asyncio.gather(
        verify_blockchain_status(payload.token_id),
        detect_qr_clone_anomaly(payload.token_id, payload.scan_telemetry),
        compute_vision_similarity(payload.product_photo, payload.token_id),
        validate_ocr_pack_hash(payload.pack_photo, payload.token_id),
        return_exceptions=True
    )
    return aggregate_trust_score(res_chain, res_anomaly, res_vision, res_ocr)
```

---

### 2. Complete Python Implementation (`app/main.py`)

```python
"""
TrustTag FastAPI Backend Service
Handles 4-signal verification, supply chain scans, counterfeit reports, and ChatDKG RAG.
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import asyncio
import hashlib
import re
import math
import time

app = FastAPI(
    title="TrustTag Verification API",
    version="1.0.0",
    description="Multi-Signal Anti-Counterfeit Verification Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------

class CoarseLocation(BaseModel):
    city: str
    state: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class ScanTelemetry(BaseModel):
    device_id_hash: str
    timestamp: int
    location: CoarseLocation

class VerifyRequest(BaseModel):
    token_id: int
    gtin: Optional[str] = "08901234567890"
    qr_raw_payload: str
    scan_telemetry: ScanTelemetry
    product_photo_base64: Optional[str] = None
    pack_photo_base64: Optional[str] = None

class SignalDetail(BaseModel):
    name: str
    score: float
    confidence: float
    status: str
    metric_label: str
    detail: str

class ExplanationReason(BaseModel):
    signal: str
    severity: str  # "info" | "warning" | "critical"
    english: str
    hinglish: str

class VerifyResponse(BaseModel):
    token_id: int
    trust_score: int  # 0 to 100
    verdict: str      # "GENUINE" | "SUSPICIOUS" | "LIKELY_FAKE"
    is_recalled: bool
    is_cloned_qr: bool
    signals: Dict[str, SignalDetail]
    reasons: List[ExplanationReason]
    custody_chain: List[Dict[str, Any]]
    resale_owner: Optional[str] = None

class SupplyChainScanRequest(BaseModel):
    token_id: int
    actor_role: str   # "BRAND" | "DISTRIBUTOR" | "RETAILER"
    location_name: str
    stage_name: str
    auth_token: str

class CounterfeitReportRequest(BaseModel):
    token_id: Optional[int] = None
    product_name: str
    retailer_name: str
    city: str
    state: str
    notes: str
    evidence_photo_base64: Optional[str] = None

class ChatRequest(BaseModel):
    token_id: Optional[int] = None
    query: str
    language_preference: str = "hinglish"

# ----------------- MOCK / INTEGRATION ENGINES -----------------

class BlockchainService:
    """Interacts with Polygon/VeChain smart contract via Web3.py"""
    
    @staticmethod
    async def get_token_state(token_id: int) -> Dict[str, Any]:
        await asyncio.sleep(0.04)  # async web3 call simulation
        if token_id == 9999:  # simulate non-existent token
            return {"exists": False, "status": "UNKNOWN"}
        if token_id == 404:   # simulate recalled drug batch
            return {
                "exists": True,
                "status": "RECALLED",
                "recall_reason": "Active Pharmaceutical Ingredient degradation",
                "batch_hash": "0x5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                "expiry_hash": "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                "custody": [
                    {"stage": "Manufacturing Plant (Baddi)", "entity": "Cipla Ltd", "timestamp": "2026-04-10"},
                    {"stage": "Zonal Depot", "entity": "North Pharma Logistics", "timestamp": "2026-04-14"}
                ]
            }
        return {
            "exists": True,
            "status": "ACTIVE",
            "gtin": "08901234567890",
            "batch_hash": "0x5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            "expiry_hash": "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            "ipfs_cid": "QmXYZSneakerCanonicalEmbeddings2026",
            "custody": [
                {"stage": "Factory Dispatch", "entity": "XYZ Manufacturing Hub, Agra", "timestamp": "2026-09-12"},
                {"stage": "Distributor Hub", "entity": "Delhi Metro Distribution Hub", "timestamp": "2026-09-18"},
                {"stage": "Retail Store", "entity": "SneakerHead Connaught Place, New Delhi", "timestamp": "2026-10-02"}
            ]
        }

class AnomalyEngine:
    """Isolation Forest Scikit-Learn wrapper for scan telemetry"""
    
    @staticmethod
    async def evaluate_scan_history(token_id: int, current_scan: ScanTelemetry) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        # Check simulated clone attack
        if token_id == 1042_99 or current_scan.device_id_hash == "ATTACKER_DEVICE_CLONE":
            return {
                "anomaly_score": 0.08,  # High anomaly (0 = abnormal, 1 = normal)
                "scans_last_2h": 14,
                "distinct_cities": 4,
                "max_velocity_kmh": 1850.4,
                "is_impossible_travel": True,
                "feature_contributions": {
                    "velocity_kmh": 1850.4,
                    "city_dispersion": 4,
                    "frequency_zscore": 4.8
                }
            }
        return {
            "anomaly_score": 0.94,
            "scans_last_2h": 1,
            "distinct_cities": 1,
            "max_velocity_kmh": 0.0,
            "is_impossible_travel": False,
            "feature_contributions": {
                "velocity_kmh": 0.0,
                "city_dispersion": 1,
                "frequency_zscore": 0.1
            }
        }

class VisionEmbeddingService:
    """MobileNetV2 feature embedding extractor and cosine comparator"""
    
    @staticmethod
    async def compute_similarity(token_id: int, image_base64: Optional[str]) -> Dict[str, Any]:
        await asyncio.sleep(0.08)
        if not image_base64:
            return {"provided": False, "similarity": None}
        # In actual service: run tf.keras or onnxruntime MobileNetV2 embedding extraction
        if "fake" in image_base64.lower():
            return {
                "provided": True,
                "similarity": 0.41,
                "reference_ipfs": "QmXYZSneakerCanonicalEmbeddings2026",
                "embedding_dimension": 1280
            }
        return {
            "provided": True,
            "similarity": 0.93,
            "reference_ipfs": "QmXYZSneakerCanonicalEmbeddings2026",
            "embedding_dimension": 1280
        }

class OcrBatchService:
    """EasyOCR + Regex normalization and SHA-256 hash matching"""
    
    @staticmethod
    async def verify_pack_text(token_id: int, pack_photo: Optional[str], on_chain_batch_hash: str) -> Dict[str, Any]:
        await asyncio.sleep(0.06)
        if not pack_photo:
            return {"provided": False, "match": None}
        
        # Regex normalizer logic
        extracted_batch = "B402"
        extracted_exp = "10/2028"
        normalized_str = f"{extracted_batch.lower().strip()}|{extracted_exp.strip()}"
        computed_hash = hashlib.sha256(normalized_str.encode()).hexdigest()
        
        is_match = (computed_hash == on_chain_batch_hash.replace("0x", ""))
        return {
            "provided": True,
            "extracted_batch": extracted_batch,
            "extracted_expiry": extracted_exp,
            "computed_hash": computed_hash,
            "match": is_match
        }

# ----------------- PARALLEL VERIFICATION ENDPOINT -----------------

@app.post("/verify", response_model=VerifyResponse)
async def verify_product(payload: VerifyRequest):
    # 1. Fetch on-chain data
    chain_data = await BlockchainService.get_token_state(payload.token_id)
    if not chain_data.get("exists"):
        return VerifyResponse(
            token_id=payload.token_id,
            trust_score=0,
            verdict="LIKELY_FAKE",
            is_recalled=False,
            is_cloned_qr=False,
            signals={},
            reasons=[
                ExplanationReason(
                    signal="Blockchain",
                    severity="critical",
                    english="Token ID was not found on the registered manufacturer smart contract.",
                    hinglish="Ye Token ID registered manufacturer ke smart contract par exist nahi karta hai."
                )
            ],
            custody_chain=[]
        )
    
    # Check immediate recall hard override
    if chain_data.get("status") == "RECALLED":
        return VerifyResponse(
            token_id=payload.token_id,
            trust_score=8,
            verdict="LIKELY_FAKE",
            is_recalled=True,
            is_cloned_qr=False,
            signals={},
            reasons=[
                ExplanationReason(
                    signal="Recall Emergency",
                    severity="critical",
                    english=f"SAFETY ALERT: This batch has been officially recalled. Reason: {chain_data.get('recall_reason')}",
                    hinglish=f"KHATRA: Is batch ko company ne recall kar liya hai. Reason: {chain_data.get('recall_reason')}. Ise istemaal na karein!"
                )
            ],
            custody_chain=chain_data.get("custody", [])
        )

    # 2. Parallel signal execution
    anomaly_task = AnomalyEngine.evaluate_scan_history(payload.token_id, payload.scan_telemetry)
    vision_task = VisionEmbeddingService.compute_similarity(payload.token_id, payload.product_photo_base64)
    ocr_task = OcrBatchService.verify_pack_text(payload.token_id, payload.pack_photo_base64, chain_data.get("batch_hash", ""))

    anomaly_res, vision_res, ocr_res = await asyncio.gather(anomaly_task, vision_task, ocr_task)

    # 3. Dynamic Weight Re-normalization
    weights = {"chain": 0.30, "anomaly": 0.30, "vision": 0.25, "ocr": 0.15}
    active_weights = {}
    active_scores = {}
    reasons = []

    # Blockchain signal
    active_weights["chain"] = weights["chain"]
    active_scores["chain"] = 1.0
    reasons.append(ExplanationReason(
        signal="Blockchain Provenance",
        severity="info",
        english="Minted by verified brand authority with complete custody handover.",
        hinglish="Verified brand ne mint kiya hai aur factory se retailer tak ka chain verified hai."
    ))

    # Anomaly signal
    active_weights["anomaly"] = weights["anomaly"]
    anomaly_val = float(anomaly_res["anomaly_score"])
    active_scores["anomaly"] = anomaly_val
    is_cloned = bool(anomaly_res.get("is_impossible_travel", False))
    
    if is_cloned:
        reasons.append(ExplanationReason(
            signal="QR Clone Detection",
            severity="critical",
            english=f"Anomaly: This QR was scanned across {anomaly_res['distinct_cities']} cities within 2 hours at an impossible speed of {anomaly_res['max_velocity_kmh']} km/h.",
            hinglish=f"Clone alert: Ye QR code pichhle 2 ghante mein {anomaly_res['distinct_cities']} shehron mein {anomaly_res['max_velocity_kmh']} km/h ki namumkin speed par scan hua hai!"
        ))
    else:
        reasons.append(ExplanationReason(
            signal="QR Clone Detection",
            severity="info",
            english="Scan velocity and spatial frequency conform to normal human consumer behavior.",
            hinglish="Scan ki speed aur location bilkul normal consumer pattern se match karti hai."
        ))

    # Vision signal
    if vision_res.get("provided"):
        active_weights["vision"] = weights["vision"]
        sim = float(vision_res["similarity"])
        active_scores["vision"] = sim
        if sim < 0.60:
            reasons.append(ExplanationReason(
                signal="Visual Embedding",
                severity="warning",
                english=f"Photo is only {int(sim*100)}% similar to genuine factory reference blueprints.",
                hinglish=f"Photo original sample se sirf {int(sim*100)}% match ho rahi hai. Stitching ya texture doubtful hai."
            ))
        else:
            reasons.append(ExplanationReason(
                signal="Visual Embedding",
                severity="info",
                english=f"Visual features match genuine reference sample ({int(sim*100)}% similarity).",
                hinglish=f"Design aur visual finish original sample se {int(sim*100)}% match karti hai."
            ))

    # OCR signal
    if ocr_res.get("provided"):
        active_weights["ocr"] = weights["ocr"]
        if ocr_res.get("match"):
            active_scores["ocr"] = 1.0
            reasons.append(ExplanationReason(
                signal="Packaging OCR",
                severity="info",
                english=f"Batch {ocr_res.get('extracted_batch')} and Expiry {ocr_res.get('extracted_expiry')} match the cryptographic on-chain hash.",
                hinglish=f"Pack par likha Batch {ocr_res.get('extracted_batch')} on-chain hash se 100% match karta hai."
            ))
        else:
            active_scores["ocr"] = 0.0
            reasons.append(ExplanationReason(
                signal="Packaging OCR",
                severity="critical",
                english="Batch number or expiry printed on pack does not match registered manufacturer records.",
                hinglish="Pack par chhap gaya batch number company ke official records se match nahi hota."
            ))

    # Calculate weighted sum
    total_w = sum(active_weights.values())
    raw_trust = sum((active_scores[k] * (active_weights[k] / total_w)) for k in active_weights)
    trust_score = int(round(raw_trust * 100))

    # Hard overrides
    if is_cloned:
        trust_score = min(trust_score, 28)

    # Determine verdict
    if trust_score >= 80:
        verdict = "GENUINE"
    elif trust_score >= 50:
        verdict = "SUSPICIOUS"
    else:
        verdict = "LIKELY_FAKE"

    signals_dict = {
        "blockchain": SignalDetail(
            name="Blockchain Status",
            score=active_scores.get("chain", 1.0),
            confidence=1.0,
            status="VERIFIED",
            metric_label="Token Active",
            detail="ERC-721 Token #1042 on Polygon Amoy"
        ),
        "qr_anomaly": SignalDetail(
            name="QR Clone Detector",
            score=active_scores.get("anomaly", 1.0),
            confidence=0.95,
            status="ALERT" if is_cloned else "NOMINAL",
            metric_label=f"{anomaly_res.get('distinct_cities')} cities / {anomaly_res.get('max_velocity_kmh')} km/h",
            detail="Isolation Forest Scan Entropy"
        )
    }

    if vision_res.get("provided"):
        signals_dict["image_similarity"] = SignalDetail(
            name="MobileNetV2 Vision",
            score=vision_res.get("similarity", 0.0),
            confidence=0.91,
            status="PASS" if vision_res.get("similarity", 0) > 0.70 else "FLAGGED",
            metric_label=f"{int(vision_res.get('similarity', 0)*100)}% Cosine Match",
            detail="IPFS CID QmXYZSneakerCanonicalEmbeddings2026"
        )

    if ocr_res.get("provided"):
        signals_dict["ocr_batch"] = SignalDetail(
            name="EasyOCR Batch Integrity",
            score=active_scores.get("ocr", 0.0),
            confidence=0.98,
            status="PASS" if ocr_res.get("match") else "MISMATCH",
            metric_label=f"Batch {ocr_res.get('extracted_batch')}",
            detail="SHA-256 On-chain Digest Match"
        )

    return VerifyResponse(
        token_id=payload.token_id,
        trust_score=trust_score,
        verdict=verdict,
        is_recalled=False,
        is_cloned_qr=is_cloned,
        signals=signals_dict,
        reasons=reasons,
        custody_chain=chain_data.get("custody", []),
        resale_owner="0x3B...A89f"
    )
```
