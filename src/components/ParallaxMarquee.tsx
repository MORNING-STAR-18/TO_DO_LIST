import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const row1 = [
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
  "https://images.unsplash.com/photo-1531297172867-11c5040d99ba?q=80&w=600",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
];

const row2 = [
  "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600",
  "https://images.unsplash.com/photo-1510906594845-bc082582c8cc?q=80&w=600",
  "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600",
];

export default function ParallaxMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);
  const x3 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={containerRef} className="py-24 overflow-hidden flex flex-col gap-3">
      {/* Row 1 */}
      <motion.div style={{ x: x1 }} className="flex gap-3 w-[200vw]">
        {[...row1, ...row1, ...row1].map((src, i) => (
          <div key={i} className="flex-shrink-0 w-[420px] h-[270px] rounded-2xl overflow-hidden hover:drop-shadow-[0_0_15px_rgba(255,23,68,0.4)] transition-all duration-300">
            <img src={src} className="w-full h-full object-cover" alt="Portfolio" />
          </div>
        ))}
      </motion.div>
      
      {/* Row 2 */}
      <motion.div style={{ x: x2 }} className="flex gap-3 w-[200vw] ml-[-50vw]">
        {[...row2, ...row2, ...row2].map((src, i) => (
          <div key={i} className="flex-shrink-0 w-[420px] h-[270px] rounded-2xl overflow-hidden hover:drop-shadow-[0_0_15px_rgba(255,23,68,0.4)] transition-all duration-300">
            <img src={src} className="w-full h-full object-cover" alt="Portfolio" />
          </div>
        ))}
      </motion.div>

      {/* Row 3 */}
      <motion.div style={{ x: x3 }} className="flex gap-3 w-[200vw]">
        {[...row1, ...row1, ...row1].reverse().map((src, i) => (
          <div key={i} className="flex-shrink-0 w-[420px] h-[270px] rounded-2xl overflow-hidden hover:drop-shadow-[0_0_15px_rgba(255,23,68,0.4)] transition-all duration-300">
            <img src={src} className="w-full h-full object-cover" alt="Portfolio" />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
