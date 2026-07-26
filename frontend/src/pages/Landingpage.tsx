import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Carrot,
  Users,
  ClipboardList,
  Package,
  Trash2,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

const AI_FEATURES = [
  {
    icon: Sparkles,
    label: 'AI Menu Generation',
    desc: 'Generate a full weekly menu in seconds, built around your ingredients and cohorts.',
  },
  {
    icon: ShieldAlert,
    label: 'AI Allergy Check',
    desc: "Scans every ingredient against your whole cohort and flags anyone who can't eat it.",
  },
  {
    icon: Trash2,
    label: 'AI Waste Analysis',
    desc: 'Reads your waste logs to show what gets thrown out, and why, before it repeats.',
  },
  {
    icon: TrendingUp,
    label: 'AI Procurement Forecast',
    desc: 'Looks at the last 4 weeks of usage and predicts how much of each ingredient to order next.',
  },
];

const MODULES = [
  { icon: UtensilsCrossed, label: 'Menus', desc: 'Plan and publish menu cycles across every kitchen.' },
  { icon: Carrot, label: 'Ingredients', desc: 'Track stock levels and get alerted before you run out.' },
  { icon: ClipboardList, label: 'Dietary Profiles', desc: "Flag allergens and restrictions before a tray goes out." },
  { icon: Users, label: 'Cohorts', desc: 'Group residents, wards, or classes for accurate counts.' },
  { icon: Package, label: 'Procurement', desc: 'Turn low-stock alerts into purchase orders in one click.' },
  { icon: Trash2, label: 'Waste Log', desc: 'Record what gets thrown out and see where it adds up.' },
];

const ROLES = [
  { n: '01', title: 'Chef', body: 'Build menus, prep meal orders, and log waste from one screen.' },
  { n: '02', title: 'Dietitian', body: 'Set dietary profiles and keep every cohort within its plan.' },
  { n: '03', title: 'Procurement', body: 'Watch ingredient stock and place orders before shortages hit.' },
  { n: '04', title: 'Admin', body: 'See every module across the tenant, unfiltered.' },
];

/* ---------- Scroll reveal wrapper ---------- */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Roles timeline with scroll-driven connector line ---------- */
function RolesTimeline() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const desktopLineRef = useRef<HTMLDivElement | null>(null);
  const mobileLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Progress reaches 0 as the track enters the bottom of the viewport,
      // and 1 once it has scrolled most of the way past the top.
      const raw = (vh * 0.85 - rect.top) / (rect.height + vh * 0.55);
      const progress = Math.min(1, Math.max(0, raw));
      const pct = `${progress * 100}%`;

      if (desktopLineRef.current) desktopLineRef.current.style.width = pct;
      if (mobileLineRef.current) mobileLineRef.current.style.height = pct;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="ms-timeline-track" ref={trackRef}>
      <div className="ms-timeline-line-wrap ms-timeline-line-wrap-desktop" aria-hidden="true">
        <div className="ms-timeline-line-bg" />
        <div ref={desktopLineRef} className="ms-timeline-line-progress" />
      </div>
      <div className="ms-timeline-line-wrap ms-timeline-line-wrap-mobile" aria-hidden="true">
        <div className="ms-timeline-line-bg" />
        <div ref={mobileLineRef} className="ms-timeline-line-progress" />
      </div>

      <div className="ms-timeline">
        {ROLES.map((r, i) => (
          <Reveal key={r.n} delay={i * 100}>
            <div className="ms-timeline-item">
              <div className="ms-timeline-node">{r.n}</div>
              <div className="ms-timeline-title">{r.title}</div>
              <div className="ms-timeline-body">{r.body}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="ms-landing" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <style>{`
        .ms-nav {
          position: sticky; top: 0; z-index: 30;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid var(--border);
          background: rgba(247, 246, 242, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .ms-hero { max-width: 900px; margin: 0 auto; padding: 100px 24px 70px; text-align: center; }

        /* ---------- AI feature grid: equal-size cards ---------- */
        .ms-ai-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 980px) {
          .ms-ai-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ms-ai-grid { grid-template-columns: 1fr; }
        }

        .ms-ai-card {
          padding: 30px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .ms-ai-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-mono);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--primary);
          border: 1px solid var(--primary);
          border-radius: 999px;
          padding: 3px 10px;
          margin-bottom: 18px;
          width: fit-content;
        }

        .ms-ai-icon {
          position: relative;
          width: 44px; height: 44px;
          border: 1px solid var(--primary);
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          color: var(--primary);
          background: var(--primary-light);
          margin-bottom: 18px;
        }
        .ms-ai-icon::after {
          content: '';
          position: absolute;
          inset: -6px;
          border: 1px solid var(--primary);
          border-radius: 2px;
          opacity: 0.35;
          animation: ms-pulse 2.4s ease-in-out infinite;
        }
        @keyframes ms-pulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.08); opacity: 0; }
        }

        .ms-scanline {
          position: relative; height: 2px; background: var(--border);
          overflow: hidden; margin: 0 auto; max-width: 1100px;
        }
        .ms-scanline::after {
          content: ''; position: absolute; top: 0; left: -30%; width: 30%; height: 100%;
          background: var(--primary); animation: ms-scan 2.6s cubic-bezier(0.8,0,0.2,1) infinite;
        }
        @keyframes ms-scan { 0% { left: -30%; } 100% { left: 100%; } }

        /* Glass card: same square-corner editorial system, but translucent + blurred */
        .ms-glass {
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          box-shadow: 0 8px 28px rgba(28, 28, 28, 0.06);
          transition: var(--transition);
        }
        .ms-glass:hover {
          background: rgba(255, 255, 255, 0.65);
          border-color: var(--primary);
          box-shadow: 0 16px 40px rgba(28, 28, 28, 0.1);
        }

        /* ---------- Modules: dark teal band, equal-size cards, light foreground ---------- */
        .ms-teal-band {
          background: var(--primary);
          padding: 90px 24px;
        }
        .ms-teal-inner { max-width: 1100px; margin: 0 auto; }
        .ms-teal-eyebrow {
          font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.2em; color: rgba(255,255,255,0.65);
          text-align: center; margin-bottom: 20px;
        }
        .ms-teal-heading {
          font-family: var(--font-display); font-weight: 400;
          font-size: clamp(26px, 4vw, 38px); letter-spacing: -0.01em;
          color: #fff; text-align: center; margin: 0 0 44px;
        }

        .ms-module-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 860px) {
          .ms-module-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ms-module-grid { grid-template-columns: 1fr; }
        }

        .ms-module-card {
          padding: 30px;
          height: 100%;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: var(--radius);
          background: rgba(255,255,255,0.06);
          transition: var(--transition);
        }
        .ms-module-card:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.4);
        }
        .ms-module-icon-wrap {
          width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.3); border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          margin-bottom: 18px;
        }
        .ms-module-label {
          font-family: var(--font-display); font-size: 18px; font-weight: 500;
          color: #fff; margin-bottom: 8px;
        }
        .ms-module-desc {
          font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;
        }

        /* ---------- Roles: horizontal timeline with scroll-drawn plain line ---------- */
        .ms-timeline-track {
          position: relative;
          padding-top: 6px;
        }
        .ms-timeline-line-wrap {
          position: absolute;
          pointer-events: none;
        }
        .ms-timeline-line-wrap-desktop {
          top: 22px; left: 0;
          width: 100%; height: 2px;
        }
        .ms-timeline-line-wrap-mobile {
          display: none;
          top: 0; left: 21px;
          width: 2px; height: 100%;
        }
        .ms-timeline-line-bg {
          position: absolute;
          inset: 0;
          background: var(--border);
        }
        .ms-timeline-line-progress {
          position: absolute;
          top: 0; left: 0;
          width: 0%;
          height: 100%;
          background: var(--text);
        }
        .ms-timeline-line-wrap-mobile .ms-timeline-line-progress {
          width: 100%;
          height: 0%;
        }

        .ms-timeline {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 36px;
        }
        .ms-timeline-item { position: relative; padding-top: 64px; }
        .ms-timeline-node {
          position: absolute;
          top: 0; left: 0;
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 1px solid var(--primary);
          background: var(--bg);
          color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-size: 11px;
          z-index: 1;
        }
        .ms-timeline-title {
          font-family: var(--font-display); font-size: 19px; font-weight: 500; margin-bottom: 10px;
        }
        .ms-timeline-body {
          font-size: 13px; color: var(--text-muted); line-height: 1.6;
        }

        @media (max-width: 720px) {
          .ms-timeline-line-wrap-desktop { display: none; }
          .ms-timeline-line-wrap-mobile { display: block; }
          .ms-timeline { grid-template-columns: 1fr; gap: 0; }
          .ms-timeline-item { padding-top: 0; padding-left: 62px; padding-bottom: 46px; }
          .ms-timeline-item:last-child { padding-bottom: 0; }
          .ms-timeline-node { top: 0; left: 0; }
        }

        .ms-cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 720px) {
          .ms-nav { padding: 16px 20px; }
          .ms-hero { padding: 70px 20px 50px; }
          .ms-section { padding-left: 20px !important; padding-right: 20px !important; }
          .ms-cta-row { flex-direction: column; align-items: stretch; }
          .ms-cta-row a { justify-content: center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ms-scanline::after { animation: none; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Nav */}
      <header className="ms-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: 2,
              border: '1px solid var(--primary)', background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}
          >
            🥗
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 19, letterSpacing: '-0.01em' }}>
            MealSync
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
         
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', whiteSpace: 'nowrap' }}>
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="ms-hero">
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 999,
            fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
            letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 24,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
          Kitchen operations, in one place
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(36px, 7vw, 76px)', lineHeight: 1.05,
            letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 22px',
          }}
        >
          Feed everyone,
          <br />
          <span style={{ fontStyle: 'italic', color: '#b4b4b4' }}>miss nothing</span>
        </h1>

        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 34px', lineHeight: 1.6 }}>
          MealSync connects menus, ingredients, dietary profiles, and procurement so your
          kitchen team always knows what to cook, who it's for, and what's running low.
        </p>

        <div className="ms-cta-row">
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={14} />
          </Link>
          <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Log In
          </Link>
        </div>
      </section>

      

      {/* AI features — bento layout, one hero card + two stacked */}
      <section className="ms-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 24px 100px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: 12,
              }}
            >
              <Sparkles size={13} /> Powered by AI
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 400,
                fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-0.01em', margin: 0,
              }}
            >
              The part no other kitchen tool does
            </h2>
          </div>
        </Reveal>

        <div className="ms-ai-grid">
          {AI_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.label} delay={i * 100}>
                <div className="ms-glass ms-ai-card">
                  <div className="ms-ai-tag">AI</div>
                  <div className="ms-ai-icon">
                    <Icon size={19} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Modules — dark teal band, equal-size cards, light foreground */}
      <section className="ms-teal-band">
        <div className="ms-teal-inner">
          <Reveal>
            <div className="ms-teal-eyebrow">Everything the kitchen needs</div>
            <div className="ms-teal-heading">One system, every module</div>
          </Reveal>
          <div className="ms-module-grid">
            {MODULES.map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={m.label} delay={i * 80}>
                  <div className="ms-module-card">
                    <div className="ms-module-icon-wrap">
                      <Icon size={18} />
                    </div>
                    <div className="ms-module-label">{m.label}</div>
                    <div className="ms-module-desc">{m.desc}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles — horizontal timeline, connector line draws in as you scroll */}
      <section className="ms-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 130px' }}>
        <Reveal>
          <div
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 48, textAlign: 'center',
            }}
          >
            Built for every role
          </div>
        </Reveal>
        <RolesTimeline />
      </section>

      {/* Closing CTA */}
      <Reveal>
        <section className="ms-section" style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 110px' }}>
          <div className="ms-glass" style={{ padding: '56px 40px', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 400,
                fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-0.01em', marginBottom: 24,
              }}
            >
              Ready to run a tighter kitchen?
            </h2>
            <div className="ms-cta-row">
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                Get Started
              </Link>
              <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                Log In
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <footer
        style={{
          borderTop: '1px solid var(--border)', padding: '20px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
          letterSpacing: '0.15em', color: 'var(--text-muted)',
        }}
      >
        <span>MealSync</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
