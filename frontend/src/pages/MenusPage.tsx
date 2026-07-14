import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getMenus,
  generateMenu,
  updateMenuStatus,
  checkAllergyConflict,
  deleteMenu,
} from '../api/menus';
import { getCohorts } from '../api/cohorts';
import type { Cohort } from '../api/cohorts';
import type { Menu, MenuItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Eye, Trash2, ShieldCheck, ChevronRight, PieChart as PieChartIcon, ArrowUp, CalendarDays, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getAvailableTransitions = (status: string, role: string): string[] => {
  const transitions: Record<string, { status: string; roles: string[] }[]> = {
    draft: [{ status: 'dietitian_review', roles: ['chef', 'admin'] }],
    dietitian_review: [
      { status: 'approved', roles: ['dietitian', 'admin'] },
      { status: 'draft', roles: ['dietitian', 'admin'] },
    ],
    approved: [
      { status: 'published', roles: ['chef', 'admin'] },
      { status: 'dietitian_review', roles: ['dietitian', 'admin'] },
    ],
    published: [],
  };

  return (transitions[status] || [])
    .filter((t) => t.roles.includes(role))
    .map((t) => t.status);
};

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-draft',
  dietitian_review: 'badge-review',
  approved: 'badge-approved',
  published: 'badge-published',
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#d044fe',
  dietitian_review: '#e6ac47',
  approved: '#3b82f6',
  published: '#ff0000',
};

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  const [weekStarting, setWeekStarting] = useState('');
  const [budgetPerMeal, setBudgetPerMeal] = useState(150);
  const [nutritionalStandard, setNutritionalStandard] = useState('standard');
  const [noteText, setNoteText] = useState('');
  const [generating, setGenerating] = useState(false);

  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [excluding, setExcluding] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'chef' || user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [menusData, cohortsData] = await Promise.all([getMenus(), getCohorts()]);
      setMenus(menusData);
      setCohorts(cohortsData);
      if (cohortsData.length > 0) setSelectedCohortId(cohortsData[0].id);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Splits the free-text box into individual dietary-note strings (one per
  // line or comma-separated), since the backend DTO wants a string[].
  const parseNotes = (text: string): string[] =>
    text
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

  const doGenerate = async (opts?: { weekStarting?: string; extraNotes?: string[] }) => {
    const wk = opts?.weekStarting ?? weekStarting;
    const dietaryNotes = [
      ...parseNotes(noteText),
      ...excludedIngredients.map((i) => `Avoid ${i}`),
      ...(opts?.extraNotes ?? []),
    ];
    setGenerating(true);
    setError('');
    try {
      const result = await generateMenu({
        weekStarting: wk,
        budgetPerMeal,
        nutritionalStandard,
        dietaryNotes,
      });
      alert(`Menu generated using: ${result.generationMethod}`);
      setConflictResult(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate menu');
    } finally {
      setGenerating(false);
      setExcluding(null);
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    doGenerate();
  };

  // Called when the person taps "Exclude & regenerate" on a conflicting ingredient.
  // Adds it to the running exclude list (sent as a "Avoid <ingredient>" dietary
  // note) and re-runs generation for the same week so the new menu steers clear of it.
  const handleExcludeAndRegenerate = async (ingredientName: string) => {
    if (excludedIngredients.includes(ingredientName)) return;
    const updatedExcluded = [...excludedIngredients, ingredientName];
    setExcludedIngredients(updatedExcluded);

    const wk = conflictResult?.menuWeekStarting || weekStarting;
    setWeekStarting(wk);
    setExcluding(ingredientName);
    await doGenerate({
      weekStarting: wk,
      extraNotes: updatedExcluded.map((i) => `Avoid ${i}`),
    });
  };

  const handleStatusChange = async (menuId: string, newStatus: string) => {
    try {
      await updateMenuStatus(menuId, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCheckConflict = async (item: MenuItem, menu: Menu) => {
    if (!selectedCohortId) {
      alert('Please select a cohort first');
      return;
    }
    setConflictResult(null);
    try {
      const result = await checkAllergyConflict(item.id, selectedCohortId);
      setConflictResult({ ...result, dishName: item.dishName, menuWeekStarting: menu.weekStarting });
    } catch (err) {
      alert('Failed to check conflicts');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu?')) return;
    try {
      await deleteMenu(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getStatusChartData = () => {
    const counts: Record<string, number> = {};
    menus.forEach((m) => {
      counts[m.status] = (counts[m.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: status.replace('_', ' '),
      value,
      color: STATUS_COLORS[status] || '#cbd5e1',
    }));
  };

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>Menus</h1>

      {canManage && (
        <form
          onSubmit={handleGenerate}
          className="card"
          style={{
            marginBottom: 24,
            background: 'linear-gradient(180deg, #c4ffe5f9 0%, #ffffff 99%,transparent 80%)',
            border: '1px solid var(--success-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--success-bg)',
                color: ' #00444f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} className={generating ? 'spin-pulse' : ''} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Generate Weekly Menu with AI</h3>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
                Describe what you want, or just hit generate for a balanced default
              </p>
            </div>
          </div>

          {/* Chat-style prompt bar */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 16,
              background: 'var(--surface)',
              padding: '10px 10px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. 35% vegetarian, no beef, kid-friendly portions… (one note per line or comma-separated)"
              rows={2}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                background: 'transparent',
                fontSize: 14.5,
                lineHeight: 1.5,
                fontFamily: 'inherit',
                padding: 0,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: 'var(--bg-subtle, #f1f5f9)',
                    fontSize: 12.5,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <CalendarDays size={13} />
                  <input
                    type="date"
                    value={weekStarting}
                    onChange={(e) => setWeekStarting(e.target.value)}
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 12.5,
                      color: 'inherit',
                      maxWidth: 130,
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: 'var(--bg-subtle, #f1f5f9)',
                    fontSize: 12.5,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <Wallet size={13} />
                  <input
                    type="number"
                    value={budgetPerMeal}
                    onChange={(e) => setBudgetPerMeal(Number(e.target.value))}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 12.5,
                      color: 'inherit',
                      width: 60,
                    }}
                  />
                  <span>/ meal</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: 'var(--bg-subtle, #f1f5f9)',
                    fontSize: 12.5,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <ShieldCheck size={13} />
                  <select
                    value={nutritionalStandard}
                    onChange={(e) => setNutritionalStandard(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 12.5,
                      color: 'inherit',
                    }}
                  >
                    <option value="standard">Standard</option>
                    <option value="NHS">NHS</option>
                    <option value="student">Student</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={generating}
                aria-label="Generate menu"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: generating ? 'var(--text-muted)' : 'var(--success)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: generating ? 'default' : 'pointer',
                  flexShrink: 0,
                }}
              >
                {generating ? (
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                ) : (
                  <ArrowUp size={16} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .spin-pulse { animation: pulse 1.4s ease-in-out infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          `}</style>
        </form>
      )}

      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShieldCheck size={18} color="var(--text-muted)" />
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
          Check conflicts against cohort
        </label>
        <select
          value={selectedCohortId}
          onChange={(e) => setSelectedCohortId(e.target.value)}
          style={{ maxWidth: 240 }}
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {conflictResult && (
        <div
          className={`alert ${conflictResult.blocked ? 'alert-danger' : 'alert-success'}`}
          style={{ marginBottom: 24, flexDirection: 'column' }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {conflictResult.dishName} —{' '}
            {conflictResult.blocked ? '🚫 Blocked: severe conflict found' : '✅ No blocking conflicts'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Method: {conflictResult.method}</div>
          {conflictResult.conflicts.length > 0 && (
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
              {conflictResult.conflicts.map((c: any, i: number) => {
                const isExcluded = excludedIngredients.includes(c.ingredient);
                return (
                  <li key={i} style={{ fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span>
                      {c.ingredient} conflicts with {c.allergen} ({c.severity})
                    </span>
                    <button
                      type="button"
                      disabled={isExcluded || generating}
                      onClick={() => handleExcludeAndRegenerate(c.ingredient)}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: 999,
                        border: '1px solid var(--danger-bg, #fecaca)',
                        background: isExcluded ? 'var(--danger-bg, #fecaca)' : 'transparent',
                        color: 'var(--danger, #ef4444)',
                        cursor: isExcluded || generating ? 'default' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {excluding === c.ingredient && generating
                        ? 'Regenerating…'
                        : isExcluded
                        ? '✓ Excluded'
                        : `✕ Exclude "${c.ingredient}" & regenerate`}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {excludedIngredients.length > 0 && (
            <div style={{ fontSize: 12, marginTop: 10, color: 'var(--text-muted)' }}>
              Menu regenerated avoiding: {excludedIngredients.join(', ')}
            </div>
          )}
        </div>
      )}

      {!loading && menus.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieChartIcon size={17} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Menu Status Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={getStatusChartData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {getStatusChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ height: 70 }} />
          <div className="skeleton" style={{ height: 70 }} />
          <div className="skeleton" style={{ height: 70 }} />
        </div>
      ) : menus.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          No menus yet — generate one with AI to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {menus.map((menu) => (
            <div key={menu.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <strong style={{ fontSize: 15 }}>Week of {menu.weekStarting}</strong>
                  <span className={`badge ${STATUS_BADGE[menu.status] || 'badge-draft'}`}>
                    {menu.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setExpandedMenuId(expandedMenuId === menu.id ? null : menu.id)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Eye size={14} />
                      {expandedMenuId === menu.id ? 'Hide Items' : 'View Items'}
                    </span>
                  </button>
                  {user &&
                    getAvailableTransitions(menu.status, user.role).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        className="btn-primary"
                        onClick={() => handleStatusChange(menu.id, nextStatus)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {nextStatus.replace('_', ' ')}
                          <ChevronRight size={14} />
                        </span>
                      </button>
                    ))}
                  {canManage && (
                    <button
                      className="btn-ghost"
                      onClick={() => handleDelete(menu.id)}
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
 
              {expandedMenuId === menu.id && (
                
                <table style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Meal</th>
                      <th>Dish</th>
                      <th>Ingredients</th>
                      <th>Allergy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.items.map((item) => (
                      <tr key={item.id}>
                        <td>{DAYS[item.dayOfWeek]}</td>
                        <td style={{ textTransform: 'capitalize' }}>{item.mealType}</td>
                        <td style={{ fontWeight: 600 }}>{item.dishName}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {item.ingredients.map((i: any) => i.ingredientName).join(', ')}
                        </td>
                        <td>
                          <button className="btn-ghost" onClick={() => handleCheckConflict(item, menu)}>
                            Check
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
