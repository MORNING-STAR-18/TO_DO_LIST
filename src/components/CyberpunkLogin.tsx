import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { auth, googleProvider, setupRecaptcha } from "../lib/firebase";
import { signInWithPopup, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function CyberpunkLogin() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Motion values to track mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the motion values
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transform mouse position into rotation values
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  useEffect(() => {
    // Initialize invisible recaptcha
    setupRecaptcha("recaptcha-container");
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleGoogleSignIn = async () => {
    try {
      setStatus("verifying");
      await signInWithPopup(auth, googleProvider);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStatus("sent");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message);
      // Reset recaptcha on error so user can try again
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setStatus("verifying");
    setErrorMsg("");
    try {
      await confirmationResult.confirm(otp);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden font-sans">
      <div id="recaptcha-container" className="hidden"></div>
      
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.15)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-30 pointer-events-none" />
      
      {/* Magenta glow blob behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Perspective Container */}
      <div style={{ perspective: "1000px" }} className="z-10 w-full max-w-md p-4">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative p-10 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 group shadow-2xl"
        >
          {/* Glowing Animated Border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent [background:linear-gradient(45deg,#06b6d4,#ec4899)_border-box] [mask-composite:exclude] [-webkit-mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
          
          {/* Inner Content with 3D translation */}
          <div style={{ transform: "translateZ(60px)" }} className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 text-center mb-2 tracking-widest uppercase">
              System Login
            </h2>
            <p className="text-cyan-200/50 text-center text-xs font-mono mb-8 tracking-widest uppercase">
              Authorization Required
            </p>

            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full border-4 border-green-500 mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
                <h3 className="text-green-400 font-bold uppercase tracking-widest">Access Granted</h3>
                <p className="text-gray-400 text-sm mt-2">Welcome to the Nexus.</p>
              </div>
            ) : (
              <div className="w-full space-y-6">
                
                {status === "error" && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-xs text-center font-mono break-words">
                    ERR: {errorMsg}
                  </div>
                )}

                {/* Google Auth Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={status === "sending" || status === "verifying"}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Connect Google Node
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-cyan-500/30"></div>
                  <span className="flex-shrink-0 mx-4 text-cyan-500/50 text-xs font-mono uppercase">Or Neural Link (SMS)</span>
                  <div className="flex-grow border-t border-cyan-500/30"></div>
                </div>

                {/* Phone Auth Form */}
                {status !== "sent" ? (
                  <form className="space-y-4" onSubmit={handleSendOtp}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                        Comm Channel (Phone)
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-50 outline-none focus:border-pink-500 transition-all shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] focus:shadow-[inset_0_0_15px_rgba(236,72,153,0.3)] placeholder:text-gray-700 font-mono"
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {status === "sending" ? "Transmitting..." : "Send Auth Code"}
                    </button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={handleVerifyOtp}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-pink-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">
                        Decryption Key (OTP)
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-black/50 border border-pink-500/30 rounded-lg px-4 py-3 text-pink-50 outline-none focus:border-cyan-500 transition-all shadow-[inset_0_0_15px_rgba(236,72,153,0.1)] focus:shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] placeholder:text-gray-700 font-mono tracking-[0.5em] text-center"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === "verifying"}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase tracking-widest py-3 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {status === "verifying" ? "Decrypting..." : "Verify Identity"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

