"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { REPORT_TYPES, type ReportType } from "@/config/constants";
import { SUPPORTED_LANGUAGES } from "@/validators/report";
import type { MedicalReport } from "@/types/report";
import { 
  LogOut, UploadCloud, Search, Trash2, AlertTriangle, 
  ShieldCheck, Activity, Stethoscope, FileSearch, Loader2, ChevronDown, UserCircle,
  Volume2, VolumeX, Printer, Globe
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type User = { name: string; email: string };

function parseAiResponse(text: string) {
  const sections = {
    explanation: "",
    findings: "",
    cautions: "",
    consult: "",
    disclaimer: ""
  };
  
  // Try to parse it as JSON first (new format)
  try {
    const parsed = JSON.parse(text);
    if (parsed.explanation || parsed.findings) {
      return {
        explanation: parsed.explanation || "",
        findings: parsed.findings || "",
        cautions: parsed.cautions || "",
        consult: parsed.consult || "",
        disclaimer: parsed.disclaimer || ""
      };
    }
  } catch {
    // Ignore error, fall back to regex text parsing (old format)
  }
  
  const parts = text.split(/(?=\d\)\s*(?:Simple Explanation|Key Findings|Possible Cautions|When to Consult a Doctor|Disclaimer))/i);
  
  parts.forEach(part => {
    if (part.match(/1\)\s*Simple Explanation/i)) sections.explanation = part.replace(/1\)\s*Simple Explanation/i, '').trim();
    else if (part.match(/2\)\s*Key Findings/i)) sections.findings = part.replace(/2\)\s*Key Findings/i, '').trim();
    else if (part.match(/3\)\s*Possible Cautions/i)) sections.cautions = part.replace(/3\)\s*Possible Cautions/i, '').trim();
    else if (part.match(/4\)\s*When to Consult a Doctor/i)) sections.consult = part.replace(/4\)\s*When to Consult a Doctor/i, '').trim();
    else if (part.match(/5\)\s*Disclaimer/i)) sections.disclaimer = part.replace(/5\)\s*Disclaimer/i, '').trim();
  });

  return sections;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState<ReportType>("medicine");
  const [language, setLanguage] = useState<string>("English");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleReports = useMemo(
    () =>
      reports.filter((r) =>
        search
          ? `${r.aiResponse} ${r.reportType} ${r.language || ''}`.toLowerCase().includes(search.toLowerCase())
          : true,
      ),
    [reports, search],
  );

  const fetchData = async () => {
    try {
      const [meRes, reportRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/reports")]);
      if (meRes.ok) {
        const meBody = await meRes.json();
        setUser(meBody.user);
      } else {
        window.location.href = "/login";
      }
      if (reportRes.ok) {
        const body = await reportRes.json();
        setReports(body.reports);
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Text to Speech Functionality
  const toggleSpeech = (text: string, reportId: string, lang: string) => {
    if (!window.speechSynthesis) {
      toast.error("Text-to-speech is not supported in your browser.");
      return;
    }

    if (speakingId === reportId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to set appropriate language code
    if (lang === "Hindi") utterance.lang = "hi-IN";
    else if (lang === "Spanish") utterance.lang = "es-ES";
    else if (lang === "French") utterance.lang = "fr-FR";
    else utterance.lang = "en-US";
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    
    setSpeakingId(reportId);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech when navigating away
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handlePrint = () => {
    // In a real app we'd open a print-only window or use CSS print media queries
    // For now we'll trigger print natively (CSS hides the rest)
    window.print();
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file); // fallback
              resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
            },
            "image/jpeg",
            0.7
          );
        };
      };
      reader.onerror = () => resolve(file); // fallback
    });
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Cloud upload failed");
    const body = await res.json();
    return body.secure_url as string;
  };

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be less than 15MB");
      return;
    }
    
    setLoading(true);
    try {
      const compressedFile = await compressImage(file);
      const imageUrl = await uploadToCloudinary(compressedFile);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, reportType, language }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Analysis failed");
      toast.success("Analysis complete!");
      setReports((prev) => [body.report, ...prev]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success("Report deleted");
    } else toast.error("Failed to delete report");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden print:bg-white print:p-0">
      {/* Background decorations - hidden on print */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-sky-200/20 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2 print:hidden"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3 print:hidden"></div>

      {/* Top Navbar - hidden on print */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 px-6 py-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            MedExplain <span className="text-sky-600">AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200">
              <UserCircle className="w-4 h-4" />
              {user?.name}
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 print:p-0">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Upload Section - hidden on print */}
          <div className="lg:col-span-1 space-y-6 print:hidden">
            <div className="glass rounded-[2rem] p-8 border border-white/60">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">New Analysis</h2>
              <p className="text-slate-600 text-sm mb-6">Upload a clear photo of your medical document for an instant, multilingual AI breakdown.</p>
              
              <div className="space-y-4">
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 pl-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    disabled={loading}
                  >
                    {REPORT_TYPES.map((type) => (
                      <option key={type} value={type} className="capitalize">
                        {type.replace("_", " ")} Analysis
                      </option>
                    ))}
                  </select>
                  <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600 pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 pl-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={loading}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>

                <div 
                  className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all ${
                    loading 
                      ? "border-sky-300 bg-sky-50" 
                      : "border-slate-300 bg-white/50 hover:border-sky-400 hover:bg-sky-50 cursor-pointer"
                  }`}
                  onClick={() => !loading && fileInputRef.current?.click()}
                >
                  {loading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
                      <p className="font-semibold text-sky-700">Analyzing Document...</p>
                      <p className="text-xs text-sky-600/80 mt-1">Generating in {language}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6 text-sky-600" />
                      </div>
                      <p className="font-semibold text-slate-700">Click to upload image</p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 15MB</p>
                    </>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    onChange={onUpload} 
                    disabled={loading} 
                  />
                </div>
              </div>
            </div>
            
            <div className="glass rounded-[2rem] p-6 border border-white/60 bg-gradient-to-br from-indigo-50/80 to-sky-50/80">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Privacy Notice</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your medical documents are processed securely. Please cover any personal identifying information (PII) before uploading for maximum privacy.
              </p>
            </div>
          </div>

          {/* History Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <h2 className="text-2xl font-bold text-slate-900">Analysis History</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-full border border-slate-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="Search past reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading && (
              <div className="glass rounded-[2rem] p-6 border border-white/60 animate-pulse print:hidden">
                <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            )}

            {visibleReports.length === 0 && !loading ? (
              <div className="glass rounded-[2rem] p-12 text-center border border-white/60 flex flex-col items-center print:hidden">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileSearch className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No reports yet</h3>
                <p className="text-slate-500 max-w-sm">
                  Upload your first medical document using the panel on the left to see the AI analysis here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {visibleReports.map((report) => {
                  const parsed = parseAiResponse(report.aiResponse);
                  const fullTextToRead = parsed.explanation 
                    ? [parsed.explanation, parsed.findings, parsed.cautions, parsed.consult].filter(Boolean).join('. ')
                    : report.aiResponse;
                  return (
                    <article key={report._id} className="glass rounded-[2rem] overflow-hidden border border-white/60 group print:border-none print:shadow-none print:break-inside-avoid">
                      
                      {/* Card Header */}
                      <div className="border-b border-slate-100 bg-white/40 p-6 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl print:hidden ${
                            report.reportType === 'medicine' ? 'bg-sky-100 text-sky-600' :
                            report.reportType === 'prescription' ? 'bg-indigo-100 text-indigo-600' :
                            'bg-teal-100 text-teal-600'
                          }`}>
                            {report.reportType === 'medicine' ? <Activity className="w-5 h-5" /> :
                             report.reportType === 'prescription' ? <Stethoscope className="w-5 h-5" /> :
                             <FileSearch className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 capitalize text-lg flex items-center gap-2">
                              {report.reportType.replace("_", " ")} Analysis
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {new Date(report.createdAt).toLocaleDateString()} • {report.language || 'English'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                          {fullTextToRead && (
                            <button 
                              onClick={() => toggleSpeech(fullTextToRead, report._id, report.language || 'English')} 
                              className={`p-2 rounded-lg transition-colors ${speakingId === report._id ? 'bg-sky-100 text-sky-600' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'}`}
                              title={speakingId === report._id ? "Stop reading" : "Read aloud"}
                            >
                              {speakingId === report._id ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                          )}
                          <button 
                            onClick={() => handlePrint()} 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Print Summary"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onDelete(report._id)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-6">
                        {report.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 print:hidden w-full sm:w-64">
                            <Image 
                              src={report.imageUrl} 
                              alt="Uploaded medical document" 
                              width={800}
                              height={600}
                              className="w-full h-auto object-cover max-h-48"
                            />
                          </div>
                        )}

                        {report.urgencyFlag && (
                          <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-800 animate-pulse print:animate-none">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-sm">URGENT MEDICAL NOTICE</p>
                              <p className="text-sm mt-1">The AI detected concerning values or terminology. Please consult a healthcare professional as soon as possible.</p>
                            </div>
                          </div>
                        )}

                        {parsed.explanation ? (
                          <>
                            {parsed.explanation && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold print:hidden">1</div>
                                  Explanation
                                </h4>
                                <div className="text-slate-600 text-sm leading-relaxed bg-white/50 print:bg-transparent p-4 print:p-0 rounded-xl border border-slate-100 print:border-none prose prose-slate prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.explanation}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                            
                            {parsed.findings && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold print:hidden">2</div>
                                  Key Findings
                                </h4>
                                <div className="text-slate-600 text-sm leading-relaxed bg-white/50 print:bg-transparent p-4 print:p-0 rounded-xl border border-slate-100 print:border-none prose prose-slate prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.findings}</ReactMarkdown>
                                </div>
                              </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4 print:block print:space-y-4">
                              {parsed.cautions && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold print:hidden">3</div>
                                    Cautions
                                  </h4>
                                  <div className="text-slate-600 text-sm leading-relaxed bg-amber-50/50 print:bg-transparent p-4 print:p-0 rounded-xl border border-amber-100/50 print:border-none prose prose-slate prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.cautions}</ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              {parsed.consult && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold print:hidden">4</div>
                                    Consult a Doctor
                                  </h4>
                                  <div className="text-slate-600 text-sm leading-relaxed bg-teal-50/50 print:bg-transparent p-4 print:p-0 rounded-xl border border-teal-100/50 print:border-none prose prose-slate prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.consult}</ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-slate-900">Analysis Summary</h4>
                            <div className="text-slate-600 text-sm leading-relaxed bg-white/50 print:bg-transparent p-4 print:p-0 rounded-xl border border-slate-100 print:border-none prose prose-slate prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.aiResponse}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 print:border-slate-300">
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 print:hidden" />
                            {parsed.disclaimer || "Disclaimer: This is an AI-generated educational explanation. It is not medical advice, diagnosis, or a treatment plan. Always consult a qualified doctor before making any healthcare decisions."}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
