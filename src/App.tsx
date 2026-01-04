
import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Adjusting paths to point to the root directory where the components, data, and types actually reside.
// This fixes the module resolution error in src/App.tsx.
import Header from '../components/Header';
import KineticCard from '../components/KineticCard';
import SpringLegVisualization from '../components/SpringLegVisualization';
import { knowledgeData } from '../data/knowledgeData';
import { KnowledgeItem } from '../types';

const App: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  
  const filters = ['All', 'Basic', 'Intermediate', 'Advanced'];

  const filteredData = filter === 'All' 
    ? knowledgeData 
    : knowledgeData.filter(item => item.difficulty === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-neon-400 selection:text-black">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <Header />

        {/* Interactive Lab Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-6 bg-neon-400 rounded-full"></span>
            <h2 className="text-xl font-bold text-white tracking-tight">INTERACTIVE LAB</h2>
          </div>
          <SpringLegVisualization />
        </section>

        {/* Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border
                ${filter === f 
                  ? 'bg-neon-400 text-black border-neon-400 shadow-neon' 
                  : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'}
              `}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]"
        >
          {filteredData.map((item, index) => (
            <KineticCard key={item.id} item={item} index={index} />
          ))}
        </motion.div>
      </main>

      {/* Decorative footer element */}
      <footer className="fixed bottom-6 right-6 z-20 opacity-30 pointer-events-none hidden md:block">
         <div className="font-mono text-[10px] text-neon-400 text-right">
           KINETIC LABS<br/>
           V.1.0.4-BETA
         </div>
      </footer>
    </div>
  );
};

export default App;
