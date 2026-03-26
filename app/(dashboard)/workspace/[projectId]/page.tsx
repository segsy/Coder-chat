'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Layout, Menu, Type, Image, CreditCard, ShoppingCart, FileText, Send, Loader2, Download, Eye, Settings, ChevronLeft, Code, Save, Zap, X } from 'lucide-react';

// Component types for sidebar
interface ComponentBlock {
  id: string;
  name: string;
  icon: any;
  category: string;
}

const componentBlocks: ComponentBlock[] = [
  { id: 'hero', name: 'Hero Section', icon: Layout, category: 'Layout' },
  { id: 'navbar', name: 'Navigation', icon: Menu, category: 'Layout' },
  { id: 'features', name: 'Features', icon: Zap, category: 'Content' },
  { id: 'text', name: 'Text Block', icon: Type, category: 'Content' },
  { id: 'image', name: 'Image', icon: Image, category: 'Media' },
  { id: 'pricing', name: 'Pricing Table', icon: CreditCard, category: 'Commerce' },
  { id: 'product', name: 'Product Card', icon: ShoppingCart, category: 'Commerce' },
  { id: 'form', name: 'Contact Form', icon: FileText, category: 'Forms' },
  { id: 'footer', name: 'Footer', icon: Layout, category: 'Layout' },
];

export default function WorkspacePage({ params }: { params: { projectId: string } }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProperties, setShowProperties] = useState(false);
  const [projectName, setProjectName] = useState('New Project');

  // Demo generated code
  const demoCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
  <nav class="flex items-center justify-between px-8 py-4 bg-gray-800/50 backdrop-blur-lg border-b border-white/10">
    <div class="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Brand</div>
    <div class="flex gap-6">
      <a href="#" class="text-gray-300 hover:text-white transition">Features</a>
      <a href="#" class="text-gray-300 hover:text-white transition">Pricing</a>
      <a href="#" class="text-gray-300 hover:text-white transition">Contact</a>
    </div>
    <button class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition">Get Started</button>
  </nav>
  
  <section class="px-8 py-24 text-center">
    <h1 class="text-5xl font-bold mb-6">Build Amazing Websites with AI</h1>
    <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Describe your vision and let our AI create stunning websites in seconds.</p>
    <div class="flex gap-4 justify-center">
      <button class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-semibold transition">Start Free</button>
      <button class="border border-white/20 px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">View Demo</button>
    </div>
  </section>
  
  <section class="px-8 py-16 bg-gray-800/30">
    <div class="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div class="text-center p-6">
        <div class="text-3xl mb-4">⚡</div>
        <h3 class="text-xl font-semibold mb-2">Lightning Fast</h3>
        <p class="text-gray-400">Generate websites in seconds, not hours</p>
      </div>
      <div class="text-center p-6">
        <div class="text-3xl mb-4">🎨</div>
        <h3 class="text-xl font-semibold mb-2">Beautiful Design</h3>
        <p class="text-gray-400">AI-powered stunning visuals</p>
      </div>
      <div class="text-center p-6">
        <div class="text-3xl mb-4">🚀</div>
        <h3 class="text-xl font-semibold mb-2">Easy Export</h3>
        <p class="text-gray-400">Download clean, production-ready code</p>
      </div>
    </div>
  </section>
</body>
</html>
`;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedCode(demoCode);
      setIsGenerating(false);
    }, 2000);
  };

  const handleExportCode = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddComponent = (componentId: string) => {
    setPrompt(`Add a ${componentBlocks.find(c => c.id === componentId)?.name} to the page`);
    setSelectedComponent(componentId);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Topbar */}
      <header className="h-14 border-b border-white/10 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0"
            placeholder="Project name"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            Draft
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCode}
            disabled={!generatedCode}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25">
            <Zap className="h-4 w-4" />
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`${showSidebar ? 'w-64' : 'w-0'} border-r border-white/10 bg-background/50 transition-all overflow-hidden`}>
          <div className="w-64 h-full flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-sm font-semibold">Components</h2>
              <p className="text-xs text-muted-foreground mt-1">Click to add to your page</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {componentBlocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => handleAddComponent(block.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <block.icon className="h-5 w-5 text-purple-400" />
                  <span className="text-sm">{block.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 bg-[#0a0a0f] relative overflow-hidden">
            {generatedCode ? (
              <iframe
                srcDoc={generatedCode}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title="Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10">
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Start Generating</h2>
                  <p className="text-muted-foreground">
                    Describe the website you want to create, or click a component from the sidebar
                  </p>
                </div>
              </div>
            )}
            
            {/* Toggle Sidebar */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-background/80 hover:bg-background"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Prompt Input */}
          <div className="h-32 border-t border-white/10 bg-background/50 p-4">
            <div className="flex gap-4 h-full">
              <div className="flex-1 relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 blur" />
                <div className="relative rounded-xl border border-white/10 bg-[#0a0a0f] p-1 h-full flex items-center">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the website you want to create... (e.g., A modern landing page with hero, features, pricing, and contact form)"
                    className="w-full h-full bg-transparent px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        handleGenerate();
                      }
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 font-medium text-white disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press ⌘ + Enter to generate • Each generation uses 1 credit
            </p>
          </div>
        </main>

        {/* Properties Panel (when component selected) */}
        {selectedComponent && (
          <aside className="w-72 border-l border-white/10 bg-background/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Properties</h3>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Text Content</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  placeholder="Enter text..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Text Color</label>
                <input
                  type="color"
                  className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/5"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Background</label>
                <input
                  type="color"
                  className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/5"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Padding</label>
                <select className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <button className="w-full mt-4 rounded-lg bg-purple-600 py-2 text-sm font-medium hover:bg-purple-700">
                Apply Changes
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
