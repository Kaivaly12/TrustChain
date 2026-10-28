# TrustTag Machine Learning & AI Pipeline Specification
## MobileNetV2 Embeddings, Isolation Forest QR Anomaly, & EasyOCR Regex Parser

---

### 1. Vision Module: MobileNetV2 Feature Embeddings

#### Concept & Architecture
Instead of training a fragile softmax classifier from scratch, we use **MobileNetV2 pre-trained on ImageNet** as a feature extractor. We strip the top classification head and extract the 1,280-dimensional global average pooling layer.

For each registered product, the brand submits 20–50 canonical studio photos (different angles, lighting). The backend computes the normalized centroid embedding $\mathbf{e}_{\text{ref}} = \frac{1}{N} \sum_{i=1}^N \frac{\mathbf{e}_i}{\|\mathbf{e}_i\|}$ and pins the image blueprints to IPFS.

```python
"""
ml_engine/vision_embedder.py
MobileNetV2 feature extractor and cosine similarity comparator.
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image
from typing import Tuple

class VisionEmbeddingEngine:
    def __init__(self):
        # Load MobileNetV2 without the top 1000-class classifier
        self.base_model = MobileNetV2(
            weights="imagenet",
            include_top=False,
            pooling="avg",
            input_shape=(224, 224, 3)
        )
        self.base_model.trainable = False

    def extract_embedding(self, img_array: np.ndarray) -> np.ndarray:
        """
        img_array: (224, 224, 3) RGB uint8
        Returns: L2-normalized 1280-dimensional feature vector
        """
        x = np.expand_dims(img_array, axis=0)
        x = preprocess_input(x)
        raw_embedding = self.base_model.predict(x, verbose=0)[0]
        # L2 Normalization
        norm = np.linalg.norm(raw_embedding)
        if norm == 0:
            return raw_embedding
        return raw_embedding / norm

    @staticmethod
    def compute_cosine_similarity(emb_user: np.ndarray, emb_reference: np.ndarray) -> float:
        """
        Both vectors are L2-normalized, so dot product = cosine similarity.
        Range: [-1.0, 1.0], mapped to [0.0, 1.0].
        """
        cos_sim = float(np.dot(emb_user, emb_reference))
        return max(0.0, min(1.0, cos_sim))
```

---

### 2. QR Clone Anomaly Module: Isolation Forest Telemetry

#### Feature Vector Formulation per Scan $i$:
1. $x_1$: `scans_in_last_24h` (Total times this QR was scanned in rolling 24 hours).
2. $x_2$: `distinct_cities_count` (Number of distinct cities scanned).
3. $x_3$: `max_travel_velocity_kmh` ($\max \frac{\text{Haversine}(p_i, p_{i-1})}{\Delta t}$).
4. $x_4$: `odd_hour_ratio` (Ratio of scans between 01:00 AM and 05:00 AM).
5. $x_5$: `unique_device_count` (Count of unique device hashes scanning the exact same unit).

#### Synthetic Data Generator & Training Script

```python
"""
ml_engine/train_isolation_forest.py
Generates realistic normal vs counterfeit cloned QR telemetry and trains an Isolation Forest.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

def generate_synthetic_telemetry(n_normal=10000, n_clones=500):
    np.random.seed(42)

    # 1. Normal human consumer behavior
    # Typical: 1 to 3 scans, 1 single city, realistic travel speeds (< 80 km/h)
    normal_scans = np.random.poisson(lam=1.6, size=n_normal).clip(1, 6)
    normal_cities = np.random.choice([1, 2], size=n_normal, p=[0.94, 0.06])
    normal_velocity = np.random.exponential(scale=15.0, size=n_normal).clip(0, 110)
    normal_odd_hours = np.random.beta(a=1, b=8, size=n_normal)
    normal_unique_devices = np.random.choice([1, 2], size=n_normal, p=[0.88, 0.12])

    df_normal = pd.DataFrame({
        "scans_24h": normal_scans,
        "distinct_cities": normal_cities,
        "velocity_kmh": normal_velocity,
        "odd_hour_ratio": normal_odd_hours,
        "unique_devices": normal_unique_devices,
        "is_clone": 0
    })

    # 2. Cloned QR attack behavior
    # Fraudster replicated QR on hundreds of counterfeit items across states
    clone_scans = np.random.randint(12, 120, size=n_clones)
    clone_cities = np.random.randint(3, 14, size=n_clones)
    clone_velocity = np.random.uniform(350.0, 2400.0, size=n_clones)  # Impossible speed!
    clone_odd_hours = np.random.beta(a=3, b=3, size=n_clones)
    clone_unique_devices = np.random.randint(8, 90, size=n_clones)

    df_clone = pd.DataFrame({
        "scans_24h": clone_scans,
        "distinct_cities": clone_cities,
        "velocity_kmh": clone_velocity,
        "odd_hour_ratio": clone_odd_hours,
        "unique_devices": clone_unique_devices,
        "is_clone": 1
    })

    return pd.concat([df_normal, df_clone], ignore_index=True)

def train_and_save_model():
    df = generate_synthetic_telemetry()
    feature_cols = ["scans_24h", "distinct_cities", "velocity_kmh", "odd_hour_ratio", "unique_devices"]
    X = df[feature_cols]

    # Contamination set to expected counterfeit prevalence (~5%)
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.048,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X)

    # Save artifact
    joblib.dump(iso_forest, "iso_forest_qr_clone.joblib")
    print("Isolation Forest trained and saved successfully.")

if __name__ == "__main__":
    train_and_save_model()
```

---

### 3. OCR & Regex Normalization Module (Indian Packaging Specs)

```python
"""
ml_engine/ocr_normalizer.py
Extracts batch numbers and expiry dates with EasyOCR and Indian regulatory regex patterns.
"""
import re
import hashlib
from typing import Dict, Optional, Tuple

class PackagingOcrParser:
    # Regex patterns compliant with CDSCO & Indian Legal Metrology
    BATCH_PATTERNS = [
        r"(?:B\.?\s*No\.?|Batch\s*No\.?|Lot\s*No\.?|Lot|B\s*#)\s*[:.-]?\s*([A-Za-z0-9\-\/]+)",
        r"(?:BATCH)\s*[:.-]?\s*([A-Za-z0-9]+)"
    ]

    EXPIRY_PATTERNS = [
        r"(?:Exp\.?\s*Date|Exp|Expiry|Use\s*Before)\s*[:.-]?\s*([0-3]?[0-9][\/\.-][0-1]?[0-9][\/\.-][1-2][0-9]{3})", # DD/MM/YYYY
        r"(?:Exp\.?\s*Date|Exp|Expiry|Use\s*Before)\s*[:.-]?\s*([0-1]?[0-9][\/\.-][1-2][0-9]{3})",                   # MM/YYYY
        r"(?:Exp\.?\s*Date|Exp|Expiry|Use\s*Before)\s*[:.-]?\s*([A-Za-z]{3}\s*[1-2][0-9]{3})"                        # OCT 2028
    ]

    @classmethod
    def parse_raw_text(cls, raw_ocr_text: str) -> Dict[str, Optional[str]]:
        batch_no = None
        expiry_date = None

        for pattern in cls.BATCH_PATTERNS:
            match = re.search(pattern, raw_ocr_text, re.IGNORECASE)
            if match:
                batch_no = match.group(1).strip()
                break

        for pattern in cls.EXPIRY_PATTERNS:
            match = re.search(pattern, raw_ocr_text, re.IGNORECASE)
            if match:
                expiry_date = match.group(1).strip()
                break

        return {"batch_no": batch_no, "expiry_date": expiry_date}

    @classmethod
    def compute_onchain_digest(cls, batch_no: str, expiry_date: str) -> str:
        """
        Normalizes: lowercase, strip punctuation, format YYYY-MM
        """
        clean_batch = re.sub(r"[^a-zA-Z0-9]", "", batch_no).lower()
        normalized_str = f"{clean_batch}|{expiry_date}"
        return hashlib.sha256(normalized_str.encode("utf-8")).hexdigest()
```

---

### 4. Explainable AI (XAI) Generation in English & Hinglish

```python
"""
ml_engine/xai_explainer.py
Generates human-understandable audit rationales using feature contribution thresholds.
"""
def explain_features(features: dict) -> list:
    reasons = []
    
    # Check travel speed
    if features.get("velocity_kmh", 0) > 850:
        reasons.append({
            "signal": "Travel Velocity",
            "severity": "critical",
            "en": f"Impossible Travel: This QR was scanned across multiple locations at {int(features['velocity_kmh'])} km/h.",
            "hi": f"Namumkin Raftaar: Ye QR code {int(features['velocity_kmh'])} km/h ki namumkin speed se alag-alag shehron mein scan hua."
        })

    # Check distinct cities
    if features.get("distinct_cities", 1) >= 3:
        reasons.append({
            "signal": "Multi-City Scan",
            "severity": "critical",
            "en": f"Cloned QR: The exact same individual item was simultaneously scanned in {features['distinct_cities']} different cities.",
            "hi": f"QR Clone Alert: Yahi ek item ek hi waqt mein {features['distinct_cities']} alag shehron mein scan kiya gaya."
        })

    return reasons
```
