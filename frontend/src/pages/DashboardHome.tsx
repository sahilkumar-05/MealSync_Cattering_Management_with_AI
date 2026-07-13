import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  FunnelChart,
  Funnel,
  LabelList,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { getMenus } from '../api/menus';
import { getIngredients } from '../api/ingredients';

import { getWasteByDish } from '../api/waste';
import { getOrders } from '../api/procurement';
import type { Menu, Ingredient } from '../types';
import {
  AlertTriangle,
  ClipboardCheck,
  UtensilsCrossed,
  PieChart as PieChartIcon,
  Boxes,
  Gauge,
} from 'lucide-react';

const BAR_COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981'];

const MENU_STATUS_COLORS: Record<string, string> = {
  draft: '#ff9900',
  dietitian_review: '#027173',
  approved: '#0000ff',
  published: '#520983',
};

const CATEGORY_COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#ec4899', '#6366f1'];

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState({
    activeMenus: 0,
    pendingReview: 0,
    lowStock: 0,
    pendingOrders: 0,
  });
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [menusData, ingredientsData, waste] = await Promise.all([
          getMenus().catch(() => []),
          getIngredients().catch(() => []),
          getWasteByDish().catch(() => []),
        ]);

        let pendingOrdersCount = 0;
        try {
          const orders = await getOrders();
          pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
        } catch {
          // role might not have access, ignore
        }

        setStats({
          activeMenus: menusData.filter((m) => m.status === 'published').length,
          pendingReview: menusData.filter((m) => m.status === 'dietitian_review').length,
          lowStock: ingredientsData.filter((i) => i.stockLevel < 10).length,
          pendingOrders: pendingOrdersCount,
        });
        setWasteData(waste.slice(0, 6));
        setMenus(menusData);
        setIngredients(ingredientsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greetingName = user?.name?.split(' ')[0] || '';

  const getMenuStatusData = () => {
    const counts: Record<string, number> = {};
    menus.forEach((m) => {
      counts[m.status] = (counts[m.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: status.replace('_', ' '),
      value,
      color: MENU_STATUS_COLORS[status] || '#cbd5e1',
    }));
  };

  // % of ingredients that are healthy (not low stock) — drives the radial gauge
  const stockHealthPercent =
    ingredients.length > 0
      ? Math.round(((ingredients.length - ingredients.filter((i) => i.stockLevel < 10).length) / ingredients.length) * 100)
      : 0;
  const gaugeData = [
    {
      name: 'Healthy',
      value: stockHealthPercent,
      fill: stockHealthPercent >= 70 ? '#9c0135' : stockHealthPercent >= 40 ? '#f59e0b' : '#ef4444',
    },
  ];

  // Total stock volume per ingredient category, ranked highest to lowest — drives the funnel
  const getCategoryFunnelData = () => {
    const totals: Record<string, number> = {};
    ingredients.forEach((i) => {
      const cat = i.category || 'Uncategorized';
      totals[cat] = (totals[cat] || 0) + i.stockLevel;
    });
    return Object.entries(totals)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const categoryFunnelData = getCategoryFunnelData();

  const menuStatusData = getMenuStatusData();

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
        Welcome back, {greetingName} 👋
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28, textTransform: 'capitalize' }}>
        {user?.role.replace('_', ' ')} dashboard overview
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 32,
        }}
      >
        {loading ? (
          <>
            <div className="skeleton" style={{ height: 120 }} />
            <div className="skeleton" style={{ height: 120 }} />
            <div className="skeleton" style={{ height: 120 }} />
            <div className="skeleton" style={{ height: 120 }} />
          </>
        ) : (
          <>
            <StatCard
              icon={<UtensilsCrossed size={20} />}
              iconVariant="success"
              label="Published Menus"
              value={stats.activeMenus}
            />
            <StatCard
              icon={<ClipboardCheck size={20} />}
              iconVariant="warning"
              label="Awaiting Review"
              value={stats.pendingReview}
            />
            <StatCard
              icon={<AlertTriangle size={20} />}
              iconVariant="danger"
              label="Low Stock Items"
              value={stats.lowStock}
            />
           
          </>
        )}
      </div>

      {/* Charts row: Waste by dish + Menu status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 4, fontSize: 16, fontWeight: 700 }}>Waste by Dish</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0, marginBottom: 20 }}>
            Total kilograms wasted, top dishes
          </p>

          {loading ? (
            <div className="skeleton" style={{ height: 260 }} />
          ) : wasteData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>you do not have Access to this data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={wasteData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dishName" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  cursor={{ fill: 'rgba(20,184,166,0.06)', radius: 8 }}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                  }}
                  formatter={(value: any) => [`${value} kg`, 'Wasted']}
                />
                <Bar dataKey="totalWastedKg" radius={[8, 8, 0, 0]}>
                  {wasteData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <PieChartIcon size={16} color="var(--text-muted)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Menu Status Overview</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0, marginBottom: 20 }}>
            Where all menus currently stand
          </p>

          {loading ? (
            <div className="skeleton" style={{ height: 260 }} />
          ) : menuStatusData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>you do not have Access to this data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={menuStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {menuStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Second row: Stock health gauge + Ingredient category treemap */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 18,
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Gauge size={16} color="var(--text-muted)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Stock Health</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0, marginBottom: 8 }}>
            Share of ingredients that aren't running low
          </p>

          {loading ? (
            <div className="skeleton" style={{ height: 220 }} />
          ) : ingredients.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>you do not have Access to this data.</p>
          ) : (
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
                <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{stockHealthPercent}%</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  {stats.lowStock} of {ingredients.length} items low
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Boxes size={16} color="var(--text-muted)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Stock by Category</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0, marginBottom: 20 }}>
            Categories ranked by total stock volume
          </p>

          {loading ? (
            <div className="skeleton" style={{ height: 260 }} />
          ) : categoryFunnelData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>you do not have Access to this data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                  }}
                />
                <Funnel data={categoryFunnelData} dataKey="value" nameKey="name" isAnimationActive>
                  {categoryFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList position="right" dataKey="name" fill="var(--text, #1e293b)" fontSize={10} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconVariant,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconVariant: 'success' | 'warning' | 'danger' | 'info';
  label: string;
  value: number;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon--${iconVariant}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
