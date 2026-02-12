'use client';

import { ComponentType, FormEvent, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, TrendingUp, Users, DollarSign, UserPlus } from 'lucide-react';

type Metrics = {
  mrr: number;
  customers: number;
  churnRate: number;
  trialToPaid: number;
  cac: number;
  ltv: number;
  growthRate: number;
  monthlyRevenue: number[];
  sales: { id: string; account: string; amount: number; status: string }[];
  registrations: { month: string; users: number }[];
};

const initialMetrics: Metrics = {
  mrr: 0,
  customers: 0,
  churnRate: 0,
  trialToPaid: 0,
  cac: 0,
  ltv: 0,
  growthRate: 0,
  monthlyRevenue: [],
  sales: [],
  registrations: []
};

export default function AdminDashboardPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@bolt.new');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    if (!loggedIn) return;

    const load = async () => {
      const [metricsRes, adminsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/admin-users')
      ]);
      const metricsData = await metricsRes.json();
      const adminsData = await adminsRes.json();
      setMetrics(metricsData);
      setAdmins(adminsData.admins || []);
    };

    load();
  }, [loggedIn]);

  const login = (event: FormEvent) => {
    event.preventDefault();
    if (email.toLowerCase().includes('admin') && password.length >= 6) {
      setLoggedIn(true);
      setAuthError('');
      return;
    }
    setAuthError('Invalid admin credentials. Use an admin email and 6+ character password.');
  };

  const addAdmin = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/admin/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newAdminEmail })
    });
    const data = await response.json();
    if (!response.ok) {
      setAdminMessage(data.error || 'Unable to add admin.');
      return;
    }
    setAdmins(data.admins || []);
    setNewAdminEmail('');
    setAdminMessage('Admin user added successfully.');
  };

  const revenueSpark = useMemo(() => {
    if (!metrics.monthlyRevenue.length) return '0';
    const min = Math.min(...metrics.monthlyRevenue);
    const max = Math.max(...metrics.monthlyRevenue);
    return metrics.monthlyRevenue
      .map((value, i) => {
        const normalized = max === min ? 18 : 8 + ((value - min) / (max - min)) * 22;
        return `${i === 0 ? 'M' : ' L'}${i * 26},${36 - normalized}`;
      })
      .join('');
  }, [metrics.monthlyRevenue]);

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-[#070c16] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-zinc-900/80 p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-600/20 px-4 py-2 text-sm text-blue-300">
            <ShieldCheck className="size-4" /> Admin Auth
          </div>
          <h1 className="text-3xl font-bold">Admin login</h1>
          <p className="mt-2 text-zinc-400">Authenticate to access sales, user registrations, and growth metrics.</p>

          <form className="mt-6 space-y-4" onSubmit={login}>
            <input className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="admin@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium">Login as admin</button>
            {authError ? <p className="text-sm text-red-300">{authError}</p> : null}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070c16] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <div>
            <h1 className="text-3xl font-bold">Advanced Admin Dashboard</h1>
            <p className="text-zinc-400">System for measuring what matters: revenue, growth, customers, and efficiency.</p>
          </div>
          <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-emerald-300">Admin authenticated</div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Monthly Recurring Revenue (MRR)" value={`$${metrics.mrr.toLocaleString()}`} icon={DollarSign} />
          <MetricCard title="Number of customers" value={metrics.customers.toLocaleString()} icon={Users} />
          <MetricCard title="Churn rate" value={`${metrics.churnRate}%`} icon={TrendingUp} />
          <MetricCard title="Growth rate" value={`${metrics.growthRate}%`} icon={TrendingUp} />
          <MetricCard title="Trial-to-paid conversion" value={`${metrics.trialToPaid}%`} icon={TrendingUp} />
          <MetricCard title="Customer acquisition cost (CAC)" value={`$${metrics.cac}`} icon={DollarSign} />
          <MetricCard title="Lifetime value (LTV)" value={`$${metrics.ltv.toLocaleString()}`} icon={DollarSign} />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 xl:col-span-2">
            <h2 className="text-xl font-semibold">MRR trend</h2>
            <p className="text-sm text-zinc-400">Last 12 months recurring revenue performance.</p>
            <svg className="mt-4 h-36 w-full" viewBox="0 0 320 40" preserveAspectRatio="none">
              <path d={revenueSpark} stroke="#3b82f6" strokeWidth="2" fill="none" />
            </svg>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <h2 className="text-xl font-semibold">Add user to admin</h2>
            <form className="mt-4 space-y-3" onSubmit={addAdmin}>
              <input className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="new-admin@company.com" />
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium"><UserPlus className="size-4" /> Add admin</button>
            </form>
            {adminMessage ? <p className="mt-2 text-sm text-zinc-300">{adminMessage}</p> : null}
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {admins.map((admin) => (
                <li className="rounded-lg border border-white/10 px-3 py-2" key={admin}>{admin}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <h2 className="text-xl font-semibold">Sales</h2>
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-zinc-400"><tr><th className="py-2">Invoice</th><th>Account</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {metrics.sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-white/5">
                    <td className="py-2">{sale.id}</td><td>{sale.account}</td><td>${sale.amount}</td><td>{sale.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <h2 className="text-xl font-semibold">User registrations</h2>
            <div className="mt-4 space-y-3">
              {metrics.registrations.map((entry) => (
                <div key={entry.month}>
                  <div className="mb-1 flex justify-between text-sm"><span>{entry.month}</span><span>{entry.users}</span></div>
                  <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(100, (entry.users / 150) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
      <div className="mb-2 inline-flex rounded-lg bg-blue-500/20 p-2"><Icon className="size-4 text-blue-300" /></div>
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
