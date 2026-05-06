import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Stethoscope,
  FileSearch,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-100/80 to-transparent rounded-full blur-3xl -z-10 opacity-70"></div>

      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pt-24 pb-16">
        {/* Hero Section */}
        <section className="grid items-center gap-16 md:grid-cols-2">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm border border-sky-200/50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Healthcare Explanations, Easy & Simplified</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight md:text-6xl text-slate-900">
              Understand your health records super{" "}
              <span className="gradient-text">Easily.</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Upload medicine labels, prescriptions, or blood reports.
              MedExplain AI translates complex medical jargon into safe, clear,
              and easy-to-understand guidance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 py-4 font-semibold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95"
              >
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-8 py-4 font-semibold text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-300"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 pt-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Free to use
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Secure
                uploads
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Instant
                analysis
              </div>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-teal-400/20 blur-3xl rounded-[3rem] -z-10 transform rotate-12 scale-110"></div>
            <div className="glass rounded-[2rem] p-8 border border-white/60">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Safety First Architecture
                  </h3>
                  <p className="text-sm text-slate-500">
                    Live AI Constraint Engine
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    &quot;This platform provides educational explanations only
                    and strictly does not provide medical diagnosis or treatment
                    decisions.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700">
                    ✓
                  </span>{" "}
                  No self-medication advice
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700">
                    ✓
                  </span>{" "}
                  Doctor consultation encouraged
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-32" id="features">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Powerful Medical Intelligence
            </h2>
            <p className="text-slate-600 text-lg">
              MedExplain AI provides AI-generated medical explanations for
              educational purposes only; final diagnosis, treatment, and medical
              decisions should always come from a qualified doctor or healthcare
              professional.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Medicine Analyzer",
                desc: "Understand side effects, active ingredients, and common uses instantly.",
                icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
              },
              {
                title: "Prescription Explainer",
                desc: "Decode doctor handwriting and complex prescription protocols safely.",
                icon: <Stethoscope className="w-6 h-6 text-indigo-600" />,
              },
              {
                title: "Lab Report Simplifier",
                desc: "Get clear summaries of blood tests, radiology reports, and lab metrics.",
                icon: <FileSearch className="w-6 h-6 text-teal-600" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works Section */}
        <section className="mt-32" id="how-it-works">
          <div className="glass-dark rounded-[2.5rem] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 blur-[100px] rounded-full"></div>

            <h2 className="text-3xl font-bold text-white mb-12 relative z-10 text-center">
              How it works
            </h2>
            <div className="grid gap-8 md:grid-cols-4 relative z-10">
              {[
                {
                  step: "01",
                  title: "Upload Image",
                  desc: "Securely upload your document or photo.",
                },
                {
                  step: "02",
                  title: "Vision AI",
                  desc: "Advanced AI extracts text and data.",
                },
                {
                  step: "03",
                  title: "Safe Analysis",
                  desc: "Models generate educational summaries.",
                },
                {
                  step: "04",
                  title: "Get Insights",
                  desc: "Read clear, jargon-free explanations.",
                },
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="text-5xl font-extrabold text-white/10 mb-4 group-hover:text-sky-400/30 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
