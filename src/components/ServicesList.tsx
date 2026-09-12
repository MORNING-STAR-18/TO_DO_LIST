import { motion } from 'motion/react';

const services = [
  { id: '01', title: 'Digital Design', desc: 'Crafting brutalist UI systems that demand attention.' },
  { id: '02', title: 'Creative Engineering', desc: 'Transforming wild concepts into high-performance code.' },
  { id: '03', title: 'Interactive WebGL', desc: 'Immersive 3D experiences right in the browser.' },
  { id: '04', title: 'Brand Identity', desc: 'Loud, unforgettable visual systems for rebels.' },
  { id: '05', title: 'Motion Graphics', desc: 'Fluid animations that give your product a heartbeat.' },
];

export default function ServicesList() {
  return (
    <section className="bg-white text-[#0C0C0C] py-32 px-6 md:px-12">
      <h2 className="text-center font-black uppercase text-[clamp(3rem,12vw,160px)] tracking-tighter leading-none mb-24 drop-shadow-sm">
        Services
      </h2>
      
      <div className="max-w-6xl mx-auto flex flex-col">
        {services.map((svc, i) => (
          <motion.div 
            key={svc.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col md:flex-row md:items-center border-b border-gray-200 py-8 md:py-12 hover:bg-[#FF1744]/[0.03] hover:pl-4 transition-all duration-300 group cursor-default"
          >
            <span className="text-[12vw] md:text-[9vw] font-black opacity-20 group-hover:text-[#FF1744] group-hover:opacity-100 transition-colors duration-300 leading-none">
              {svc.id}
            </span>
            <div className="md:ml-12 mt-4 md:mt-0 flex-1">
              <h3 className="text-3xl md:text-5xl font-semibold mb-2 md:mb-4 uppercase tracking-tight">{svc.title}</h3>
              <p className="text-gray-600 font-light text-lg md:text-2xl max-w-2xl">{svc.desc}</p>
            </div>
            
            <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:-rotate-12">
              <span className="text-[#FF1744] text-5xl">↗</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
