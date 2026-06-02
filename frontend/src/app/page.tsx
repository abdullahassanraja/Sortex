"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, BarChart3, ShieldAlert, Cpu, Sparkles, Moon, Sun, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Read theme from document element (set by inline script)
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const textileTypes = [
    { name: "Cotton", impact: "High water usage & pesticide intensity during cultivation", recyclability: "High (mechanical & chemical shredding)" },
    { name: "Polyester", impact: "Non-biodegradable synthetic, shedding microplastics globally", recyclability: "Moderate (thermal reprocessing)" },
    { name: "Wool", impact: "High methane output from livestock and chemical washing", recyclability: "High (carding and re-spinning)" },
    { name: "Nylon", impact: "Petrochemical derivative, releasing nitrous oxide during production", recyclability: "Moderate (depolymerization)" },
    { name: "Blends", impact: "Extremely difficult to separate, major component of landfills", recyclability: "Low (emerging chemical separations)" },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-foreground selection:text-background font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-black tracking-widest uppercase">
              Sortex<span className="text-muted">.</span>
            </span>
            <span className="text-xs px-2 py-0.5 border border-border font-mono rounded">v1.0.0</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#problem" className="hover:text-muted transition-colors">The Challenge</a>
            <a href="#solution" className="hover:text-muted transition-colors">AI Engine</a>
            <a href="#materials" className="hover:text-muted transition-colors">Materials</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-border hover:bg-muted-bg hover:border-border-hover transition-all"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all duration-300 rounded-sm"
            >
              Operator Portal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden border-b border-border">
        {/* Subtle grid background */}
        <div className="absolute inset-0 technical-grid opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-border rounded-full font-mono text-xs tracking-wider uppercase mb-8 bg-muted-bg">
              <Sparkles size={12} /> Industrial Textile Sorting Engine
            </div>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-none mb-8 uppercase">
              Re-engineering <br />
              <span className="text-muted">Textile Waste</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted font-light leading-relaxed max-w-2xl mb-12">
              Automated computer vision pipelines for sorting facility operators. Instantly classify fabric blends to redirect tons of textile waste away from landfills.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold tracking-wide bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground transition-all duration-300 rounded-sm"
              >
                Launch Classification Dashboard
              </Link>
              <a
                href="#problem"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold tracking-wide border border-border hover:bg-muted-bg hover:border-border-hover transition-all duration-300 rounded-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Row */}
      <section className="border-b border-border bg-muted-bg/30">
        <div className="max-w-7xl mx-auto divide-y md:divide-y-0 md:divide-x divide-border grid grid-cols-1 md:grid-cols-3">
          <div className="p-8 md:p-12">
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4">The Waste Problem</div>
            <div className="text-4xl md:text-5xl font-black tracking-tight mb-2">92M Tons</div>
            <p className="text-sm text-muted">Of textiles are landfilled annually worldwide, representing a full garbage truck burned or dumped every single second.</p>
          </div>
          <div className="p-8 md:p-12">
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4">Model Performance</div>
            <div className="text-4xl md:text-5xl font-black tracking-tight mb-2">89.2%</div>
            <p className="text-sm text-muted">Cross-validated classification accuracy achieved by our lightweight Random Forest texture and RGB analysis engine.</p>
          </div>
          <div className="p-8 md:p-12">
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4">Inference Latency</div>
            <div className="text-4xl md:text-5xl font-black tracking-tight mb-2">&lt; 12ms</div>
            <p className="text-sm text-muted">Real-time classification dispatch, allowing immediate categorization on conveyer sorting lines.</p>
          </div>
        </div>
      </section>

      {/* The Challenge section */}
      <section id="problem" className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4">Environmental Crisis</div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase mb-8">
                The Cost of Unsorted Blends
              </h2>
              <div className="space-y-6 text-muted font-light leading-relaxed">
                <p>
                  Today, less than **1%** of all clothing material is recycled back into clothing. The primary bottleneck is classification. Without knowing the exact composition of a garment, recyclers cannot chemical or mechanical breakdown fabrics safely.
                </p>
                <p>
                  Sortex bridges this gap. By deploying high-speed computer vision directly on the loading dock and classification lines, operators can verify fabric types in real time.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border border-border rounded-sm bg-card glow-hover transition-all">
                <ShieldAlert className="mb-4 text-muted" size={24} />
                <h3 className="font-semibold text-lg mb-2">Landfill Saturation</h3>
                <p className="text-sm text-muted">Synthetic textiles like polyester can take up to 200 years to decompose in landfills.</p>
              </div>
              <div className="p-6 border border-border rounded-sm bg-card glow-hover transition-all">
                <Cpu className="mb-4 text-muted" size={24} />
                <h3 className="font-semibold text-lg mb-2">Automation Bottleneck</h3>
                <p className="text-sm text-muted">Manual sorting is slow, expensive, and highly prone to human classification error.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Model Documentation Section */}
      <section id="solution" className="py-24 border-b border-border bg-muted-bg/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4">Technical Specification</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase mb-6">
              AI Engine Accuracy & Metrics
            </h2>
            <p className="text-lg text-muted font-light">
              Our models undergo rigorous training and validation to guarantee reliability in industrial environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 border border-border rounded-sm bg-card text-center">
              <div className="text-xs font-mono text-muted uppercase mb-2">Accuracy</div>
              <div className="text-4xl font-extrabold mb-1">89.2%</div>
              <p className="text-xs text-muted">Overall Validation Accuracy</p>
            </div>
            <div className="p-6 border border-border rounded-sm bg-card text-center">
              <div className="text-xs font-mono text-muted uppercase mb-2">Precision</div>
              <div className="text-4xl font-extrabold mb-1">89.5%</div>
              <p className="text-xs text-muted">Weighted Precision Metric</p>
            </div>
            <div className="p-6 border border-border rounded-sm bg-card text-center">
              <div className="text-xs font-mono text-muted uppercase mb-2">Recall</div>
              <div className="text-4xl font-extrabold mb-1">89.2%</div>
              <p className="text-xs text-muted">Weighted Recall Metric</p>
            </div>
            <div className="p-6 border border-border rounded-sm bg-card text-center">
              <div className="text-xs font-mono text-muted uppercase mb-2">F1-Score</div>
              <div className="text-4xl font-extrabold mb-1">89.3%</div>
              <p className="text-xs text-muted">Weighted F1-Score Metric</p>
            </div>
          </div>

          <div className="border border-border p-6 md:p-8 rounded-sm bg-card max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg">Inference Preprocessing</h3>
                <p className="text-sm text-muted">Feature representation calculated on incoming image payloads</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-2.5 py-1 border border-border rounded font-mono">RGB Histograms</span>
                <span className="text-xs px-2.5 py-1 border border-border rounded font-mono">Grayscale Texture</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="font-mono">1. PIL Image Resizing</span>
                <span className="text-muted">32 x 32 pixel grid reduction</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="font-mono">2. RGB Statistical Extraction</span>
                <span className="text-muted">Mean & standard deviation of color channels</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="font-mono">3. Normalization</span>
                <span className="text-muted">Scaling values to range [0, 1]</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-mono">4. Random Forest Feedforward</span>
                <span className="text-muted">Softmax probability across 5 categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Material Index section */}
      <section id="materials" className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4">Material Profile</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
              Classification Scope & Impact
            </h2>
          </div>

          <div className="border border-border rounded-sm divide-y divide-border bg-card">
            {textileTypes.map((textile, index) => (
              <div key={index} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted-bg/25 transition-all">
                <div className="md:w-1/4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted">0{index + 1}.</span>
                    <span className="font-bold text-xl tracking-tight">{textile.name}</span>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <span className="text-xs font-mono text-muted block mb-1">Environmental Hazard</span>
                  <p className="text-sm">{textile.impact}</p>
                </div>
                <div className="md:w-1/4">
                  <span className="text-xs font-mono text-muted block mb-1">Recycling Potential</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{textile.recyclability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted-bg/20 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted">
          <div className="flex items-center gap-2 font-mono">
            <span>© 2026 Sortex Systems.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">API Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
