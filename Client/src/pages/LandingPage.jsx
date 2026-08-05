import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CalendarDays, 
  Megaphone, 
  Wallet, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Building2,
  Cpu,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import freshshiftsLogo from '@/assets/freshshifts-logo.jpg';
import boardroomImg from '@/assets/boardroom-teamwork.jpg';
import myJfifImage from '@/assets/teaching-styles-design.jfif';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      title: "Employee Directory",
      description: "Centralized record management with role-based access controls and historical work logs.",
      icon: <Users className="w-6 h-6 text-teal" />,
      badge: "CORE MODULE"
    },
    {
      title: "Shift & Attendance Tracking",
      description: "Real-time clock-in/out monitoring, late arrival flags, and shift hour calculations.",
      icon: <Clock className="w-6 h-6 text-teal" />,
      badge: "AUTOMATED"
    },
    {
      title: "AI Leave Management",
      description: "Automated leave request workflows integrated with Google Gemini decision recommendations.",
      icon: <CalendarDays className="w-6 h-6 text-teal" />,
      badge: "AI POWERED"
    },
    {
      title: "Broadcast Announcements",
      description: "Targeted company-wide and department notices with read confirmation tracking.",
      icon: <Megaphone className="w-6 h-6 text-teal" />,
      badge: "COMMUNICATION"
    },
    {
      title: "Payroll & Payslip PDF",
      description: "Automated net salary calculations, tax deductions, and one-click PDF payslip downloads.",
      icon: <Wallet className="w-6 h-6 text-teal" />,
      badge: "FINANCE & PDF"
    },
    {
      title: "Enterprise RBAC Security",
      description: "Granular permission layers protecting sensitive employee and compensation records.",
      icon: <ShieldCheck className="w-6 h-6 text-teal" />,
      badge: "SECURITY"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 overflow-x-hidden">
      {/* TOP BRAND ACCENT BAR */}
      <div className="h-[3px] bg-gradient-to-r from-red-600 via-sky-500 to-teal w-full" />

      {/* HEADER / NAVBAR (SENIOR UI/UX RESPONSIVE REDESIGN) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 sm:gap-3 shadow-xs">
              <img 
                src={freshshiftsLogo} 
                alt="FreshShifts Logo" 
                className="h-7 sm:h-9 w-auto object-contain rounded"
              />
              <div className="border-l border-slate-200 pl-2 sm:pl-3 pr-1">
                <span className="font-extrabold text-slate-900 text-xs sm:text-base tracking-tight flex items-center gap-1">
                  FRESHSHIFTS <span className="text-red-600 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-red-50 font-bold rounded-md border border-red-100">HRMS</span>
                </span>
                <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium leading-none hidden sm:block">Enterprise Workforce Portal</p>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-700">
            <a href="#features" className="px-4 py-2 rounded-lg hover:bg-slate-100/80 hover:text-teal transition-all">
              Platform Features
            </a>
            <a href="#demo" className="px-4 py-2 rounded-lg hover:bg-slate-100/80 hover:text-teal transition-all">
              Live Preview
            </a>
            <a href="#ai-assistant" className="px-4 py-2 rounded-lg hover:bg-slate-100/80 hover:text-teal transition-all flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              AI Engine
            </a>
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200/80 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Operational
            </div>
            
            <Button asChild size="default" className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all font-semibold px-4 sm:px-6 text-xs sm:text-sm rounded-xl">
              <Link to="/login">
                Portal Login <ArrowRight className="ml-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </Button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Collapsible Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-200 bg-white px-6 py-4 flex flex-col gap-3 font-semibold text-slate-700"
            >
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-teal transition-colors border-b border-slate-100"
              >
                Platform Features
              </a>
              <a 
                href="#demo" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-teal transition-colors border-b border-slate-100"
              >
                Live Preview
              </a>
              <a 
                href="#ai-assistant" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-teal transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-sky-500" />
                AI Engine
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION WITH ENHANCED RESPONSIVE GRID & DOT TEXTURE */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 bg-white overflow-hidden border-b border-slate-200 bg-grid-dots">
        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[200px] sm:h-[350px] bg-sky-200/30 blur-3xl rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-900 text-[10px] sm:text-xs font-bold mb-6 shadow-xs max-w-full text-left">
                <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">OFFICIAL WORKFORCE MANAGEMENT SYSTEM FOR FRESHSHIFTS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
                Intelligent HRMS Built for <span className="text-teal">Modern Enterprise</span> Teams.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                FreshShifts HRMS unifies attendance tracking, leave approvals, payroll, and employee records into one high-performance, secure platform.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
                <Button asChild size="lg" className="bg-teal hover:bg-teal-dark text-white px-8 py-6 text-base font-semibold shadow-md rounded-xl">
                  <Link to="/login">
                    Access Portal <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-6 text-base font-semibold rounded-xl">
                  <a href="#demo">View Live Demo Preview</a>
                </Button>
              </div>

              {/* HIGH VALUE BUSINESS METRICS (RESPONSIVE GRID) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-center sm:text-left">
                <div className="p-3 bg-slate-50/60 sm:bg-transparent rounded-xl sm:rounded-none">
                  <h4 className="text-2xl font-extrabold text-slate-900">99.8%</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Shift & Attendance Accuracy</p>
                </div>
                <div className="p-3 bg-slate-50/60 sm:bg-transparent rounded-xl sm:rounded-none">
                  <h4 className="text-2xl font-extrabold text-slate-900">&lt; 24h</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">AI Leave Decision Speed</p>
                </div>
                <div className="p-3 bg-slate-50/60 sm:bg-transparent rounded-xl sm:rounded-none">
                  <h4 className="text-2xl font-extrabold text-slate-900">100%</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">On-Time Automated Payroll</p>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Image Frame (RESPONSIVE HEIGHT & CONTAINER) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                <img 
                  src={myJfifImage} 
                  alt="FreshShifts Executive Teamwork" 
                  className="w-full h-[280px] sm:h-[400px] lg:h-[470px] object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Floating Stat Card */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 rounded-xl bg-white/90 backdrop-blur border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center font-bold shrink-0">
                        <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Gemini AI Engine</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">Smart Leave Assistant</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold rounded-md shrink-0">
                      98% Confidence
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO PREVIEW SECTION */}
      <section id="demo" className="py-16 sm:py-20 bg-slate-100/70 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">Enterprise Dashboard Preview</h2>
            <p className="text-sm sm:text-base text-slate-600">
              Explore how FreshShifts HRMS simplifies daily attendance, AI-driven leave approvals, and payroll reporting.
            </p>
            
            {/* Responsive Tab Switcher */}
            <div className="flex flex-col sm:flex-row p-1.5 mt-6 sm:mt-8 bg-slate-200/80 rounded-xl border border-slate-300 gap-1.5 sm:gap-1 max-w-xl mx-auto">
              <button 
                onClick={() => setActiveTab('attendance')}
                className={`w-full sm:w-auto flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'attendance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Attendance Tracker
              </button>
              <button 
                onClick={() => setActiveTab('leave')}
                className={`w-full sm:w-auto flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'leave' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                AI Leave Assistant
              </button>
              <button 
                onClick={() => setActiveTab('payroll')}
                className={`w-full sm:w-auto flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'payroll' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Payroll Engine
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'attendance' && (
                <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">Daily Attendance Monitor</h3>
                      <p className="text-xs text-slate-500">Live Employee Clock-in Log</p>
                    </div>
                    <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-semibold rounded-full">Real-time Stream</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0">MH</div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Muhammad Hussnain</p>
                          <p className="text-xs text-slate-500">Software Engineer • Engineering</p>
                        </div>
                      </div>
                      <div className="sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                        <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">Present</span>
                        <p className="text-xs text-slate-500 mt-0.5">Clock In: 09:00 AM</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0">SA</div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Sarah Ahmed</p>
                          <p className="text-xs text-slate-500">HR Administrator • Human Resources</p>
                        </div>
                      </div>
                      <div className="sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                        <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">Present</span>
                        <p className="text-xs text-slate-500 mt-0.5">Clock In: 08:52 AM</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'leave' && (
                <motion.div key="leave" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">AI Leave Approval Recommendation</h3>
                      <p className="text-xs text-slate-500">Powered by Google Gemini 1.5</p>
                    </div>
                    <span className="px-3 py-1 bg-teal/10 text-teal text-xs font-bold rounded-full border border-teal/20">AI Confidence: 98%</span>
                  </div>

                  <div className="p-5 sm:p-6 rounded-xl bg-slate-900 text-white">
                    <div className="flex items-start gap-4 mb-4">
                      <Sparkles className="w-6 h-6 text-sky-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white text-base">Recommendation: Approve Casual Leave</h4>
                        <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                          Employee has 8 remaining casual days. Team capacity is currently at 92%. No overlapping leaves detected for the requested date.
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
                      <span>Applicant: Muhammad Hussnain</span>
                      <span>Requested: 2 Days (Casual)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payroll' && (
                <motion.div key="payroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">Automated Payroll Calculation</h3>
                      <p className="text-xs text-slate-500">Instant PDF Payslip Processing</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-full">PDF Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold">Gross Salary</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">$4,500.00</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold">Deductions / Tax</p>
                      <p className="text-xl font-bold text-red-600 mt-1">-$450.00</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-xs text-emerald-700 font-semibold">Net Disbursed</p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">$4,050.00</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 sm:py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 sm:mb-4">Complete HR Architecture</h2>
            <p className="text-sm sm:text-base text-slate-600">
              Designed according to strict enterprise RBAC standards with dedicated modules for employees and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                className="relative overflow-hidden border border-slate-200/90 rounded-2xl shadow-sm hover-lift transition-all bg-gradient-to-b from-white to-slate-50/40 group hover:border-teal/40 hover:shadow-lg"
              >
                {/* Sleek Top Accent Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-teal to-teal-dark opacity-80 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="p-5 sm:p-6 pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {feature.icon}
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider rounded-md border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-5 sm:p-6 pt-0">
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Subtle Interactive Link Cue */}
                  <div className="flex items-center text-xs font-semibold text-teal group-hover:text-teal-dark transition-colors">
                    <span>Explore Module</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT HIGHLIGHT STRIP */}
      <section id="ai-assistant" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-slate-800/80 rounded-2xl p-6 sm:p-12 border border-slate-700 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal/20 text-sky-400 flex items-center justify-center shrink-0 border border-teal/30">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <span className="px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-semibold rounded-full border border-sky-500/30 mb-3 inline-block">
                Smart Recommendation AI
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Google Gemini HR Assistant Integrated</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Empower HR managers with AI-generated insights for pending leave applications, evaluating historical patterns, team bandwidth, and remaining balance thresholds automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 sm:py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={freshshiftsLogo} alt="FreshShifts" className="h-8 w-auto bg-white rounded p-0.5" />
            <span className="text-white font-bold text-base">FreshShifts HRMS</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 FreshShifts. All rights reserved. Enterprise Workforce Portal.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium">Portal Access</Link>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Security Verified (JWT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
