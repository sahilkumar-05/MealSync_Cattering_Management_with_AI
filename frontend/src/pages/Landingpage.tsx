import { Link } from 'react-router-dom';
import {
  Carrot,
  Users,
  ClipboardList,
  Package,
  Trash2,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';

const MODULES = [
  {
    icon: UtensilsCrossed,
    label: 'Menus',
    desc: 'Plan and publish menu cycles across every kitchen.',
  },
  {
    icon: Carrot,
    label: 'Ingredients',
    desc: 'Track stock levels and get alerted before you run out.',
  },
  {
    icon: ClipboardList,
    label: 'Dietary Profiles',
    desc: 'Flag allergens and restrictions before a tray goes out.',
  },
  {
    icon: Users,
    label: 'Cohorts',
    desc: 'Group residents, wards, or classes for accurate counts.',
  },
  {
    icon: Package,
    label: 'Procurement',
    desc: 'Turn low-stock alerts into purchase orders in one click.',
  },
  {
    icon: Trash2,
    label: 'Waste Log',
    desc: 'Record what gets thrown out and see where it adds up.',
  },
];

const ROLES = [
  { n: '01', title: 'Chef', body: 'Build menus, prep meal orders, and log waste from one screen.' },
  { n: '02', title: 'Dietitian', body: 'Set dietary profiles and keep every cohort within its plan.' },
  { n: '03', title: 'Procurement', body: 'Watch ingredient stock and place orders before shortages hit.' },
  { n: '04', title: 'Admin', body: 'See every module across the tenant, unfiltered.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(247, 246, 242, 0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 2,
              border: '1px solid var(--primary)',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
            }}
          >
            🥗
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 19, letterSpacing: '-0.01em' }}>
            MealSync
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            to="/login"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            Log In
          </Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '110px 24px 90px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            border: '1px solid var(--border)',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
          Kitchen operations, in one place
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(40px, 7vw, 76px)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 22px',
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

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={14} />
          </Link>
          <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Log In
          </Link>
        </div>
      </section>

      {/* Modules grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Everything the kitchen needs
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            border: '1px solid var(--border)',
          }}
        >
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                style={{
                  padding: 32,
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: 18,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, marginBottom: 8 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 110px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Built for every role
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, border: '1px solid var(--border)' }}>
          {ROLES.map((r) => (
            <div key={r.n} style={{ padding: '28px 24px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)', marginBottom: 10 }}>
                {r.n}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
                {r.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          padding: '70px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 40px)',
            letterSpacing: '-0.01em',
            marginBottom: 24,
          }}
        >
          Ready to run a tighter kitchen?
        </h2>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Log In
          </Link>
        </div>
      </section>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
        }}
      >
        <span>MealSync</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
