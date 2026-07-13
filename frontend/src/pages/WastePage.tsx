import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getWasteLogs,
  createWasteLog,
  getWasteByDish,
  getRootCauseAnalysis,
} from '../api/waste';
import type { WasteLog } from '../api/waste';
import { Trash2, PlusCircle, Sparkles, Lightbulb } from 'lucide-react';

export default function WastePage() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [byDish, setByDish] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dishName, setDishName] = useState('');
  const [logDate, setLogDate] = useState('');
  const [wastedKg, setWastedKg] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [analysing, setAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, byDishData] = await Promise.all([getWasteLogs(), getWasteByDish()]);
      setLogs(logsData);
      setByDish(byDishData);
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
      await createWasteLog({ menuItemId: 'manual-entry', dishName, logDate, wastedKg, notes });
      setDishName('');
      setWastedKg(0);
      setNotes('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log waste');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyse = async () => {
    setAnalysing(true);
    setAnalysisResult(null);
    try {
      const result = await getRootCauseAnalysis();
      setAnalysisResult(result);
    } catch (err) {
      alert('Analysis failed');
    } finally {
      setAnalysing(false);
    }
  };

  const totalWasted = byDish.reduce((sum, d) => sum + Number(d.totalWastedKg), 0);
  const maxWasted = Math.max(...byDish.map((d) => Number(d.totalWastedKg)), 1);

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Waste Tracking</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
        {totalWasted.toFixed(1)} kg wasted total across {byDish.length} dishes
      </p>

      <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20 }}>
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
          <h3 style={{ margin: 0, fontSize: 16 }}>Log Waste</h3>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <input placeholder="Dish Name" value={dishName} onChange={(e) => setDishName(e.target.value)} required style={{ maxWidth: 180 }} />
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required style={{ maxWidth: 160 }} />
          <input
            type="number"
            step="0.1"
            placeholder="Wasted (kg)"
            value={wastedKg}
            onChange={(e) => setWastedKg(Number(e.target.value))}
            required
            style={{ maxWidth: 130 }}
          />
          <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ maxWidth: 220 }} />
        </div>
        {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Logging…' : 'Log Waste'}
        </button>
      </form>

      <button onClick={handleAnalyse} className="btn-ghost" disabled={analysing} style={{ marginBottom: 20 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={15} />
          {analysing ? 'Analysing with AI…' : 'Run Root-Cause Analysis'}
        </span>
      </button>

      {analysisResult && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--primary)', borderWidth: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={17} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: 16 }}>AI Root-Cause Analysis</h3>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Top Wasted Dishes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {analysisResult.topWastedDishes.map((d: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-hover)', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{d.dishName}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {d.totalWastedKg}kg — {d.likelyCause}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recommendations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysisResult.recommendations.map((r: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
                <Lightbulb size={14} color="var(--warning)" style={{ marginTop: 2, flexShrink: 0 }} />
                {r}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 14 }}>Method: {analysisResult.method}</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>Waste by Dish</h3>
        {byDish.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No waste data logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byDish.map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{d.dishName}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{d.totalWastedKg} kg</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(Number(d.totalWastedKg) / maxWasted) * 100}%`,
                      background: 'var(--primary)',
                      borderRadius: 4,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 12 }}>All Logs</h3>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          <Trash2 size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No waste logs yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Date</th>
                <th>Wasted (kg)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.dishName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.logDate}</td>
                  <td>{log.wastedKg}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}