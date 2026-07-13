import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  predictQuantity,
  getLowStock,
} from '../api/procurement';
import type { ProcurementOrder } from '../api/procurement';
import { getIngredients } from '../api/ingredients';
import type { Ingredient } from '../types';
import { Package, PlusCircle, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-review',
  ordered: 'badge-approved',
  received: 'badge-published',
  cancelled: 'badge-danger',
};

export default function ProcurementPage() {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [lowStock, setLowStock] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const [predictingId, setPredictingId] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, ingredientsData, lowStockData] = await Promise.all([
        getOrders(),
        getIngredients(),
        getLowStock(),
      ]);
      setOrders(ordersData);
      setIngredients(ingredientsData);
      setLowStock(lowStockData);
      if (ingredientsData.length > 0) setIngredientId(ingredientsData[0].id);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createOrder({ ingredientId, quantity });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePredict = async (ingId: string) => {
    setPredictingId(ingId);
    setPredicting(true);
    setPredictionResult(null);
    try {
      const result = await predictQuantity(ingId);
      setPredictionResult(result);
    } catch (err) {
      alert('Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const getIngredientName = (id: string) => ingredients.find((i) => i.id === id)?.name || 'Unknown';

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>Procurement</h1>

      {lowStock.length > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 24, flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6 }}>
            <AlertTriangle size={16} />
            Low Stock Alerts
          </div>
          <ul style={{ margin: 0, paddingLeft: 22 }}>
            {lowStock.map((ing) => (
              <li key={ing.id} style={{ fontSize: 13 }}>
                {ing.name} — {ing.stockLevel} {ing.unit} left
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleCreateOrder} className="card" style={{ marginBottom: 24 }}>
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
          <h3 style={{ margin: 0, fontSize: 16 }}>Place New Order</h3>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)} style={{ maxWidth: 200 }}>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Quantity"
            style={{ maxWidth: 140 }}
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => handlePredict(ingredientId)}
            disabled={predicting}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} />
              {predicting ? 'Predicting…' : 'Predict Quantity'}
            </span>
          </button>
        </div>
        {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Placing…' : 'Place Order'}
        </button>
      </form>

      {predictionResult && (
        <div className="alert alert-info" style={{ marginBottom: 24, flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4 }}>
            <Sparkles size={16} />
            AI Prediction for {getIngredientName(predictingId)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, margin: '4px 0' }}>
            {predictionResult.predictedQuantity} units
          </div>
          <div style={{ fontSize: 13 }}>Confidence: {predictionResult.confidenceLevel}</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>{predictionResult.commentary}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Method: {predictionResult.method}</div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          <Package size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No orders placed yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.ingredientName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {order.quantity} {order.unit}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] || 'badge-draft'}`}>{order.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {order.status === 'pending' && (
                      <button className="btn-ghost" onClick={() => handleStatusChange(order.id, 'ordered')}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          Mark Ordered <ArrowRight size={13} />
                        </span>
                      </button>
                    )}
                    {order.status === 'ordered' && (
                      <button className="btn-primary" onClick={() => handleStatusChange(order.id, 'received')}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          Mark Received <ArrowRight size={13} />
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}