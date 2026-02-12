import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  if (!process.env.STRIPE_PRICE_ID || !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Missing Stripe environment variables.' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/demo?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`
  });

  return NextResponse.redirect(session.url || process.env.NEXT_PUBLIC_APP_URL);
}
