'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

type Message = { role: 'user' | 'assistant'; content: string };

export function WorkspaceShell({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('Build a modern SaaS landing page with pricing section.');
  const [selectedElement, setSelectedElement] = useState('hero-title');
  const [inlineEdit, setInlineEdit] = useState('Build AI Websites in Minutes');

  const generateSite = async () => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, message: prompt, messages })
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'user', content: prompt }, { role: 'assistant', content: data.reply }]);
  };

  const saveInlineEdit = async () => {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        selectedElement,
        inlineEdit
      })
    });
  };

  return (
    <div className="grid min-h-screen grid-cols-12 gap-4 p-4">
      <aside className="col-span-3 rounded-xl border p-4">
        <h2 className="font-semibold">Projects</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• {projectId}</li>
          <li>• demo-ecommerce</li>
          <li>• demo-agency</li>
        </ul>
      </aside>

      <section className="col-span-5 rounded-xl border p-4">
        <h2 className="font-semibold">Playground Chat</h2>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-3" />
        <Button className="mt-3" onClick={generateSite}>Generate Website</Button>
        <div className="mt-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className="rounded-md border p-2 text-sm">
              <strong>{msg.role}:</strong> {msg.content}
            </div>
          ))}
        </div>
      </section>

      <section className="col-span-4 rounded-xl border p-4">
        <h2 className="font-semibold">Webpage Tools</h2>
        <Input className="mt-3" value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)} />
        <Textarea className="mt-3" value={inlineEdit} onChange={(e) => setInlineEdit(e.target.value)} />
        <Button className="mt-3" variant="secondary" onClick={saveInlineEdit}>Save Element Settings</Button>
        <iframe className="mt-4 h-96 w-full rounded-md border" src={`/api/iframe/${projectId}`} title="Generated site" />
      </section>
    </div>
  );
}
