import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Mail, Eye, Lock, Zap, CheckCircle, AlertTriangle, ChevronRight, ArrowRight, Search, Globe, Activity as ActivityIcon } from 'lucide-react';
import GlitchText from '../components/animations/GlitchText';
import TypewriterText from '../components/animations/TypewriterText';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import MagneticButton from '../components/animations/MagneticButton';
import ParticleBurst from '../components/animations/ParticleBurst';

const HomePage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: '1',
      title: 'Paste Email',
      description: 'Enter or paste the suspicious email content including headers and body. Our system accepts raw email source for comprehensive analysis.',
      bgColor: 'bg-blue-100',
      color: 'text-blue-600',
      visual: <Mail className="w-40 h-40 text-blue-200" />
    },
    {
      id: '2',
      title: 'AI Analysis',
      description: 'Our advanced NLP engine scans the email for spam patterns, phishing indicators, and malicious content. Real-time threat detection in milliseconds.',
      bgColor: 'bg-purple-100',
      color: 'text-purple-600',
      visual: <Zap className="w-40 h-40 text-purple-200" />
    },
    {
      id: '3',
      title: 'Sandbox Test',
      description: 'Suspicious links are opened in isolated browser environments. We monitor all network requests and JavaScript execution safely.',
      bgColor: 'bg-indigo-100',
      color: 'text-indigo-600',
      visual: <Eye className="w-40 h-40 text-indigo-200" />
    },
    {
      id: '4',
      title: 'Get Report',
      description: 'Receive a detailed security report with threat scores, detected indicators, and recommendations. Download for your records.',
      bgColor: 'bg-emerald-100',
      color: 'text-emerald-600',
      visual: <CheckCircle className="w-40 h-40 text-emerald-200" />
    }
  ];

  const stats = [
    { label: 'Threats Detected', value: 10000, icon: AlertTriangle, suffix: '+' },
    { label: 'Emails Analyzed', value: 50000, icon: Mail, suffix: '+' },
    { label: 'Success Rate', value: 99.7, icon: CheckCircle, suffix: '%' },
    { label: 'Response Time', value: 5, icon: Zap, suffix: 's', prefix: '<' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-gray-300/10 rounded-full blur-3xl" />
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gray-400/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 p-1"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-gray-900" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <GlitchText text="Analyze Suspicious Emails" />
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            <TypewriterText 
              text="Paste any suspicious email and let our AI-powered sandbox system safely investigate it. Real security analysis with automated threat detection."
              delay={30}
            />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analyze">
              <ParticleBurst>
                <MagneticButton className="cyber-button text-lg px-8 py-4">
                  Analyze Email Now
                </MagneticButton>
              </ParticleBurst>
            </Link>
            <Link to="/dashboard">
              <MagneticButton className="cyber-button-secondary text-lg px-8 py-4">
                View Dashboard
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center justify-center p-8 bg-white border border-gray-400 rounded-3xl hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="mb-4"
                >
                  <stat.icon className="w-10 h-10 text-gray-400" />
                </motion.div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix || ''}
                    duration={2000}
                  />
                </div>
                <div className="text-sm text-gray-500 font-medium tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Stacked Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="space-y-32">
          <div className="text-center mb-24">
            <span className="text-blue-600 font-semibold tracking-widest text-xs uppercase mb-4 block">Our Technology</span>
            <h2 className="text-5xl font-serif font-medium text-slate-900 mb-6">Core Capabilities</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Explore how MailShield AI protects your digital perimeter with multi-layered defense.</p>
          </div>

          <div className="relative">
            {/* Feature 1 - Email Analysis */}
            <div className="sticky top-32 mb-24">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-16 items-center"
              >
                <div className="flex-1">
                  <div className="p-5 w-fit rounded-3xl bg-blue-50 text-blue-600 mb-10">
                    <Mail className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-serif font-medium text-slate-900 mb-6">Email Analysis</h3>
                  <p className="text-xl text-slate-600 leading-relaxed">Deep NLP analysis of email content to detect spam and phishing patterns with 99.9% accuracy. Our AI understands context, not just keywords.</p>
                  <button className="mt-10 text-blue-600 font-semibold flex items-center gap-2 group hover:gap-3 transition-all">
                    Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="flex-1 w-full aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                  <Mail className="w-40 h-40 text-blue-100" />
                </div>
              </motion.div>
            </div>

            {/* Feature 2 - Real-Time Scanning */}
            <div className="sticky top-40 mb-24">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-12 rounded-[3.5rem] bg-slate-900 text-white border border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col md:flex-row-reverse gap-16 items-center"
              >
                <div className="flex-1">
                  <div className="p-5 w-fit rounded-3xl bg-white/10 text-white mb-10">
                    <Zap className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-serif font-medium mb-6">Real-Time Scanning</h3>
                  <p className="text-xl text-slate-400 leading-relaxed">Live threat detection using advanced pattern recognition algorithms and global intelligence. We scan every attachment and link in milliseconds.</p>
                  <button className="mt-10 text-white font-semibold flex items-center gap-2 group hover:gap-3 transition-all">
                    Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="flex-1 w-full aspect-square bg-white/5 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <Zap className="w-40 h-40 text-white/5" />
                </div>
              </motion.div>
            </div>

            {/* Feature 3 - Sandbox Testing */}
            <div className="sticky top-48 mb-24">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-16 items-center"
              >
                <div className="flex-1">
                  <div className="p-5 w-fit rounded-3xl bg-indigo-50 text-indigo-600 mb-10">
                    <Eye className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-serif font-medium text-slate-900 mb-6">Sandbox Testing</h3>
                  <p className="text-xl text-slate-600 leading-relaxed">Open suspicious links in isolated browser environments for safe analysis. Our virtualized containers ensure zero-day exploits never touch your network.</p>
                  <button className="mt-10 text-indigo-600 font-semibold flex items-center gap-2 group hover:gap-3 transition-all">
                    Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="flex-1 w-full aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                  <Eye className="w-40 h-40 text-indigo-100" />
                </div>
              </motion.div>
            </div>

            {/* Feature 4 - SSL Verification */}
            <div className="sticky top-56">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-12 rounded-[3.5rem] bg-emerald-50 border border-emerald-100 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.1)] flex flex-col md:flex-row-reverse gap-16 items-center"
              >
                <div className="flex-1">
                  <div className="p-5 w-fit rounded-3xl bg-emerald-500 text-white mb-10">
                    <Lock className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-serif font-medium text-slate-900 mb-6">SSL Verification</h3>
                  <p className="text-xl text-slate-700 leading-relaxed">Comprehensive certificate validation and security level assessment for every incoming communication. We ensure your connections are always genuine and encrypted.</p>
                  <button className="mt-10 text-emerald-600 font-semibold flex items-center gap-2 group hover:gap-3 transition-all">
                    Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="flex-1 w-full aspect-square bg-white rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                  <Lock className="w-40 h-40 text-emerald-100" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-32 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1">
              <span className="text-blue-600 font-semibold tracking-widest text-xs uppercase mb-4 block">Process</span>
              <h2 className="text-5xl font-serif font-medium text-slate-900 mb-6">How It Works</h2>
              <p className="text-xl text-slate-500 mb-12">Four simple steps to complete your email security analysis and protect your data.</p>
              
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-6 rounded-3xl transition-all duration-300 flex items-center gap-6 group ${
                      activeStep === index 
                        ? "bg-slate-50 shadow-sm border border-slate-100" 
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-xl font-medium transition-colors ${
                        activeStep === index 
                          ? step.bgColor + " " + step.color 
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-lg font-bold transition-colors ${
                          activeStep === index ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {activeStep === index && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-slate-500 mt-1 text-sm leading-relaxed"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>
                    {activeStep === index && (
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="aspect-square rounded-[3.5rem] bg-slate-50 border border-slate-100 overflow-hidden relative group flex items-center justify-center">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {steps[activeStep].visual}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Marquee Section */}
      <section className="py-24 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <h2 className="text-4xl font-serif font-medium text-slate-900 mb-4">Powered by Advanced Technology</h2>
          <p className="text-slate-500">Built with cutting-edge security tools and frameworks</p>
        </div>

        <div className="relative flex overflow-hidden py-12 border-y border-slate-100 bg-white">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marquee 30s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          
          <div className="flex marquee-track gap-20 whitespace-nowrap items-center">
            {[
              { name: 'NLP Analysis', icon: '🧠' },
              { name: 'Playwright', icon: '🎭' },
              { name: 'SSL/TLS', icon: '🔒' },
              { name: 'WHOIS', icon: '🌐' },
              { name: 'Pattern Matching', icon: '🔍' },
              { name: 'FastAPI', icon: '⚡' },
              { name: 'React', icon: '⚛️' },
              { name: 'WebGL', icon: '🎨' },
              { name: 'NLP Analysis', icon: '🧠' },
              { name: 'Playwright', icon: '🎭' },
              { name: 'SSL/TLS', icon: '🔒' },
              { name: 'WHOIS', icon: '🌐' },
              { name: 'Pattern Matching', icon: '🔍' },
              { name: 'FastAPI', icon: '⚡' },
              { name: 'React', icon: '⚛️' },
              { name: 'WebGL', icon: '🎨' },
              { name: 'NLP Analysis', icon: '🧠' },
              { name: 'Playwright', icon: '🎭' },
              { name: 'SSL/TLS', icon: '🔒' },
              { name: 'WHOIS', icon: '🌐' },
              { name: 'Pattern Matching', icon: '🔍' },
              { name: 'FastAPI', icon: '⚡' },
              { name: 'React', icon: '⚛️' },
              { name: 'WebGL', icon: '🎨' },
              { name: 'NLP Analysis', icon: '🧠' },
              { name: 'Playwright', icon: '🎭' },
              { name: 'SSL/TLS', icon: '🔒' },
              { name: 'WHOIS', icon: '🌐' },
              { name: 'Pattern Matching', icon: '🔍' },
              { name: 'FastAPI', icon: '⚡' },
              { name: 'React', icon: '⚛️' },
              { name: 'WebGL', icon: '🎨' },
            ].map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-slate-400 grayscale hover:grayscale-0 transition-all cursor-default"
              >
                <span className="text-2xl">{tech.icon}</span>
                <span className="text-sm font-bold tracking-[0.15em] uppercase">{tech.name}</span>
              </div>
            ))}
          </div>

          {/* Gradient masks for smooth fade */}
          <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-slate-50 to-transparent z-10" />
        </div>
      </section>

      {/* Multi-Layer Security Analysis */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-semibold tracking-widest text-xs uppercase mb-4 block">Security Stack</span>
              <h2 className="text-5xl md:text-6xl font-serif font-medium text-slate-900 leading-tight">
                Multi-Layer <br />
                <span className="italic text-slate-400">Security Analysis</span>
              </h2>
            </div>
            <p className="text-xl text-slate-500 max-w-sm">Comprehensive protection through advanced detection methods and real-time intelligence.</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Card 1: Email Content Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-8 bg-slate-50 p-12 rounded-[3rem] border border-slate-100 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-12">
                  <div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm w-fit mb-6">
                      <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-serif font-medium text-slate-900 mb-4">Email Content Analysis</h3>
                    <p className="text-slate-500 max-w-md">Deep inspection of linguistic markers and structural anomalies in every message.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold tracking-wider uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Analysis
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
                  <AnalysisItem label="Spam pattern detection" />
                  <AnalysisItem label="Phishing keyword matching" />
                  <AnalysisItem label="Sentiment analysis" />
                  <AnalysisItem label="Header validation" />
                  <AnalysisItem label="Metadata consistency" />
                  <AnalysisItem label="Sender reputation" />
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700" />
            </motion.div>

            {/* Card 2: URL Security Checks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="col-span-12 lg:col-span-4 bg-blue-600 p-12 rounded-[3rem] text-white relative overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl w-fit mb-8">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-medium mb-6">URL Security</h3>
                <p className="text-blue-100 mb-10 text-sm leading-relaxed">Every link is validated against global blacklists and analyzed for redirection loops.</p>
                <ul className="space-y-4 mt-auto">
                  <AnalysisItem label="SSL validation" dark />
                  <AnalysisItem label="Domain reputation" dark />
                  <AnalysisItem label="WHOIS lookup" dark />
                  <AnalysisItem label="Redirection loops" dark />
                </ul>
              </div>
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </motion.div>

            {/* Card 3: Behavioral Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="col-span-12 bg-slate-900 p-12 rounded-[3rem] text-white flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden"
            >
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <ActivityIcon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-serif font-medium">Behavioral Analysis</h3>
                </div>
                <p className="text-slate-400 text-lg mb-10 max-w-xl">We don't just look at what it is, we look at what it does. Our sandbox environment executes suspicious payloads safely.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnalysisItem label="Sandbox execution" dark />
                  <AnalysisItem label="Request monitoring" dark />
                  <AnalysisItem label="Cookie analysis" dark />
                  <AnalysisItem label="JS evaluation" dark />
                </div>
              </div>
              {/* Visual element for the behavioral card */}
              <div className="flex-1 w-full lg:w-auto aspect-video lg:aspect-square bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center relative group/visual">
                <ActivityIcon className="w-32 h-32 text-emerald-500/20 group-hover/visual:text-emerald-500/40 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border border-emerald-500/20 rounded-full animate-ping" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about MailShield AI
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: 'How does the sandbox analysis work?',
                a: 'Our system uses Playwright to open suspicious URLs in an isolated headless browser environment. We monitor all network requests, cookies, and JavaScript execution without exposing your real system to any threats.'
              },
              {
                q: 'Is my email data stored or shared?',
                a: 'No. All analysis is performed in real-time and data is only stored temporarily in your local database. We never share or sell your data to third parties.'
              },
              {
                q: 'What types of threats can MailShield AI detect?',
                a: 'We detect spam, phishing attempts, malicious URLs, SSL certificate issues, suspicious JavaScript, credential harvesting pages, and various social engineering attacks using NLP and pattern matching.'
              },
              {
                q: 'How accurate is the threat detection?',
                a: 'Our multi-layer analysis achieves 99.7% accuracy by combining NLP, pattern matching, SSL validation, domain reputation checks, and behavioral analysis in an isolated sandbox.'
              },
              {
                q: 'Can I analyze emails in bulk?',
                a: 'Yes! The dashboard allows you to view your analysis history and analyze multiple emails. Our API is designed to handle high-volume processing efficiently.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(26, 26, 26, 0.15)' }}
                className="cyber-card"
              >
                <h3 className="text-xl font-bold mb-3 text-gray-900">{faq.q}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <div className="cyber-card bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-2 border-gray-300 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(26, 26, 26, 0.05) 25%, transparent 25%, transparent 75%, rgba(26, 26, 26, 0.05) 75%, rgba(26, 26, 26, 0.05)), linear-gradient(45deg, rgba(26, 26, 26, 0.05) 25%, transparent 25%, transparent 75%, rgba(26, 26, 26, 0.05) 75%, rgba(26, 26, 26, 0.05))',
                backgroundSize: '60px 60px',
                backgroundPosition: '0 0, 30px 30px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-5xl font-bold mb-6">
                Join the <span className="gradient-text">Cyber Defense</span> Revolution
              </h2>
              <p className="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">
                Protect yourself and your organization from evolving email threats with real-time AI analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/analyze">
                  <ParticleBurst particleCount={20}>
                    <MagneticButton className="cyber-button text-xl px-12 py-5">
                      Analyze Your First Email
                    </MagneticButton>
                  </ParticleBurst>
                </Link>
                <Link to="/dashboard">
                  <MagneticButton className="cyber-button-secondary text-xl px-12 py-5">
                    Explore Dashboard
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

const AnalysisItem = ({ label, dark = false }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dark ? 'bg-white/40' : 'bg-slate-300'}`} />
    <span className={`text-sm ${dark ? 'text-blue-100' : 'text-slate-600'}`}>{label}</span>
  </div>
);

export default HomePage;
