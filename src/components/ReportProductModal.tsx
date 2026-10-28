import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CounterfeitReport, ReportType } from '../types';
import { createNewReport } from '../services/reportsStore';

interface ReportProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: {
    name?: string;
    brand?: string;
    variant?: string;
    barcode?: string;
  };
  onReportSubmitted?: (newReport: CounterfeitReport) => void;
}

export const ReportProductModal: React.FC<ReportProductModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  onReportSubmitted
}) => {
  const [reportType, setReportType] = useState<ReportType>('counterfeit');
  const [productName, setProductName] = useState(initialProduct?.name || '');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [variant, setVariant] = useState(initialProduct?.variant || '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [batchNumber, setBatchNumber] = useState('');
  const [description, setDescription] = useState('');

  // User details
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Photo upload
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  // Distributor / Retailer Location details
  const [storeName, setStoreName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [priceCharged, setPriceCharged] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CounterfeitReport | null>(null);

  useEffect(() => {
    if (initialProduct) {
      if (initialProduct.name) setProductName(initialProduct.name);
      if (initialProduct.brand) setBrand(initialProduct.brand);
      if (initialProduct.variant) setVariant(initialProduct.variant);
      if (initialProduct.barcode) setBarcode(initialProduct.barcode);
    }
  }, [initialProduct]);

  if (!isOpen) return null;

  // Handle photo file selection & convert to Data URL
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
      setIsPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Get current device GPS coordinates
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationSuccessMsg(`GPS Coordinates Acquired: ${lat}, ${lng}`);

        // If city is empty, fill default based on rough location
        if (!city) {
          setCity('Current GPS Location');
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not retrieve current GPS location. Please type the store address manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Please specify the product name.');
      return;
    }
    if (!description.trim()) {
      alert('Please describe the issue or your query for the manufacturer.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payloadData = {
        type: reportType,
        productName: productName.trim(),
        brand: brand.trim() || 'Unspecified Brand',
        variant: variant.trim() || undefined,
        barcode: barcode.trim() || 'MANUAL-ENTRY',
        batchNumber: batchNumber.trim() || undefined,
        photoUrl: photoPreview || undefined,
        description: description.trim(),
        userName: userName.trim() || 'Consumer Reporter',
        userEmail: userEmail.trim() || undefined,
        userPhone: userPhone.trim() || undefined,
        distributorLocation: storeName.trim()
          ? {
              storeName: storeName.trim(),
              streetAddress: streetAddress.trim(),
              landmark: landmark.trim() || undefined,
              city: city.trim() || 'Unknown City',
              state: state.trim() || 'Unknown State',
              postalCode: postalCode.trim() || undefined,
              latitude,
              longitude,
              priceCharged: priceCharged.trim() || undefined,
              purchaseDate
            }
          : undefined
      };

      // 1. Save in local reports store
      const localReport = createNewReport(payloadData);

      // 2. Also notify server endpoint if available
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localReport)
        });
      } catch (srvErr) {
        console.warn('Server sync error:', srvErr);
      }

      setSubmittedReport(localReport);
      if (onReportSubmitted) {
        onReportSubmitted(localReport);
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedReport(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#bccac0]/50 overflow-hidden my-6 text-[#1a1c1a]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccac0]/30 bg-[#faf9f6]">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
              reportType === 'counterfeit' ? 'bg-[#ba1a1a]' : 'bg-[#006948]'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {reportType === 'counterfeit' ? 'gavel' : 'contact_support'}
              </span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1a1c1a]">
                {reportType === 'counterfeit'
                  ? 'Report Fake Product & Track Seller'
                  : 'Raise Query / Report Issue to Manufacturer'}
              </h2>
              <p className="text-xs text-[#6d7a72]">
                Your report goes directly to the authorized brand protection and quality cell
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7a72] hover:bg-[#efeeeb] cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success Confirmation View */}
        {submittedReport ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#85f8c4]/40 border border-[#006948]/30 text-[#006948] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#1a1c1a]">Report Successfully Submitted!</h3>
              <p className="text-sm text-[#3d4a42]">
                Your case has been logged under Tracking ID:
              </p>
              <div className="inline-block px-4 py-1.5 rounded-xl bg-[#faf9f6] border border-[#bccac0] font-mono text-sm font-bold text-[#006948]">
                {submittedReport.id}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between text-[#3d4a42]">
                <span className="font-semibold">Product:</span>
                <span className="font-medium text-right">{submittedReport.productName}</span>
              </div>
              {submittedReport.distributorLocation && (
                <div className="flex justify-between text-[#3d4a42]">
                  <span className="font-semibold">Reported Seller:</span>
                  <span className="font-medium text-right">
                    {submittedReport.distributorLocation.storeName} ({submittedReport.distributorLocation.city})
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#3d4a42]">
                <span className="font-semibold">Investigation Status:</span>
                <span className="font-bold text-[#ba1a1a]">Logged for Enforcement Audit</span>
              </div>
            </div>

            <p className="text-xs text-[#6d7a72] max-w-md mx-auto leading-relaxed">
              The brand manufacturer legal team will verify this seller location. If found guilty of distributing counterfeit goods, strict civil or criminal action will be executed.
            </p>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-sm shadow-sm cursor-pointer transition-all"
            >
              Done & Return to Scanner
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Issue Category Pill Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4a42] mb-2">
                Select Report Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'counterfeit', label: 'Fake / Replica', icon: 'gavel', color: 'text-[#ba1a1a] border-[#ba1a1a]/30' },
                  { id: 'damaged', label: 'Damaged Packaging', icon: 'broken_image', color: 'text-[#825100] border-[#825100]/30' },
                  { id: 'expired', label: 'Expired / Mislabeled', icon: 'event_busy', color: 'text-[#825100] border-[#825100]/30' },
                  { id: 'query', label: 'Question to Brand', icon: 'help', color: 'text-[#006948] border-[#006948]/30' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReportType(item.id as ReportType)}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      reportType === item.id
                        ? 'bg-white shadow-sm ring-2 ring-[#006948] border-transparent'
                        : 'bg-[#faf9f6] border-[#bccac0]/40 hover:bg-white text-[#3d4a42]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${item.color}`}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold text-[#1a1c1a]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Identification Details */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#006948] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                Product Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Product Name & Variant *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Amul Dark Chocolate 55% / Oreo Vanilla"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Amul, Cadbury, Nestlé"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Scanned Barcode / GTIN
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 8901262010881"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Printed Batch / Lot Number (if visible)
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-2026-X9"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload: Defect, Damage, or Counterfeit Proof */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
                Upload Photo of Product / Defect / Seal
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-[#bccac0]/60 bg-[#faf9f6] hover:bg-white transition-colors">
                {photoPreview ? (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#bccac0] shadow-xs shrink-0">
                    <img src={photoPreview} alt="Uploaded Defect" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#bccac0]/40 flex items-center justify-center text-[#6d7a72] shrink-0">
                    <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <p className="text-xs font-semibold text-[#1a1c1a]">
                    Upload clear photo showing wrapper defect, broken seal, or suspicious print
                  </p>
                  <p className="text-[11px] text-[#6d7a72]">
                    Supports JPG, PNG, WEBP (Max 15MB)
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#bccac0] text-[#006948] hover:bg-[#efeeeb] text-xs font-semibold cursor-pointer shadow-2xs transition-all mt-1">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>{photoPreview ? 'Change Photo' : 'Select Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Seller / Distributor Location Tracking Section (Crucial for fake product action) */}
            <div className="p-4 rounded-2xl bg-[#ffdad6]/20 border border-[#ba1a1a]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#ba1a1a] font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[17px]">location_on</span>
                  Track Distributor / Seller Location
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#ba1a1a]/30 hover:bg-[#ffdad6]/40 text-[#ba1a1a] text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isLocating ? 'sync' : 'my_location'}
                  </span>
                  <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                </button>
              </div>

              {locationSuccessMsg && (
                <div className="text-[11px] font-mono font-medium text-[#006948] bg-[#85f8c4]/30 px-2.5 py-1 rounded-lg">
                  {locationSuccessMsg}
                </div>
              )}

              <p className="text-[11px] text-[#3d4a42]">
                Provide the exact shop name and location where this item was sold so the manufacturer can investigate and take legal action against the fake distributor.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Store / Shop / Wholesaler Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Metro Kiosk #4 / Sharma General Store / Roadside stall"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Street Address / Market Area
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. Shop 12, Main Market Road"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Landmark / Metro Station
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Bus Depot Gate 2"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    City & State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City (e.g. Mumbai)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State (e.g. Maharashtra)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Price Charged & Purchase Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={priceCharged}
                      onChange={(e) => setPriceCharged(e.target.value)}
                      placeholder="Price Paid (e.g. ₹50)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                    />
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Query */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4a42] mb-1">
                Description of Defect / Query *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what was wrong: e.g. 'Chocolate tasted oily and smelled like paraffin wax. Packaging was missing the green vegetarian dot. Barcode was a glued sticker.'"
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
              />
            </div>

            {/* Contact Details (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                  Email (for updates)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#bccac0]/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6d7a72] hover:bg-[#efeeeb] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{isSubmitting ? 'Submitting Report...' : 'Submit Report to Manufacturer'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
