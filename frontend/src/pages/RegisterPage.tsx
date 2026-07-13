import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { getTenants } from '../api/tenants';
import type { Tenant } from '../api/tenants';
import { useAuthStore } from '../store/authStore';

const ROLES = ['chef', 'dietitian', 'procurement_officer', 'admin', 'nurse', 'student'];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('chef');
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const data = await getTenants();
        setTenants(data);
        if (data.length > 0) setTenantId(data[0].id);
      } catch (err) {
        setError('Failed to load organizations list');
      }
    };
    loadTenants();
  }, []);

  const selectedTenant = tenants.find((t) => t.id === tenantId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register({ name, email, password, role, tenantId });
      setAuth(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sidebar-bg)',
        padding: 20,
      }}
    >
      <div className="card page-enter" style={{ width: '100%', maxWidth: 420, borderRadius: 20 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 19,
            }}
          >
            🥗
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>MealSync</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '18px 0 4px', letterSpacing: '-0.02em' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Join your organization on MealSync
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Organization</label>
            <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} required>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {selectedTenant?.emailDomain && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Email must end with <strong>@{selectedTenant.emailDomain}</strong>
              </p>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={selectedTenant?.emailDomain ? `you@${selectedTenant.emailDomain}` : ''}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registering…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-dark)', fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
};