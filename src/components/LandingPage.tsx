import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { translations, Language } from '../services/translations';

interface LandingPageProps {
  lang: Language;
  onEnterSite: (initialTab?: 'scanner' | 'register' | 'manufacturer', sampleCode?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onEnterSite
}) => {
  const t = translations[lang];
  const [activeDemoState, setActiveDemoState] = useState<'real' | 'fake'>('real');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: 'easeOut' }
    }
  };

  return (
    <div className="w-full bg-[#faf9f6] text-[#1a1c1a] overflow-x-hidden selection:bg-[#006948] selection:text-white pt-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-16 text-center relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Top Protocol Pill */}
          <motion.div variants={itemVariants} className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#85f8c4]/40 border border-[#006948]/30 text-xs font-bold text-[#006948] shadow-xs">
              <span className="material-symbols-outlined text-[17px]">verified_user</span>
              <span>{t.heroBadge}</span>
            </span>
          </motion.div>

          {/* Primary Hook Question (Big, Bold, Unmistakable) */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-black text-[#1a1c1a] tracking-tight max-w-4xl mx-auto leading-[1.12]"
          >
            {t.heroHeadline}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl font-semibold text-[#006948] max-w-2xl mx-auto leading-snug"
          >
            {t.heroHeadlineSub}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-[#3d4a42] max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroDescription}
          </motion.p>

          {/* Main Action CTAs - Clear Role Portals */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            <button
              type="button"
              onClick={() => onEnterSite('scanner')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#006948]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span>Scan a product</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={() => onEnterSite('register')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-[#efeeeb] text-[#1a1c1a] font-bold text-sm border border-[#bccac0]/40 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#006948]">corporate_fare</span>
              <span>Register products</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. INTERACTIVE REAL VS FAKE SHOWCASE & ANIMATED LOGO COMPARISON */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl border border-[#bccac0]/40 p-6 sm:p-10 shadow-sm"
        >
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1c1a] tracking-tight">
              {t.showcaseTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#6d7a72] mt-1.5">
              {t.showcaseSubtitle}
            </p>

            {/* State Toggle Buttons */}
            <div className="inline-flex p-1 bg-[#f4f3f1] rounded-xl border border-[#bccac0]/40 mt-5">
              <button
                type="button"
                onClick={() => setActiveDemoState('real')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDemoState === 'real'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#1a1c1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Registered example</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDemoState('fake')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDemoState === 'fake'
                    ? 'bg-[#ba1a1a] text-white shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#1a1c1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Unregistered example</span>
              </button>
            </div>
          </div>

          {/* Interactive Card Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* REAL CARD */}
            <motion.div
              animate={{
                scale: activeDemoState === 'real' ? 1.02 : 0.98,
                opacity: activeDemoState === 'real' ? 1 : 0.75
              }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-2xl border transition-all ${
                activeDemoState === 'real'
                  ? 'bg-[#faf9f6] border-[#006948] ring-2 ring-[#006948]/20 shadow-md'
                  : 'bg-white border-[#bccac0]/30'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#bccac0]/25">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">verified_user</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#006948]">
                      {t.cardRealTitle}
                    </h3>
                    <span className="text-[11px] font-bold text-[#006948] bg-[#85f8c4]/50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {t.cardRealTag}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#6d7a72] block">Trust</span>
                  <span className="text-2xl font-mono font-extrabold text-[#006948]">100%</span>
                </div>
              </div>

              {/* Progress gauge for REAL */}
              <div className="py-4 space-y-2">
                <div className="w-full h-2.5 rounded-full bg-[#e9e8e5] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#006948] to-[#00a870]"
                  />
                </div>
                <p className="text-xs text-[#3d4a42] leading-relaxed pt-1">
                  {t.cardRealDesc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#bccac0]/20 flex items-center justify-between text-xs">
                <span className="text-[#6d7a72] font-mono">Sample: NIKE-AIR-JORDAN-1042</span>
                <button
                  type="button"
                  onClick={() => onEnterSite('scanner', 'NIKE-AIR-JORDAN-1042')}
                  className="px-3 py-1.5 rounded-lg bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Check this code
                </button>
              </div>
            </motion.div>

            {/* FAKE CARD */}
            <motion.div
              animate={{
                scale: activeDemoState === 'fake' ? 1.02 : 0.98,
                opacity: activeDemoState === 'fake' ? 1 : 0.75
              }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-2xl border transition-all ${
                activeDemoState === 'fake'
                  ? 'bg-[#faf9f6] border-[#ba1a1a] ring-2 ring-[#ba1a1a]/20 shadow-md'
                  : 'bg-white border-[#bccac0]/30'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#bccac0]/25">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">gpp_bad</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#ba1a1a]">
                      {t.cardFakeTitle}
                    </h3>
                    <span className="text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {t.cardFakeTag}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#6d7a72] block">Trust</span>
                  <span className="text-2xl font-mono font-extrabold text-[#ba1a1a]">0%</span>
                </div>
              </div>

              {/* Progress gauge for FAKE */}
              <div className="py-4 space-y-2">
                <div className="w-full h-2.5 rounded-full bg-[#e9e8e5] overflow-hidden p-0.5">
                  <div className="h-full rounded-full bg-[#ba1a1a] w-0" />
                </div>
                <p className="text-xs text-[#3d4a42] leading-relaxed pt-1">
                  {t.cardFakeDesc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#bccac0]/20 flex items-center justify-between text-xs">
                <span className="text-[#6d7a72] font-mono">Sample: FAKE-COUNTERFEIT-REPLICA-884</span>
                <button
                  type="button"
                  onClick={() => onEnterSite('scanner', 'FAKE-COUNTERFEIT-REPLICA-884')}
                  className="px-3 py-1.5 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Check this code
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 3. WORKING STEPS SECTION: WHAT TRUST CHAIN DOES */}
      <section id="working-steps" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e9e8e5] border border-[#bccac0]/40 text-xs font-semibold text-[#006948] mb-3">
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            <span>{t.stepsSectionBadge}</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1c1a] tracking-tight">
            {t.stepsSectionTitle}
          </h2>
          <p className="text-sm text-[#3d4a42] mt-2 leading-relaxed">
            {t.stepsSectionSubtitle}
          </p>
        </div>

        {/* 5 Step Visual Flow Cards */}
        <div className="space-y-4">
          {[
            {
              title: t.step1Title,
              desc: t.step1Desc,
              icon: 'add_circle',
              color: '#006948',
              badge: 'Add a product'
            },
            {
              title: t.step2Title,
              desc: t.step2Desc,
              icon: 'qr_code_2',
              color: '#006948',
              badge: 'Product code'
            },
            {
              title: t.step3Title,
              desc: t.step3Desc,
              icon: 'center_focus_strong',
              color: '#006948',
              badge: 'Scan the code'
            },
            {
              title: t.step4Title,
              desc: t.step4Desc,
              icon: 'hub',
              color: '#006948',
              badge: 'Find a record'
            },
            {
              title: t.step5Title,
              desc: t.step5Desc,
              icon: 'workspace_premium',
              color: '#006948',
              badge: 'Read the result'
            }
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-[#bccac0]/35 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#006948]/50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#85f8c4]/40 text-[#006948] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[26px]">{step.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1a1c1a]">
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-mono text-[#006948] bg-[#85f8c4]/30 px-2 py-0.5 rounded-full hidden sm:inline">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3d4a42] mt-1 leading-relaxed max-w-2xl">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="text-right sm:flex-shrink-0">
                <span className="text-xs font-mono font-bold text-[#6d7a72]">Step 0{idx + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* 5. FINAL ENTER CALL TO ACTION WITH SMOOTH ZOOM TRANSITION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="bg-white rounded-3xl border border-[#bccac0]/40 p-8 sm:p-12 shadow-sm space-y-5"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1a1c1a] tracking-tight">
            {t.ctaTitle}
          </h2>
          <p className="text-sm text-[#3d4a42] max-w-xl mx-auto leading-relaxed">
            {t.ctaSubtitle}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onEnterSite('scanner')}
              className="px-9 py-4 rounded-2xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#006948]/25 inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
              <span>{t.ctaButton}</span>
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
