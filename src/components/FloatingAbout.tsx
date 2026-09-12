import { motion } from 'motion/react';
import { Aperture, Code, Flame, Sparkles } from 'lucide-react';

export default function FloatingAbout() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center py-32 px-8 overflow-hidden">
      
      <motion.p 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-[1.4rem] md:text-3xl font-medium max-w-4xl text-center z-10 leading-relaxed text-[#D7E2EA]"
      >
        We construct <span className="text-[#FF1744] font-black uppercase tracking-widest">Neon Brutalist</span> digital experiences. By colliding high-impact typography with raw cybernetic visuals, we build interfaces that don't just exist—they radiate energy.
      </motion.p>

      {/* Top Left */}
      <motion.div 
        initial={{ opacity: 0, x: -50, y: -50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-12 left-12 md:top-24 md:left-24 text-[#FF1744]"
      >
        <Aperture size={48} strokeWidth={1.5} />
      </motion.div>

      {/* Top Right */}
      <motion.div 
        initial={{ opacity: 0, x: 50, y: -50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-12 right-12 md:top-24 md:right-24 text-[#FF1744]"
      >
        <Code size={48} strokeWidth={1.5} />
      </motion.div>

      {/* Bottom Left */}
      <motion.div 
        initial={{ opacity: 0, x: -50, y: 50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute bottom-12 left-12 md:bottom-24 md:left-24 text-[#FF1744]"
      >
        <Flame size={48} strokeWidth={1.5} />
      </motion.div>

      {/* Bottom Right */}
      <motion.div 
        initial={{ opacity: 0, x: 50, y: 50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute bottom-12 right-12 md:bottom-24 md:right-24 text-[#FF1744]"
      >
        <Sparkles size={48} strokeWidth={1.5} />
      </motion.div>

    </section>
  );
}
