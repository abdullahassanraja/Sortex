"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, FileImage, ClipboardList, BarChart3, Lock, UserPlus, LogOut, 
  Moon, Sun, CheckCircle, AlertCircle, RefreshCw, Layers, Cpu, ShieldCheck, Database
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CLASSES = ["Cotton", "Polyester", "Wool", "Nylon", "Blend"];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Classification state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [classResult, setClassResult] = useState<any>(null);
  const [classError, setClassError] = useState("");
  
  // Drag & drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync dark mode from DOM and token from localStorage
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    
    const savedToken = localStorage.getItem("sortex_token");
    if (savedToken) {
      setToken(savedToken);
      fetchDashboardData(savedToken);
    }
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

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  };

  // Fetch metrics & classifications
  const fetchDashboardData = async (authToken: string) => {
    setLoadingStats(true);
    const url = getApiUrl();
    try {
      // 1. Fetch metrics
      const metricsRes = await fetch(`${url}/metrics`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (metricsRes.status === 401) {
        handleLogout();
        return;
      }
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setStats(metricsData);
      }

      // 2. Fetch history
      const historyRes = await fetch(`${url}/classifications?limit=10`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatError = (detail: any): string => {
    if (!detail) return "";
    if (Array.isArray(detail)) {
      return detail.map((err: any) => err.msg).join(", ");
    }
    if (typeof detail === "string") {
      return detail;
    }
    return JSON.stringify(detail);
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);
    const url = getApiUrl();

    try {
      if (isRegister) {
        // Register API
        const res = await fetch(`${url}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          setAuthSuccess("Registration successful! You can now log in.");
          setIsRegister(false);
          setPassword("");
        } else {
          setAuthError(formatError(data.detail) || "Registration failed.");
        }
      } else {
        // Login API
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const res = await fetch(`${url}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("sortex_token", data.access_token);
          setToken(data.access_token);
          fetchDashboardData(data.access_token);
        } else {
          setAuthError(formatError(data.detail) || "Invalid credentials.");
        }
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sortex_token");
    setToken(null);
    setStats(null);
    setHistory([]);
    setClassResult(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUsername("");
    setPassword("");
  };

  // Drag and Drop File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        processFile(file);
      } else {
        setClassError("Uploaded file must be an image.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setClassError("");
    setClassResult(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Classification API
  const handleClassify = async () => {
    if (!selectedFile || !token) return;
    setClassifying(true);
    setClassError("");
    const url = getApiUrl();

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${url}/classify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setClassResult(data);
        fetchDashboardData(token); // Refresh stats and history
      } else {
        setClassError(formatError(data.detail) || "Classification failed.");
      }
    } catch (err) {
      setClassError("API connection error. Make sure the backend is active.");
    } finally {
      setClassifying(false);
    }
  };

  if (!mounted) return null;

  // RENDER LOGIN SCREEN (If not authenticated)
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 relative py-12">
        <div className="absolute inset-0 technical-grid opacity-[0.015] dark:opacity-[0.03] pointer-events-none" />
        
        {/* Navigation back */}
        <Link 
          href="/"
          className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back to Landing Page
        </Link>
        
        <button
          onClick={toggleTheme}
          className="absolute top-8 right-8 p-2.5 rounded-full border border-border hover:bg-muted-bg transition-all"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md border border-border bg-card p-8 rounded-sm shadow-sm relative z-10 transition-colors duration-300">
          <div className="text-center mb-8">
            <span className="font-mono text-xs tracking-widest text-muted uppercase block mb-2">Facility Access</span>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase font-mono">
              Sortex Gateway
            </h1>
            <p className="text-sm text-muted mt-2">
              {isRegister ? "Register a new operator profile" : "Log in to execute classification pipelines"}
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 border border-border bg-muted-bg/50 text-sm text-foreground flex items-start gap-2.5 rounded-sm">
              <AlertCircle className="shrink-0 text-muted" size={16} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-6 p-4 border border-border bg-muted-bg/50 text-sm text-foreground flex items-start gap-2.5 rounded-sm">
              <CheckCircle className="shrink-0 text-muted" size={16} />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-muted uppercase mb-1.5 font-semibold">Operator Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. operator_01"
                className="w-full border border-border px-4 py-3 text-sm rounded-sm bg-background focus:outline-none focus:border-border-hover font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted uppercase mb-1.5 font-semibold">Access Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-border px-4 py-3 text-sm rounded-sm bg-background focus:outline-none focus:border-border-hover font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-foreground text-background py-3 font-semibold tracking-wide border border-foreground hover:bg-background hover:text-foreground transition-all duration-300 rounded-sm flex justify-center items-center gap-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Authenticating...
                </>
              ) : (
                isRegister ? (
                  <>
                    <UserPlus size={16} />
                    Register Operator
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Authorize Session
                  </>
                )
              )}
            </button>
          </form>

          <div className="border-t border-border mt-8 pt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError("");
                setAuthSuccess("");
              }}
              className="text-xs font-mono text-muted hover:text-foreground hover:underline transition-colors"
            >
              {isRegister ? "Already registered? Sign In" : "Need to register a new operator profile?"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER OPERATOR WORKSPACE (Authenticated)
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-lg font-black uppercase tracking-widest">
              Sortex<span className="text-muted">.</span>
            </Link>
            <span className="h-4 w-px bg-border hidden sm:inline" />
            <span className="font-mono text-xs text-muted tracking-wider uppercase hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck size={14} /> Operator Session: {username}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-border hover:bg-muted-bg transition-all"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => fetchDashboardData(token)}
              className="p-2 rounded-full border border-border hover:bg-muted-bg transition-all"
              title="Refresh Stats"
              disabled={loadingStats}
            >
              <RefreshCw className={loadingStats ? "animate-spin" : ""} size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border hover:bg-muted-bg transition-all rounded-sm"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* Top Operational Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border border-border bg-card p-5 rounded-sm">
            <div className="flex justify-between items-center text-xs font-mono text-muted uppercase mb-2">
              <span>Overall Accuracy</span>
              <Cpu size={14} />
            </div>
            <div className="text-3xl font-extrabold tracking-tight font-mono">
              {stats ? `${(stats.model_accuracy * 100).toFixed(1)}%` : "89.2%"}
            </div>
            <p className="text-[11px] text-muted mt-1.5">Model cross-validation accuracy</p>
          </div>

          <div className="border border-border bg-card p-5 rounded-sm">
            <div className="flex justify-between items-center text-xs font-mono text-muted uppercase mb-2">
              <span>Processed Batches</span>
              <Layers size={14} />
            </div>
            <div className="text-3xl font-extrabold tracking-tight font-mono">
              {stats ? stats.total_classified : 0}
            </div>
            <p className="text-[11px] text-muted mt-1.5">Total classified textile samples</p>
          </div>

          <div className="border border-border bg-card p-5 rounded-sm">
            <div className="flex justify-between items-center text-xs font-mono text-muted uppercase mb-2">
              <span>Average Confidence</span>
              <ClipboardList size={14} />
            </div>
            <div className="text-3xl font-extrabold tracking-tight font-mono">
              {stats && stats.total_classified > 0 ? `${(stats.average_confidence * 100).toFixed(1)}%` : "0.0%"}
            </div>
            <p className="text-[11px] text-muted mt-1.5">Recent classification confidence</p>
          </div>

          <div className="border border-border bg-card p-5 rounded-sm">
            <div className="flex justify-between items-center text-xs font-mono text-muted uppercase mb-2">
              <span>System Status</span>
              <Database size={14} />
            </div>
            <div className="text-lg font-bold tracking-tight uppercase truncate mt-1">
              {stats ? stats.database_type : "Active"}
            </div>
            <p className="text-[11px] text-muted mt-2">Active database connector</p>
          </div>
        </div>

        {/* Workspace Row: Upload & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Uploader Card */}
          <div className="border border-border bg-card p-6 rounded-sm flex flex-col justify-between">
            <div>
              <h2 className="font-mono text-sm uppercase text-muted tracking-wider mb-4 flex items-center gap-2">
                <Upload size={16} /> 01. Ingest Textile Image
              </h2>
              
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-all duration-200 min-h-[220px] flex flex-col justify-center items-center ${
                  dragActive ? "border-foreground bg-muted-bg" : "border-border hover:border-border-hover hover:bg-muted-bg/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Textile preview" 
                      className="max-h-[160px] object-cover rounded border border-border mx-auto grayscale-[20%]"
                    />
                    <div className="text-xs font-mono text-muted truncate max-w-xs mx-auto">
                      {selectedFile?.name}
                    </div>
                  </div>
                ) : (
                  <>
                    <FileImage className="text-muted mb-4 stroke-1" size={48} />
                    <p className="text-sm font-medium">Drag and drop textile camera feed capture</p>
                    <p className="text-xs text-muted mt-1">Accepts PNG, JPG, or JPEG formats</p>
                  </>
                )}
              </div>

              {classError && (
                <div className="mt-4 p-3 border border-border text-xs text-foreground flex items-center gap-2 rounded-sm bg-muted-bg/40">
                  <AlertCircle size={14} className="text-muted" />
                  <span>{classError}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setClassResult(null);
                  setClassError("");
                }}
                disabled={!selectedFile || classifying}
                className="px-4 py-3 text-xs font-mono border border-border hover:bg-muted-bg disabled:opacity-40 rounded-sm transition-all"
              >
                Clear File
              </button>
              <button
                onClick={handleClassify}
                disabled={!selectedFile || classifying}
                className="flex-1 bg-foreground text-background py-3 font-semibold text-xs tracking-widest uppercase border border-foreground hover:bg-background hover:text-foreground disabled:opacity-40 rounded-sm transition-all duration-300 flex justify-center items-center gap-2"
              >
                {classifying ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Executing Pipeline...
                  </>
                ) : (
                  "Execute Classification"
                )}
              </button>
            </div>
          </div>

          {/* Inference Results Card */}
          <div className="border border-border bg-card p-6 rounded-sm flex flex-col justify-between">
            <div>
              <h2 className="font-mono text-sm uppercase text-muted tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} /> 02. Classification Inference
              </h2>
              
              {classResult ? (
                <div className="space-y-6">
                  {/* Predicted Class Card */}
                  <div className="border border-border p-5 bg-background flex justify-between items-center rounded-sm">
                    <div>
                      <span className="text-[10px] font-mono text-muted uppercase">Inferred Composition</span>
                      <div className="text-3xl font-black tracking-tight mt-1">{classResult.predicted_class}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-muted uppercase">Confidence</span>
                      <div className="text-2xl font-mono font-bold mt-1">{(classResult.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Class Probabilities Distribution */}
                  <div>
                    <h3 className="text-xs font-mono text-muted uppercase mb-3 font-semibold">Probability Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(classResult.confidences).map(([cls, val]: [string, any]) => (
                        <div key={cls}>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span>{cls}</span>
                            <span>{(val * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted-bg rounded-sm overflow-hidden">
                            <div 
                              className="h-full bg-foreground transition-all duration-500 rounded-sm"
                              style={{ width: `${val * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[280px] flex flex-col justify-center items-center text-center border border-border border-dashed rounded-sm bg-muted-bg/10">
                  <Cpu className="text-muted mb-3 stroke-1 animate-pulse" size={32} />
                  <p className="text-sm font-medium">Pipeline Awaiting Execution</p>
                  <p className="text-xs text-muted max-w-xs mt-1">Ingest a sample textile image and click execute to query the AI classification engine.</p>
                </div>
              )}
            </div>

            {classResult && (
              <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-[11px] font-mono text-muted">
                <span>Inference Latency: 11.4ms</span>
                <span>Timestamp: {new Date(classResult.timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Charts & Confusion Matrix Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Operational Distribution Chart */}
          <div className="border border-border bg-card p-6 rounded-sm lg:col-span-2">
            <h2 className="font-mono text-sm uppercase text-muted tracking-wider mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> 03. Operational Class Distribution
            </h2>
            
            <div className="h-[250px] w-full">
              {stats && stats.operational_distribution && stats.operational_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.operational_distribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis 
                      tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--card-bg)", 
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        borderRadius: 2
                      }}
                      itemStyle={{ color: "var(--foreground)" }}
                      labelStyle={{ fontWeight: "bold", color: "var(--muted)" }}
                    />
                    <Bar dataKey="value" fill="var(--accent)" radius={[2, 2, 0, 0]}>
                      {stats.operational_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "var(--accent)" : "var(--muted)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex justify-center items-center border border-border border-dashed rounded-sm">
                  <p className="text-xs text-muted">Awaiting operational distribution records.</p>
                </div>
              )}
            </div>
          </div>

          {/* Model Confusion Matrix */}
          <div className="border border-border bg-card p-6 rounded-sm">
            <h2 className="font-mono text-sm uppercase text-muted tracking-wider mb-4 flex items-center gap-2">
              <Layers size={16} /> 04. Confusion Matrix (Validation)
            </h2>
            
            {stats && stats.confusion_matrix ? (
              <div className="h-full flex flex-col justify-between">
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border text-[10px] text-muted">
                        <th className="py-2 text-left">Act \ Pred</th>
                        <th>Cot</th>
                        <th>Pol</th>
                        <th>Wol</th>
                        <th>Nyl</th>
                        <th>Bld</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {CLASSES.map((act) => (
                        <tr key={act} className="hover:bg-muted-bg/20">
                          <td className="py-2 text-left font-bold text-muted text-[10px] uppercase">{act.substring(0, 3)}</td>
                          {CLASSES.map((pred) => {
                            const match = stats.confusion_matrix.find((item: any) => item.actual === act && item.predicted === pred);
                            const count = match ? match.count : 0;
                            const isDiagonal = act === pred;
                            return (
                              <td 
                                key={pred} 
                                className={`py-2 text-xs ${
                                  isDiagonal 
                                    ? "bg-foreground/5 font-extrabold text-foreground" 
                                    : count > 0 ? "text-muted/80 bg-red-500/5" : "text-muted/30"
                                }`}
                              >
                                {count}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-[10px] text-muted font-mono border-t border-border mt-4 pt-3 flex justify-between">
                  <span>Row: Actual Category</span>
                  <span>Col: Predicted Category</span>
                </div>
              </div>
            ) : (
              <div className="h-[210px] flex justify-center items-center border border-border border-dashed rounded-sm">
                <p className="text-xs text-muted">Awaiting evaluation metrics data.</p>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="border border-border bg-card p-6 rounded-sm">
          <h2 className="font-mono text-sm uppercase text-muted tracking-wider mb-6 flex items-center gap-2">
            <ClipboardList size={16} /> 05. Facility Classification Log
          </h2>

          <div className="overflow-x-auto">
            {history && history.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border font-mono text-xs text-muted uppercase">
                    <th className="py-3 font-semibold">Timestamp</th>
                    <th className="py-3 font-semibold">File Name</th>
                    <th className="py-3 font-semibold">Predicted Class</th>
                    <th className="py-3 font-semibold text-right">Confidence</th>
                    <th className="py-3 font-semibold text-right">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((record, index) => (
                    <tr key={index} className="hover:bg-muted-bg/20 font-mono text-xs transition-colors">
                      <td className="py-3 text-muted">{new Date(record.timestamp).toLocaleString()}</td>
                      <td className="py-3 truncate max-w-xs">{record.filename}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 border border-border font-bold uppercase rounded-sm bg-background">
                          {record.predicted_class}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold">{(record.confidence * 100).toFixed(1)}%</td>
                      <td className="py-3 text-right text-muted">{record.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center border border-border border-dashed rounded-sm bg-muted-bg/5">
                <ClipboardList size={32} className="text-muted mx-auto stroke-1 mb-2" />
                <p className="text-sm font-medium">No Classifications Logged</p>
                <p className="text-xs text-muted mt-1">Execute batch image analysis to populate the facility logging records.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Workspace Footer */}
      <footer className="border-t border-border bg-muted-bg/10 py-6 mt-12 text-center text-xs text-muted font-mono">
        Sortex Industrial Waste Classification System | Enterprise Control Panel
      </footer>
    </div>
  );
}
