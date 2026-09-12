export default function NeonPulseButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-4 rounded-full font-bold text-white uppercase tracking-widest outline outline-2 outline-white -outline-offset-3 hover:scale-105 transition-transform"
      style={{
        background: 'linear-gradient(123deg, #1A0C2E 7%, #FF1744 37%, #DC143C 72%, #E74C3C 100%)',
        boxShadow: '0px 4px 20px rgba(255, 23, 68, 0.4), inset 4px 4px 12px rgba(231, 76, 60, 0.8)'
      }}
    >
      {children}
    </button>
  );
}
