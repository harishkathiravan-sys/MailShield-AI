import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Mail, Activity, Eye, Lock, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import GlitchText from '../components/animations/GlitchText';
import TypewriterText from '../components/animations/TypewriterText';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import TiltCard from '../components/animations/TiltCard';
import MagneticButton from '../components/animations/MagneticButton';
import ParticleBurst from '../components/animations/ParticleBurst';
import ScanLine from '../components/animations/ScanLine';

const HomePage = () => {
  const features = [
    {
      icon: Mail,
      title: 'Email Analysis',
      description: 'Deep NLP analysis of email content to detect spam and phishing patterns',
      color: 'blue',
    },
    {
      icon: Activity,
      title: 'Real-Time Scanning',
      description: 'Live threat detection using advanced pattern recognition algorithms',
      color: 'purple',
    },
    {
      icon: Eye,
      title: 'Sandbox Testing',
      description: 'Open suspicious links in isolated browser environments for safe analysis',
      color: 'green',
    },
    {
      icon: Lock,
      title: 'SSL Verification',
      description: 'Comprehensive certificate validation and security level assessment',
      color: 'red',
    },
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
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-cyber-blue/20 rounded-full blur-3xl" />
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyber-purple/20 rounded-full blur-3xl" />
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
            className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple p-1"
          >
            <div className="w-full h-full bg-cyber-darker rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-cyber-blue" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <GlitchText text="Analyze Suspicious Emails" />
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
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
      <section className="py-12 px-4 bg-cyber-dark/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center cyber-card relative overflow-hidden group"
              >
                <ScanLine duration={3} delay={index * 0.3} />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-8 h-8 text-cyber-blue mx-auto mb-3" />
                </motion.div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix || ''}
                    duration={2000}
                  />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Advanced Security Features
            </h2>
            <p className="text-xl text-gray-400">
              Comprehensive threat detection powered by real security analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-cyber-dark/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">
              Four steps to complete email security analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Paste Email', desc: 'Enter suspicious email content' },
              { step: 2, title: 'AI Analysis', desc: 'NLP scans for threats' },
              { step: 3, title: 'Sandbox Test', desc: 'Links opened safely' },
              { step: 4, title: 'Get Report', desc: 'Detailed security results' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className="text-center relative"
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-2xl font-bold relative overflow-hidden"
                  whileHover={{ 
                    boxShadow: '0 0 30px rgba(0, 212, 255, 0.6)',
                    scale: 1.1
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10">{item.step}</span>
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center cyber-card bg-gradient-to-br from-cyber-dark to-cyber-bg"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Inbox?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Start analyzing suspicious emails now with our advanced AI-powered platform
          </p>
          <Link to="/analyze">
            <ParticleBurst>
              <MagneticButton className="cyber-button text-lg px-10 py-4">
                Start Free Analysis
              </MagneticButton>
            </ParticleBurst>
          </Link>
        </motion.div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 px-4 bg-cyber-dark/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-gray-400">
              Built with cutting-edge security tools and frameworks
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'NLP Analysis', desc: 'Natural Language Processing' },
              { name: 'Playwright', desc: 'Headless Browser Testing' },
              { name: 'SSL/TLS', desc: 'Certificate Validation' },
              { name: 'WHOIS', desc: 'Domain Intelligence' },
              { name: 'Pattern Matching', desc: 'Threat Detection' },
              { name: 'FastAPI', desc: 'High-Performance Backend' },
              { name: 'React', desc: 'Modern UI Framework' },
              { name: 'WebGL', desc: '3D Visualization' },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)'
                }}
                className="cyber-card text-center p-6 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 to-cyber-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <div className="relative z-10">
                  <div className="text-lg font-bold text-cyber-blue mb-2">{tech.name}</div>
                  <div className="text-sm text-gray-400">{tech.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Metrics Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Multi-Layer Security Analysis
            </h2>
            <p className="text-xl text-gray-400">
              Comprehensive protection through advanced detection methods
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Email Content Analysis',
                metrics: ['Spam pattern detection', 'Phishing keyword matching', 'Sentiment analysis', 'Header validation']
              },
              {
                title: 'URL Security Checks',
                metrics: ['SSL certificate validation', 'Domain reputation', 'WHOIS lookup', 'Malicious pattern detection']
              },
              {
                title: 'Behavioral Analysis',
                metrics: ['Sandbox execution', 'Request monitoring', 'Cookie analysis', 'JavaScript evaluation']
              }
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="cyber-card relative overflow-hidden group"
              >
                <ScanLine duration={4} delay={index * 0.5} />
                <h3 className="text-2xl font-bold mb-6 text-cyber-blue">{category.title}</h3>
                <ul className="space-y-3">
                  {category.metrics.map((metric, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + i * 0.1 }}
                      className="flex items-center text-gray-300"
                    >
                      <CheckCircle className="w-5 h-5 text-cyber-green mr-3 flex-shrink-0" />
                      <span>{metric}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-cyber-dark/30">
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
            <p className="text-xl text-gray-400">
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
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
                className="cyber-card"
              >
                <h3 className="text-xl font-bold mb-3 text-cyber-blue">{faq.q}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.a}</p>
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
          <div className="cyber-card bg-gradient-to-br from-cyber-blue/20 via-cyber-purple/20 to-cyber-red/20 border-2 border-cyber-blue/50 relative overflow-hidden">
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
                backgroundImage: 'linear-gradient(45deg, rgba(0, 212, 255, 0.1) 25%, transparent 25%, transparent 75%, rgba(0, 212, 255, 0.1) 75%, rgba(0, 212, 255, 0.1)), linear-gradient(45deg, rgba(0, 212, 255, 0.1) 25%, transparent 25%, transparent 75%, rgba(0, 212, 255, 0.1) 75%, rgba(0, 212, 255, 0.1))',
                backgroundSize: '60px 60px',
                backgroundPosition: '0 0, 30px 30px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-5xl font-bold mb-6">
                Join the <span className="gradient-text">Cyber Defense</span> Revolution
              </h2>
              <p className="text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
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

const FeatureCard = ({ icon: Icon, title, description, color, index }) => {
  const colorClasses = {
    blue: 'from-cyber-blue to-blue-600',
    purple: 'from-cyber-purple to-purple-600',
    green: 'from-cyber-green to-green-600',
    red: 'from-cyber-red to-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0, 212, 255, 0.2)' }}
      className="cyber-card relative overflow-hidden h-full p-8"
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
