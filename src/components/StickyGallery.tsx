import { motion } from 'motion/react';

const projects = [
  {
    id: '01',
    title: 'Cyber Nexus',
    img1: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200',
    img2: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=800',
    img3: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800'
  },
  {
    id: '02',
    title: 'Rave Synth',
    img1: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1200',
    img2: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?q=80&w=800',
    img3: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'
  },
  {
    id: '03',
    title: 'Neon Vault',
    img1: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200',
    img2: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800',
    img3: 'https://images.unsplash.com/photo-1531297172867-11c5040d99ba?q=80&w=800'
  }
];

export default function StickyGallery() {
  return (
    <section className="py-32 px-4 md:px-8 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto flex flex-col pb-32">
        {projects.map((proj, i) => (
          <div 
            key={proj.id} 
            className="sticky w-full border-2 border-[#FF1744] bg-[#0C0C0C] rounded-[2rem] p-6 md:p-10 flex flex-col shadow-[0_0_50px_rgba(255,23,68,0.1)] mb-12"
            style={{ 
              top: `${5 + i * 2}rem`,
              height: 'max(80vh, 600px)',
              zIndex: 10 + i
            }}
          >
            {/* Top Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div className="flex items-center gap-6">
                <span className="text-[#FF1744] text-4xl md:text-6xl font-black drop-shadow-[0_0_10px_rgba(255,23,68,0.5)]">{proj.id}</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase text-[#D7E2EA] tracking-tighter">{proj.title}</h3>
              </div>
              <button className="self-start md:self-auto px-6 py-3 rounded-full bg-[#E74C3C] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300">
                Live Project
              </button>
            </div>
            
            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 h-full overflow-hidden">
              <div className="md:col-span-7 bg-[#111] rounded-2xl overflow-hidden h-48 md:h-full relative group">
                <img src={proj.img1} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Project 1" />
                <div className="absolute inset-0 bg-[#FF1744]/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
              </div>
              <div className="hidden md:grid md:col-span-5 grid-rows-2 gap-4 h-full">
                <div className="bg-[#111] rounded-2xl overflow-hidden relative group">
                  <img src={proj.img2} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Project 2" />
                  <div className="absolute inset-0 bg-[#FF1744]/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
                </div>
                <div className="bg-[#111] rounded-2xl overflow-hidden relative group">
                  <img src={proj.img3} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Project 3" />
                  <div className="absolute inset-0 bg-[#FF1744]/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
