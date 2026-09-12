import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { Icon } from "@iconify/react";
import { auth, googleProvider, setupRecaptcha } from "../lib/firebase";
import { signInWithPopup, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function LumenHero() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  useEffect(() => {
    setupRecaptcha("recaptcha-container-lumen");
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
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
    <section className="relative min-h-screen pt-28 lg:pt-36 overflow-hidden flex flex-col font-sans">
      <div id="recaptcha-container-lumen" className="hidden"></div>
      
      {/* Background radial wash & masked grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(45,212,191,0.15)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(232,121,249,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full z-10 grid lg:grid-cols-2 gap-16 items-center flex-1 pb-24">
        
        {/* LEFT: Copy */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-2 bg-aqua/10 border border-aqua/30 rounded-full px-3 py-1 mb-6">
            <Icon icon="ph:sparkle-fill" className="text-aqua-light text-sm" />
            <span className="text-aqua-light text-xs font-medium uppercase tracking-wider">Form Design, generated from a prompt</span>
          </div>
          
          <h1 className="text-5xl lg:text-[64px] leading-[1.1] font-display font-bold tracking-tight mb-6">
            Forms that feel like <span className="text-gradient-clip">glass.</span>
          </h1>
          
          <p className="text-white/65 text-lg max-w-md mb-10 leading-relaxed">
            A dark glassmorphism marketing-and-form landing page ("Lumen"). Live preview generated from your prompt with fully functional secure backend integration.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full justify-center lg:justify-start">
            <button className="btn-gradient px-8 py-3.5 rounded-full font-medium text-sm inline-flex items-center gap-2 w-full sm:w-auto justify-center">
              <Icon icon="ph:magic-wand-fill" className="text-lg" />
              Generate a form
            </button>
            <button className="glass-soft px-8 py-3.5 rounded-full font-medium text-sm text-white inline-flex items-center gap-2 hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
              <Icon icon="ph:play-circle-fill" className="text-lg" />
              See the canvas
            </button>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/55 font-medium">
            <div className="flex items-center gap-2">
              <Icon icon="ph:check-circle-fill" className="text-aqua text-lg" />
              Tailwind export
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="ph:check-circle-fill" className="text-aqua text-lg" />
              WCAG focus states
            </div>
          </div>
        </div>

        {/* RIGHT: Glass Form with 3D Tilt */}
        <div className="relative w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto" style={{ perspective: "1000px" }}>
          
          {/* Drifting Aurora Orbs (Behind glass) */}
          <div className="absolute top-[-40px] left-[-40px] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.6)_0%,transparent_70%)] blur-[40px] animate-[auroraDrift_17s_ease-in-out_infinite_alternate] pointer-events-none z-0" />
          <div className="absolute bottom-[-60px] right-[-40px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(232,121,249,0.5)_0%,transparent_70%)] blur-[50px] animate-[auroraDriftAlt_20s_ease-in-out_infinite_alternate] pointer-events-none z-0" />
          <div className="absolute top-[30%] right-[-20px] w-[160px] h-[160px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.4)_0%,transparent_70%)] blur-[34px] animate-[auroraDrift_19s_ease-in-out_infinite_alternate-reverse] pointer-events-none z-0" />

          {/* Glass Form Card */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="glass-heavy relative z-10 p-7 lg:p-8 rounded-3xl"
          >
            <div style={{ transform: "translateZ(50px)" }}>
              
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-2xl font-semibold">Create account</h2>
                <div className="glass-soft rounded-full px-2.5 py-1 inline-flex items-center gap-1.5">
                  <Icon icon="ph:sparkle-fill" className="text-aqua text-xs" />
                  <span className="text-aqua text-[10px] font-semibold uppercase tracking-wider">Secure Node</span>
                </div>
              </div>
              <p className="text-white/55 text-sm mb-6">Authenticate via Neural Link or Google.</p>

              {status === "success" ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full border-4 border-aqua mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                    <Icon icon="ph:check-bold" className="text-aqua text-3xl" />
                  </div>
                  <h3 className="text-aqua font-display text-xl font-semibold">Access Granted</h3>
                  <p className="text-white/55 text-sm mt-2">Welcome to the Nexus.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {status === "error" && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono break-words">
                      ERR: {errorMsg}
                    </div>
                  )}

                  {status !== "sent" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="relative">
                        <Icon icon="ph:phone-fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Phone Number (+1...)"
                          className="field-glass w-full rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-white/62"
                          required
                        />
                      </div>
                      
                      {/* Fake Password field just to match the visual spec for Lumen */}
                      <div className="relative">
                        <Icon icon="ph:lock-simple-fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                        <input
                          type="password"
                          placeholder="Password (Visual Only)"
                          className="field-glass w-full rounded-xl py-3 pl-11 pr-10 text-sm placeholder:text-white/62"
                        />
                        <Icon icon="ph:eye" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-lg cursor-pointer hover:text-white transition-colors" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          <div className="h-1 flex-1 rounded-full bg-aqua"></div>
                          <div className="h-1 flex-1 rounded-full bg-aqua"></div>
                          <div className="h-1 flex-1 rounded-full bg-magenta"></div>
                          <div className="h-1 flex-1 rounded-full bg-white/12"></div>
                        </div>
                        <span className="text-xs text-white/55 font-medium">Good</span>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer group mt-2">
                        <div className="relative w-[18px] h-[18px] rounded flex-shrink-0 bg-gradient-to-br from-aqua to-sky p-[1px]">
                          <div className="absolute inset-0 rounded bg-ink opacity-10 group-hover:opacity-0 transition-opacity"></div>
                          <Icon icon="ph:check-bold" className="absolute inset-0 m-auto text-[10px] text-ink z-10" />
                        </div>
                        <span className="text-xs text-white/55 select-none">Email me product tips, no spam.</span>
                      </label>

                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="btn-gradient w-full rounded-xl py-3.5 mt-2 font-semibold text-sm disabled:opacity-50"
                      >
                        {status === "sending" ? "Transmitting..." : "Send Auth Code"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="relative">
                        <Icon icon="ph:key-fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="field-glass w-full rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-white/62 text-center tracking-[0.2em]"
                          maxLength={6}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={status === "verifying"}
                        className="btn-gradient w-full rounded-xl py-3.5 mt-2 font-semibold text-sm disabled:opacity-50"
                      >
                        {status === "verifying" ? "Decrypting..." : "Verify Identity"}
                      </button>
                    </form>
                  )}

                  <div className="flex items-center gap-3 py-1">
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">or continue with</span>
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleGoogleSignIn}
                      disabled={status === "sending" || status === "verifying"}
                      className="glass-soft rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      <Icon icon="logos:google-icon" className="text-lg" />
                      <span className="text-xs font-medium">Google</span>
                    </button>
                    <button className="glass-soft rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                      <Icon icon="ph:github-logo-fill" className="text-lg" />
                      <span className="text-xs font-medium">GitHub</span>
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
