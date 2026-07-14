import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getMealOrders,
  placeStudentOrder,
  placeWardOrder,
  cancelMealOrder,
  finalizeOrders,
} from '../api/mealOrders';
import type { MealOrder } from '../api/mealOrders';
import { getCohorts } from '../api/cohorts';
import type { Cohort } from '../api/cohorts';
import { getMenus } from '../api/menus';
import type { Menu } from '../types';
import { useAuthStore } from '../store/authStore';
import { UtensilsCrossed, PlusCircle, XCircle } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  placed: 'badge-review',
  finalized: 'badge-published',
  cancelled: 'badge-danger',
};

export default function MealOrdersPage() {
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [finalizeDate, setFinalizeDate] = useState('');
  const [finalizing, setFinalizing] = useState(false);

  const [menuItemId, setMenuItemId] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [dinerName, setDinerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isNurse = user?.role?.toLowerCase() === 'nurse';
  const isChefOrAdmin =
    user?.role?.toLowerCase() === 'chef' || user?.role?.toLowerCase() === 'admin';

  const publishedMenus = menus.filter((m) => m.status === 'published');
  const allMenuItems = publishedMenus.flatMap((m) => m.items);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, cohortsData, menusData] = await Promise.all([
        getMealOrders(),
        getCohorts(),
        getMenus(),
      ]);
      setOrders(ordersData);
      setCohorts(cohortsData);
      setMenus(menusData);
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

  const handleFinalize = async () => {
    if (!finalizeDate) {
      alert('Select a service date first');
      return;
    }
    setFinalizing(true);
    try {
      console.log('[finalize] calling API with date:', finalizeDate);
      const result = await finalizeOrders(finalizeDate);
      console.log('[finalize] API response:', result);
      alert(`Finalized ${result.totalOrders} orders for ${result.serviceDate}`);
      loadData();
    } catch (err: any) {
      console.error('[finalize] error:', err);
      alert(err.response?.data?.message || 'Failed to finalize');
    } finally {
      setFinalizing(false);
    }
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isNurse) {
        await placeWardOrder({ menuItemId, serviceDate, cohortId, dinerName, quantity });
      } else {
        await placeStudentOrder({ menuItemId, serviceDate, cohortId, dinerName });
      }
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await cancelMealOrder(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
        {isNurse ? 'Ward Orders' : 'My Orders'}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
        {orders.length} order{orders.length !== 1 ? 's' : ''} placed
      </p>

      <form onSubmit={handlePlaceOrder} className="card" style={{ marginBottom: 24 }}>
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
          <h3 style={{ margin: 0, fontSize: 16 }}>Place Order</h3>
        </div>

        {allMenuItems.length === 0 && (
          <div className="alert alert-info" style={{ marginBottom: 14 }}>
            No published menus available yet — check back once a menu has been published.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <select value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)} required style={{ maxWidth: 220 }}>
            <option value="">Select a dish</option>
            {allMenuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.dishName} ({item.mealType})
              </option>
            ))}
          </select>
          <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} required style={{ maxWidth: 170 }} />
          <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} required style={{ maxWidth: 180 }}>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder={isNurse ? 'Ward name' : 'Your name'}
            value={dinerName}
            onChange={(e) => setDinerName(e.target.value)}
            style={{ maxWidth: 160 }}
          />
          {isNurse && (
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              style={{ maxWidth: 110 }}
            />
          )}
        </div>
        {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Placing…' : 'Place Order'}
        </button>
      </form>

      {isChefOrAdmin && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 14 }}>Finalize Orders for Kitchen</strong>
          <input
            type="date"
            value={finalizeDate}
            onChange={(e) => setFinalizeDate(e.target.value)}
            style={{ maxWidth: 170 }}
          />
          <button className="btn-primary" onClick={handleFinalize} disabled={finalizing}>
            {finalizing ? 'Finalizing…' : 'Finalize & Notify Kitchen'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 46 }} />
          <div className="skeleton" style={{ height: 46 }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          <UtensilsCrossed size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No orders placed yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'scroll' }}>
          <table>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Date</th>
                <th>Diner</th>
                <th>Qty</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.dishName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.serviceDate}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.dinerName || '-'}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] || 'badge-draft'}`}>{order.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {order.status === 'placed' && (
                      <button
                        className="btn-ghost"
                        onClick={() => handleCancel(order.id)}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)', padding: '6px 10px' }}
                      >
                        <XCircle size={14} />
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
