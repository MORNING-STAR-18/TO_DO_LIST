import { useRef, useState, MouseEvent } from 'react';
import { motion } from 'motion/react';

export default function MagneticImage({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // distance from center of element to mouse
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    // threshold is 400px
    if (distance < 400) {
      // translate by 10% of distance
      setPosition({ x: distanceX * 0.1, y: distanceY * 0.1 });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ 
        x: position.x, 
        y: position.y, 
        scale: position.x !== 0 || position.y !== 0 ? 1.02 : 1 
      }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className="relative rounded-t-[300px] overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto aspect-[3/4]"
    >
      <img src={src} className="w-full h-full object-cover" alt="Hero portrait" />
    </motion.div>
  );
}
