import { motion } from 'framer-motion';

const getRiskBadgeClass = (riskLevel) => {
  const classes = {
    safe: 'threat-badge-safe',
    suspicious: 'threat-badge-suspicious',
    phishing: 'threat-badge-phishing',
    malicious: 'threat-badge-malicious',
  };
  return classes[riskLevel] || 'threat-badge-suspicious';
};

const RiskBadge = ({ riskLevel }) => {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`${getRiskBadgeClass(riskLevel)} uppercase tracking-wide`}
    >
      {riskLevel}
    </motion.span>
  );
};

export default RiskBadge;
