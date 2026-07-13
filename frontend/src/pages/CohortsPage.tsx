import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getCohorts, createCohort, deleteCohortById } from '../api/cohorts';
import type { Cohort } from '../api/cohorts';
import { useAuthStore } from '../store/authStore';
import { Users, Trash2, PlusCircle } from 'lucide-react';

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'dietitian' || user?.role === 'admin';

  const loadCohorts = async () => {
    setLoading(true);
    try {
      const data = await getCohorts();
      setCohorts(data);
    } catch (err) {
      setError('Failed to load cohorts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createCohort({ name, description });
      setName('');
      setDescription('');
      loadCohorts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create cohort');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cohort?')) return;
    try {
      await deleteCohortById(id);
      loadCohorts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Cohorts</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
        {cohorts.length} groups configured
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
            <h3 style={{ margin: 0, fontSize: 16 }}>Add New Cohort</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <input placeholder="Name (e.g. Ward 4B)" value={name} onChange={(e) => setName(e.target.value)} required style={{ maxWidth: 220 }} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ maxWidth: 260 }} />
          </div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Cohort'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
        </div>
      ) : cohorts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          <Users size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No cohorts yet — add your first group above.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {canManage && <th style={{ textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.description || '-'}</td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-ghost"
                        onClick={() => handleDelete(c.id)}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)', padding: '6px 10px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}