import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { KnowledgeItem } from '../types';

interface KineticCardProps {
  item: KnowledgeItem;
  index: number;
}

const KineticCard: React.FC<KineticCardProps> = ({ item, index }) => {
  // Bento grid classes based on size
  const spanClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-1',
    large: 'col-span-1 md:col-span-2',
    tall: 'col-span-1 md:row-span-2',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 150, 
        damping: 12, 
        delay: index * 0.1 
      }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        boxShadow: "0 0 25px -5px rgba(204, 255, 0, 0.25)"
      }}
      className={`
        group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-sm
        hover:border-neon-400/50 transition-colors duration-300
        ${spanClasses[item.size || 'medium']}
      `}
    >
      {/* Background Decorative Mesh */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <item.icon size={80} className="text-neon-400 -rotate-12 translate-x-4 -translate-y-4" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-gray-800 text-neon-400 border border-white/5 shadow-inner">
              <item.icon size={24} />
            </div>
            <div className="flex gap-2">
              {item.tags.map((tag, i) => (
                <span key={i} className="text-[10px] uppercase font-bold tracking-wider text-gray-500 border border-gray-700 px-2 py-1 rounded-full">
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-neon-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-xs font-mono text-neon-500 mb-3 tracking-widest uppercase opacity-80">
            {item.subtitle}
          </p>
          
          <p className="text-gray-400 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
          <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 
            ${item.difficulty === 'Advanced' ? 'text-red-400' : 
              item.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-green-400'}`}>
            Lv. {item.difficulty}
          </span>
          
          <motion.button 
            whileHover={{ x: 5 }}
            className="flex items-center gap-1 text-sm font-semibold text-white group-hover:text-neon-400 transition-colors"
          >
            Details <ArrowUpRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Kinetic corner accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default KineticCard;