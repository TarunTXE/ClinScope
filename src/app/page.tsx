import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  Database,
  FileSpreadsheet,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  FileText,
  Clock,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-teal-500/20 selection:text-teal-200">
      <Header />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                              */}
        {/* ========================================================================= */}
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
          {/* Subtle background ambient radial gradient */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/40 px-3.5 py-1 text-xs font-medium text-teal-300 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI-powered research workspace</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Turn clinical research{" "}
              <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                into structured insight.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Design study-specific forms, collect structured research data, and uncover patterns with AI.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-6 font-medium shadow-lg shadow-teal-900/30">
                  <span>Create a Research Study</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 text-slate-300 hover:text-white">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="pt-2 text-xs text-slate-500 font-medium">
              Built for researchers • Structured datasets • AI-assisted analysis
            </div>
          </div>

          {/* ========================================================================= */}
          {/* HERO VISUAL PREVIEW CARD                                                  */}
          {/* ========================================================================= */}
          <div className="mt-14 sm:mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-slate-800/90 bg-[#0c111e]/95 p-4 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden">
              {/* Top Window Chrome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  </div>
                  <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />
                  <span className="text-xs font-semibold text-slate-300">
                    ClinScope Research Workspace
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950/60 border border-teal-800/50 text-[11px] font-medium text-teal-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Active Study Protocol
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    ID: CS-2026-D08
                  </span>
                </div>
              </div>

              {/* Study Info Banner */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Diabetes Risk Observational Cohort
                  </h3>
                  <p className="text-xs text-slate-400">
                    Longitudinal assessment of metabolic glycemic markers across multi-site participants.
                  </p>
                </div>
                <div className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Updated 12m ago</span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 pb-5">
                <div className="p-3.5 rounded-xl bg-[#111728] border border-slate-800/90 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Total Records</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">1,284</span>
                    <span className="text-[11px] text-teal-400 font-medium">+14 this week</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111728] border border-slate-800/90 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Mean Cohort Age</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">54.2</span>
                    <span className="text-[11px] text-slate-500">± 8.4 years SD</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111728] border border-slate-800/90 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Female Distribution</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">68%</span>
                    <span className="text-[11px] text-slate-500">873 of 1,284</span>
                  </div>
                </div>
              </div>

              {/* SVG Research Data Trend Chart */}
              <div className="p-4 rounded-xl bg-[#111728] border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span className="font-semibold text-white">Biomarker Trend (HbA1c Mean Trajectory)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Week 0 → Week 16</span>
                </div>

                <div className="h-44 w-full relative">
                  <svg
                    viewBox="0 0 800 200"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="40" x2="800" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="800" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="800" y2="140" stroke="#1e293b" strokeDasharray="3 3" />

                    {/* Area under curve */}
                    <path
                      d="M0,150 Q100,140 200,110 T400,90 T600,60 T800,45 L800,190 L0,190 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Line path */}
                    <path
                      d="M0,150 Q100,140 200,110 T400,90 T600,60 T800,45"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2.5"
                    />

                    {/* Data Points */}
                    <circle cx="0" cy="150" r="4" fill="#090d16" stroke="#14b8a6" strokeWidth="2" />
                    <circle cx="200" cy="110" r="4" fill="#090d16" stroke="#14b8a6" strokeWidth="2" />
                    <circle cx="400" cy="90" r="4" fill="#090d16" stroke="#14b8a6" strokeWidth="2" />
                    <circle cx="600" cy="60" r="4" fill="#090d16" stroke="#14b8a6" strokeWidth="2" />
                    <circle cx="800" cy="45" r="5" fill="#14b8a6" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Baseline (W0)</span>
                  <span>Visit 1 (W4)</span>
                  <span>Visit 2 (W8)</span>
                  <span>Visit 3 (W12)</span>
                  <span>Endpoint (W16)</span>
                </div>
              </div>

              {/* Live Cohort Table Snippet */}
              <div className="mt-3.5 rounded-xl border border-slate-800/90 bg-[#111728] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-2.5">Subject ID</th>
                      <th className="px-4 py-2.5">Demographics</th>
                      <th className="px-4 py-2.5">Fasting Glucose</th>
                      <th className="px-4 py-2.5">HbA1c</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-teal-400 font-semibold">PT-10492</td>
                      <td className="px-4 py-2.5">56y / Female</td>
                      <td className="px-4 py-2.5">128 mg/dL</td>
                      <td className="px-4 py-2.5">6.8%</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-400">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-teal-400 font-semibold">PT-10493</td>
                      <td className="px-4 py-2.5">61y / Male</td>
                      <td className="px-4 py-2.5">142 mg/dL</td>
                      <td className="px-4 py-2.5">7.1%</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-400">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AI Insight Signal Callout */}
              <div className="mt-3.5 p-3 rounded-xl border border-teal-800/40 bg-teal-950/30 text-xs text-teal-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-semibold">AI Pattern Signal: </strong>
                  Subgroup clustering identified in age cohort 50–59 with secondary fasting glucose correlation (p &lt; 0.01).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS SECTION                                                      */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How ClinScope Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A streamlined workflow to transition from study design to structured dataset exploration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0f1523] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800/50 text-teal-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-white">
                Define Protocol & Forms
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your research objectives. ClinScope generates validated electronic data collection fields tailored to your study.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#0f1523] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800/50 text-teal-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-white">
                Collect Structured Data
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Capture standardized patient observation records with real-time field type verification and clean cohort organization.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#0f1523] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800/50 text-teal-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-white">
                Uncover AI Insights
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Surface statistical patterns, biomarker trends, and multivariate correlations across your research datasets automatically.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CORE FEATURES (3 CARDS)                                                   */}
        {/* ========================================================================= */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Platform Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Purpose-built tools for researchers to collect and analyze medical data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-slate-800 bg-[#0f1523] flex flex-col justify-between hover:border-slate-700 transition-colors">
              <CardHeader className="space-y-2">
                <div className="h-9 w-9 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-400 flex items-center justify-center mb-1">
                  <FileText className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-semibold text-white">
                  AI Form Builder
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 leading-relaxed">
                  Generate research forms and standardized variable fields based on your study protocol.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5 font-mono text-slate-400">
                  <div className="flex justify-between text-slate-300">
                    <span>• Systolic BP</span>
                    <span className="text-teal-400 text-[10px]">Numeric (mmHg)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Fasting Glucose</span>
                    <span className="text-teal-400 text-[10px]">Numeric (mg/dL)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-slate-800 bg-[#0f1523] flex flex-col justify-between hover:border-slate-700 transition-colors">
              <CardHeader className="space-y-2">
                <div className="h-9 w-9 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-400 flex items-center justify-center mb-1">
                  <Database className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-semibold text-white">
                  Research Data
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 leading-relaxed">
                  Collect and manage structured study datasets in one central, organized repository.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Record Validation</span>
                    <span className="text-teal-400 font-semibold text-[10px]">100% Structured</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tamper-evident log entries and cohort separation.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-slate-800 bg-[#0f1523] flex flex-col justify-between hover:border-slate-700 transition-colors">
              <CardHeader className="space-y-2">
                <div className="h-9 w-9 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-400 flex items-center justify-center mb-1">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-semibold text-white">
                  AI Insights
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 leading-relaxed">
                  Discover non-linear patterns, outlier clusters, and meaningful trends in your datasets.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Pattern Detection</span>
                    <span className="text-teal-400 font-semibold text-[10px]">Active</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Continuous statistical scanning across variables.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOTTOM CTA SECTION                                                        */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80 text-center space-y-6">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0f1523] to-[#0b101e] border border-slate-800 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to start your clinical research study?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Create an investigator account today and experience streamlined data capture with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-6">
                  <span>Get Started with ClinScope</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6">
                  Doctor Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
