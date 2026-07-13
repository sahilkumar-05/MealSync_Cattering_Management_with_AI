import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getDietaryProfiles,
  createDietaryProfile,
  deleteDietaryProfile,
} from '../api/dietaryProfiles';
import type { DietaryProfile } from '../api/dietaryProfiles';
import { getCohorts } from '../api/cohorts';
import type { Cohort } from '../api/cohorts';
import { useAuthStore } from '../store/authStore';
import { ClipboardList, Trash2, PlusCircle, Gauge } from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const SEVERITY_BADGE: Record<string, string> = {
  mild: 'badge-draft',
  moderate: 'badge-review',
  severe: 'badge-danger',
};

export default function DietaryProfilesPage() {
  const [profiles, setProfiles] = useState<DietaryProfile[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dinerName, setDinerName] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [allergen, setAllergen] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [submitting, setSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'dietitian' || user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesData, cohortsData] = await Promise.all([
        getDietaryProfiles(),
        getCohorts(),
      ]);
      setProfiles(profilesData);
      setCohorts(cohortsData);
      if (cohortsData.length > 0) setCohortId(cohortsData[0].id);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createDietaryProfile({
        dinerName,
        cohortId,
        allergies: allergen ? [{ allergen, severity: severity as any }] : [],
      });
      setDinerName('');
      setAllergen('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    try {
      await deleteDietaryProfile(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getCohortName = (id: string) => cohorts.find((c) => c.id === id)?.name || 'Unknown';
  const severeCount = profiles.filter((p) =>
    (Array.isArray(p.allergies) ? p.allergies : []).some((a) => a.severity === 'severe'),
  ).length;

  // Percentage of profiles that have at least one severe allergy — shown as a radial gauge.
  const severePercent = profiles.length > 0 ? Math.round((severeCount / profiles.length) * 100) : 0;
  const gaugeData = [
    {
      name: 'Severe',
      value: severePercent,
      fill: severePercent >= 50 ? 'var(--danger, #ef4444)' : severePercent >= 20 ? '#f59e0b' : 'var(--success, #22c55e)',
    },
  ];

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Dietary Profiles</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
        {profiles.length} profiles tracked
        {severeCount > 0 && (
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}> · {severeCount} with severe allergies</span>
        )}
      </p>

      {canManage && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusCircle size={17} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Add New Profile</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input placeholder="Diner Name" value={dinerName} onChange={(e) => setDinerName(e.target.value)} required style={{ maxWidth: 180 }} />
            <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} required style={{ maxWidth: 180 }}>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Allergen (optional)"
              value={allergen}
              onChange={(e) => setAllergen(e.target.value)}
              style={{ maxWidth: 180 }}
            />
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ maxWidth: 140 }}>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Profile'}
          </button>
        </form>
      )}

      {!loading && profiles.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gauge size={17} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Severe Allergy Rate</h3>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
                Share of profiles with a severe allergy
              </p>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={gaugeData}
                startAngle={210}
                endAngle={-30}
                innerRadius="70%"
                outerRadius="100%"
                barSize={18}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--bg-subtle, #f1f5f9)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div
              style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{severePercent}%</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                {severeCount} of {profiles.length} profiles
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          <ClipboardList size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No dietary profiles yet — add your first one above.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Cohort</th>
                <th>Allergies</th>
                {canManage && <th style={{ textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const allergiesList = Array.isArray(p.allergies) ? p.allergies : [];
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.dinerName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{getCohortName(p.cohortId)}</td>
                    <td>
                      {allergiesList.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {allergiesList.map((a, i) => (
                            <span key={i} className={`badge ${SEVERITY_BADGE[a.severity] || 'badge-draft'}`}>
                              {a.allergen} · {a.severity}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    {canManage && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-ghost"
                          onClick={() => handleDelete(p.id)}
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)', padding: '6px 10px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}