import React from "react";
import { Icon } from "@iconify/react";

export function LumenNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#0b0f14]/60 backdrop-blur-[18px] saturate-[140%] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aqua to-magenta flex items-center justify-center">
            <Icon icon="ph:diamonds-four-fill" className="text-ink text-lg" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Lumen</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/65">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
          <a href="#" className="hover:text-white transition-colors">Prompt Library</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#" className="hidden sm:block text-sm font-medium text-white/65 hover:text-white transition-colors">Sign in</a>
          <button className="btn-gradient px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
            Start free
            <Icon icon="ph:arrow-right-bold" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export function LumenTrust() {
  return (
    <div className="border-t border-white/[0.08] py-8 w-full max-w-7xl mx-auto px-6 lg:px-8">
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold mb-6">Trusted by design teams shipping fast</p>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
        <div className="flex items-center gap-2 font-display text-lg"><Icon icon="ph:orange-slice-fill" /> Northwind</div>
        <div className="flex items-center gap-2 font-display text-lg"><Icon icon="ph:planet-fill" /> Orbit</div>
        <div className="flex items-center gap-2 font-display text-lg"><Icon icon="ph:hexagon-fill" /> Halcyon</div>
        <div className="flex items-center gap-2 font-display text-lg"><Icon icon="ph:lightning-fill" /> Voltage</div>
        <div className="flex items-center gap-2 font-display text-lg"><Icon icon="ph:cube-fill" /> Forma</div>
      </div>
    </div>
  );
}

export function LumenFeatures() {
  return (
    <section className="relative py-24 border-t border-white/[0.08] max-w-7xl mx-auto px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(45,212,191,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl mb-16">
        <div className="inline-flex items-center gap-2 bg-aqua/10 border border-aqua/30 rounded-full px-3 py-1 mb-6">
          <Icon icon="ph:stack-fill" className="text-aqua-light text-sm" />
          <span className="text-aqua-light text-xs font-medium uppercase tracking-wider">Why Lumen</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
          Every detail a great form needs, <span className="text-gradient-clip">by default.</span>
        </h2>
        <p className="text-white/60 text-lg">Build robust interfaces without reinventing the wheel.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {[
          { icon: "ph:cursor-click-fill", title: "Focus-aware fields", color: "text-aqua", border: "border-aqua/30", bg: "bg-aqua/10" },
          { icon: "ph:shield-check-fill", title: "Validation built in", color: "text-magenta", border: "border-magenta/30", bg: "bg-magenta/10" },
          { icon: "ph:devices-fill", title: "Responsive out of the box", color: "text-sky", border: "border-sky/30", bg: "bg-sky/10" },
          { icon: "ph:code-fill", title: "Clean Tailwind export", color: "text-magenta", border: "border-magenta/30", bg: "bg-magenta/10" },
          { icon: "ph:infinity-fill", title: "Infinite canvas", color: "text-sky", border: "border-sky/30", bg: "bg-sky/10" },
          { icon: "ph:palette-fill", title: "Theme tokens", color: "text-aqua", border: "border-aqua/30", bg: "bg-aqua/10" },
        ].map((feat, i) => (
          <div key={i} className="glass-soft p-6 rounded-2xl hover:border-white/20 transition-colors group cursor-default">
            <div className={`w-11 h-11 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center mb-5`}>
              <Icon icon={feat.icon} className={`${feat.color} text-xl`} />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">{feat.title}</h3>
            <p className="text-sm text-white/55 leading-relaxed">
              Automatic styling, robust interaction states, and perfect contrast ratios handled for you instantly.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LumenShowcase() {
  return (
    <section className="relative py-28 border-t border-white/[0.08] w-full bg-[linear-gradient(180deg,rgba(45,212,191,0.03)_0%,transparent_100%)] overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.4)_0%,transparent_70%)] blur-[80px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(232,121,249,0.3)_0%,transparent_70%)] blur-[80px] pointer-events-none opacity-40" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-aqua/10 border border-aqua/30 rounded-full px-3 py-1 mb-6">
            <Icon icon="ph:squares-four-fill" className="text-aqua-light text-sm" />
            <span className="text-aqua-light text-xs font-medium uppercase tracking-wider">One prompt, many forms</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
            From sign-in to checkout, <span className="text-gradient-clip">all glass.</span>
          </h2>
          <p className="text-white/60 text-lg">Consistent token systems scale effortlessly.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Form 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-2">
              <Icon icon="ph:terminal-window-fill" /> a minimal login
            </div>
            <div className="glass-heavy p-6 rounded-3xl flex-1">
              <h3 className="font-display text-xl font-semibold mb-4">Welcome back</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Email" className="field-glass w-full rounded-xl py-2.5 px-4 text-sm placeholder:text-white/62" />
                <input type="password" placeholder="Password" className="field-glass w-full rounded-xl py-2.5 px-4 text-sm placeholder:text-white/62" />
                <button className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm mt-2">Sign in</button>
              </div>
            </div>
          </div>

          {/* Form 2 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-2">
              <Icon icon="ph:terminal-window-fill" /> a card checkout
            </div>
            <div className="glass-heavy p-6 rounded-3xl flex-1">
              <h3 className="font-display text-xl font-semibold mb-4">Payment</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input type="text" defaultValue="4242 4242 4242 42" className="field-glass w-full rounded-xl py-2.5 pl-4 pr-10 text-sm !border-aqua/85 shadow-[0_0_0_3px_rgba(45,212,191,0.2),0_0_28px_rgba(45,212,191,0.4)] outline-none" />
                  <Icon icon="ph:credit-card-fill" className="absolute right-3 top-1/2 -translate-y-1/2 text-aqua" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" className="field-glass w-full rounded-xl py-2.5 px-4 text-sm placeholder:text-white/62" />
                  <input type="text" placeholder="CVC" className="field-glass w-full rounded-xl py-2.5 px-4 text-sm placeholder:text-white/62" />
                </div>
                <button className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm mt-2">Pay $29.00</button>
              </div>
            </div>
          </div>

          {/* Form 3 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-2">
              <Icon icon="ph:terminal-window-fill" /> a feedback form
            </div>
            <div className="glass-heavy p-6 rounded-3xl flex-1">
              <h3 className="font-display text-xl font-semibold mb-4">Tell us more</h3>
              <div className="space-y-4">
                <div>
                  <input type="text" defaultValue="bad-email@" className="field-glass field-glass-error w-full rounded-xl py-2.5 px-4 text-sm" />
                  <div className="flex items-center gap-1.5 mt-2 text-red-400 text-[11px] font-medium">
                    <Icon icon="ph:warning-circle-fill" /> Enter a valid email
                  </div>
                </div>
                <textarea rows={2} placeholder="Message" className="field-glass w-full rounded-xl py-2.5 px-4 text-sm placeholder:text-white/62 resize-none" />
                <button className="glass-soft w-full py-3 rounded-xl font-semibold text-sm mt-2 hover:bg-white/10 transition-colors">Send feedback</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export function LumenPromptLibrary() {
  return (
    <section className="border-t border-white/[0.08] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 bg-aqua/10 border border-aqua/30 rounded-full px-3 py-1 mb-6">
            <Icon icon="ph:books-fill" className="text-aqua-light text-sm" />
            <span className="text-aqua-light text-xs font-medium uppercase tracking-wider">Library</span>
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight mb-4 pr-8">
            Start from a prompt that <span className="text-gradient-clip">already works.</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Copy tested layouts to jumpstart your workflow.</p>
          <a href="#" className="inline-flex items-center gap-2 text-aqua hover:text-aqua-light transition-colors group font-semibold text-sm">
            Explore the library
            <Icon icon="ph:arrow-right-bold" className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          {[
            { icon: "ph:sign-in-fill", txt: "A minimal login form with email, password, and a Google social button." },
            { icon: "ph:credit-card-fill", txt: "A Stripe-style checkout with card number, expiry, cvc, and dark glass style." },
            { icon: "ph:user-circle-plus-fill", txt: "Onboarding step 1: Avatar upload, display name, and bio textarea." },
            { icon: "ph:gear-fill", txt: "Account settings with notification toggles and a danger zone delete." },
          ].map((item, i) => (
            <div key={i} className="glass-soft p-5 rounded-2xl flex flex-col hover:border-aqua/40 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <Icon icon={item.icon} className="text-white/50 text-xl group-hover:text-aqua transition-colors" />
                <span className="text-[10px] uppercase tracking-wider font-mono text-white/30 border border-white/10 px-2 py-0.5 rounded">copy</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-mono mt-auto">"{item.txt}"</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function LumenPricing() {
  return (
    <section className="relative py-32 border-t border-white/[0.08] overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(232,121,249,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
          Ship the form, <span className="text-gradient-clip">not the busywork.</span>
        </h2>
        <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
          Design, validate, and deploy beautiful interfaces in seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <button className="btn-gradient px-8 py-3.5 rounded-full font-medium text-sm inline-flex items-center gap-2 w-full sm:w-auto justify-center">
            Start designing free
            <Icon icon="ph:arrow-right-bold" className="text-lg" />
          </button>
          <button className="glass-soft px-8 py-3.5 rounded-full font-medium text-sm text-white hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
            Talk to us
          </button>
        </div>
        <p className="text-white/65 text-sm">Free forever for solo builders. Pro from $19/mo.</p>
      </div>
    </section>
  );
}

export function LumenFooter() {
  return (
    <footer className="border-t border-white/[0.08] py-12 max-w-7xl mx-auto px-6 lg:px-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-aqua to-magenta flex items-center justify-center">
            <Icon icon="ph:diamonds-four-fill" className="text-ink text-[10px]" />
          </div>
          <span className="font-display font-semibold tracking-tight">Lumen</span>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/65">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Library</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
        
        <div className="flex items-center gap-4 text-white/50">
          <a href="#" className="hover:text-white transition-colors"><Icon icon="ph:x-logo-fill" className="text-xl" /></a>
          <a href="#" className="hover:text-white transition-colors"><Icon icon="ph:github-logo-fill" className="text-xl" /></a>
          <a href="#" className="hover:text-white transition-colors"><Icon icon="ph:discord-logo-fill" className="text-xl" /></a>
        </div>
      </div>
      <div className="text-center md:text-left text-xs text-white/65">
        © 2026 Lumen Design. Forms that feel like glass.
      </div>
    </footer>
  );
}
