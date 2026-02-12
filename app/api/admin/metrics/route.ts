import { NextResponse } from 'next/server';

const monthlyRevenue = [42000, 44500, 47000, 49800, 53000, 56000, 59200, 61800, 64500, 67900, 71200, 74800];

export async function GET() {
  const mrr = monthlyRevenue[monthlyRevenue.length - 1];
  const lastMonthMrr = monthlyRevenue[monthlyRevenue.length - 2];
  const growthRate = Number((((mrr - lastMonthMrr) / lastMonthMrr) * 100).toFixed(2));

  const metrics = {
    mrr,
    customers: 1248,
    churnRate: 2.9,
    trialToPaid: 23.6,
    cac: 312,
    ltv: 8420,
    growthRate,
    monthlyRevenue,
    sales: [
      { id: 'INV-2201', account: 'Acme Labs', amount: 1499, status: 'paid' },
      { id: 'INV-2202', account: 'Northstar AI', amount: 999, status: 'paid' },
      { id: 'INV-2203', account: 'Vertex Commerce', amount: 2499, status: 'pending' },
      { id: 'INV-2204', account: 'Bluebird Health', amount: 799, status: 'paid' }
    ],
    registrations: [
      { month: 'Jan', users: 85 },
      { month: 'Feb', users: 94 },
      { month: 'Mar', users: 103 },
      { month: 'Apr', users: 126 },
      { month: 'May', users: 134 },
      { month: 'Jun', users: 141 }
    ]
  };

  return NextResponse.json(metrics);
}
