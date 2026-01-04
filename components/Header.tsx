import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="mb-12 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Activity className="text-neon-400" size={32} />
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-mono text-gray-400 tracking-[0.2em] uppercase"
          >
            Personal Knowledge Base
          </motion.span>
        </div>
        
        <motion.h1 
          className="text-5xl md:text-6xl font-black text-white italic tracking-tighter"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          BADMINTON <span className="text-neon-400 block md:inline">KINETIC</span>
        </motion.h1>
      </div>

      <motion.div 
        className="flex items-center gap-4 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="hidden md:block">
          <div className="text-xs text-gray-500 font-mono">STATUS</div>
          <div className="text-neon-400 font-bold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-500"></span>
            </span>
            SYSTEM ACTIVE
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;