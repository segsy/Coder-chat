'use client';

import { FormEvent, useState } from 'react';

type SubmitStatus = 'idle' | 'saving' | 'success' | 'error';

const reasonOptions = [
  'Too expensive',
  'Missing features',
  'Found an alternative',
  'Not using it enough',
  'Other'
];

export function UnsubscribeSurvey() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState(reasonOptions[0]);
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason, details })
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Unable to submit your request right now.');
        return;
      }

      setStatus('success');
      setMessage('You have been unsubscribed. Thank you for sharing your feedback.');
      setEmail('');
      setDetails('');
      setReason(reasonOptions[0]);
    } catch {
      setStatus('error');
      setMessage('Something went wrong while submitting your request.');
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold leading-snug text-zinc-100 md:text-3xl">
          We regret to let you go,we&apos;ll be happy to see how we can improve to serve you better
        </h2>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="unsubscribe-email">
              Email
            </label>
            <input
              id="unsubscribe-email"
              className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-zinc-100 outline-none ring-blue-500 focus:ring"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="unsubscribe-reason">
              Primary reason
            </label>
            <select
              id="unsubscribe-reason"
              className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-zinc-100 outline-none ring-blue-500 focus:ring"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              {reasonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="unsubscribe-details">
              Additional feedback
            </label>
            <textarea
              id="unsubscribe-details"
              className="min-h-28 w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-zinc-100 outline-none ring-blue-500 focus:ring"
              placeholder="Tell us what we could do better..."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={status === 'saving'}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'saving' ? 'Submitting...' : 'Submit Survey'}
            </button>

            <button
              type="submit"
              disabled={status === 'saving'}
              className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Unsubscribe
            </button>
          </div>

          {message ? (
            <p className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{message}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
