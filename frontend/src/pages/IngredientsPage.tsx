import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getIngredients, createIngredient, deleteIngredient } from '../api/ingredients';
import type { Ingredient } from '../types';
import { useAuthStore } from '../store/authStore';
import { Carrot, Trash2, PlusCircle, AlertTriangle, Radar as RadarIcon } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [stockLevel, setStockLevel] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'procurement_officer' || user?.role === 'admin';

  const loadIngredients = async () => {
    setLoading(true);
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (err) {
      setError('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createIngredient({ name, unit, category, stockLevel });
      setName('');
      setUnit('');
      setCategory('');
      setStockLevel(0);
      loadIngredients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ingredient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ingredient?')) return;
    try {
      await deleteIngredient(id);
      loadIngredients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const lowStockCount = ingredients.filter((i) => i.stockLevel < 10).length;

  const getCategoryChartData = () => {
    const totals: Record<string, number> = {};
    ingredients.forEach((i) => {
      const cat = i.category || 'Uncategorized';
      totals[cat] = (totals[cat] || 0) + i.stockLevel;
    });
    return Object.entries(totals).map(([category, stock]) => ({ category, stock }));
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Ingredients</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>
            {ingredients.length} ingredients tracked
            {lowStockCount > 0 && (
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}> · {lowStockCount} low on stock</span>
            )}
          </p>
        </div>
      </div>

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
            <h3 style={{ margin: 0, fontSize: 16 }}>Add New Ingredient</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ maxWidth: 200 }} />
            <input placeholder="Unit (kg/g/litre)" value={unit} onChange={(e) => setUnit(e.target.value)} required style={{ maxWidth: 180 }} />
            <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required style={{ maxWidth: 180 }} />
            <input
              type="number"
              placeholder="Stock Level"
              value={stockLevel}
              onChange={(e) => setStockLevel(Number(e.target.value))}
              style={{ maxWidth: 140 }}
            />
          </div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Ingredient'}
          </button>
        </form>
      )}

      {!loading && ingredients.length > 0 && (
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
              <RadarIcon size={17} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Stock Spread by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={getCategoryChartData()} outerRadius="75%">
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar
                name="Total Stock"
                dataKey="stock"
                stroke="var(--primary-dark, #4f46e5)"
                fill="var(--primary, #6366f1)"
                fillOpacity={0.35}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
        </div>
      ) : ingredients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          <Carrot size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No ingredients yet — add your first one above.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Stock</th>
                {canManage && <th style={{ textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => (
                <tr key={ing.id}>
                  <td style={{ fontWeight: 600 }}>{ing.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{ing.category}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{ing.unit}</td>
                  <td>
                    {ing.stockLevel < 10 ? (
                      <span className="badge badge-danger" style={{ gap: 4 }}>
                        <AlertTriangle size={11} />
                        {ing.stockLevel} low
                      </span>
                    ) : (
                      <span>{ing.stockLevel}</span>
                    )}
                  </td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-ghost"
                        onClick={() => handleDelete(ing.id)}
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