import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Diamond, Shield, Zap, TrendingUp, Wallet, Award, ArrowRight, Share2, Star, ArrowLeft } from 'lucide-react';
import { Logo } from "@/components/Logo";
import { useNavigate } from 'react-router-dom';

export default function StyleGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="w-fit h-12 rounded-2xl font-black tracking-widest uppercase hover:bg-white/5 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Platform
        </Button>

        <div className="space-y-4">
          <h1 className="text-5xl font-black v56-gradient-text tracking-tighter">Luxury UI Style Guide</h1>
          <p className="text-muted-foreground text-xl">The visual identity and component standards for Gold X Usdt ($500,000 Premium Redesign)</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Diamond className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Brand Palette</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-primary shadow-glow" />
            <p className="text-xs font-black uppercase tracking-widest text-center">Primary Gold</p>
            <p className="text-[10px] text-muted-foreground text-center">#D4AF37</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-[#0A0A0A] border border-white/5" />
            <p className="text-xs font-black uppercase tracking-widest text-center">Background Black</p>
            <p className="text-[10px] text-muted-foreground text-center">#0A0A0A</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-[#121212] border border-white/5" />
            <p className="text-xs font-black uppercase tracking-widest text-center">Surface Surface</p>
            <p className="text-[10px] text-muted-foreground text-center">#121212</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-[#1A1A1A] border border-white/5" />
            <p className="text-xs font-black uppercase tracking-widest text-center">Muted Elements</p>
            <p className="text-[10px] text-muted-foreground text-center">#1A1A1A</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-accent shadow-glow" />
            <p className="text-xs font-black uppercase tracking-widest text-center">Accent Shine</p>
            <p className="text-[10px] text-muted-foreground text-center">#FFD700</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Typography</h2>
        </div>
        <div className="v56-glass p-8 rounded-[2rem] border border-white/5 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Display Heading</p>
                 <h1 className="text-6xl font-black italic tracking-tighter italic leading-none">The Gold <br />Standard</h1>
                 <p className="text-xs text-muted-foreground italic">Montserrat Black Italic / -0.05em tracking</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">UI Heading</p>
                 <h2 className="text-3xl font-bold uppercase tracking-widest">Wealth Projection</h2>
                 <p className="text-xs text-muted-foreground italic">Inter Bold / 0.1em tracking / Uppercase</p>
              </div>
           </div>
           <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Body Text</p>
                 <p className="text-lg leading-relaxed text-muted-foreground">Join thousands of satisfied investors who are already building their wealth with Gold X Usdt. Don't wait for opportunity—create it today.</p>
                 <p className="text-xs text-muted-foreground italic">Inter Medium / 1.6 leading / #888888</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Technical / Mono</p>
                 <p className="text-2xl font-mono font-bold tracking-widest">$12,450.00 USDT</p>
                 <p className="text-xs text-muted-foreground italic">Inter font-mono / tabular-nums</p>
              </div>
           </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Premium Components</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="v56-glass premium-border group">
            <CardHeader>
              <div className="p-3 w-fit rounded-2xl bg-primary/10 border border-primary/20 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Glassmorphism Card</CardTitle>
              <CardDescription>24px background blur with 1.5px adaptive gold border stroke.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="premium-gradient w-full group">
                Interactive CTA <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="luxury-card border-none bg-black/40 overflow-hidden relative group p-6">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="space-y-4">
                <Badge variant="outline" className="border-primary/30 text-primary font-bold tracking-[0.2em] uppercase text-[10px]">Premium Feature</Badge>
                <h3 className="text-2xl font-black italic">The Gold Standard</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">A specialized container for high-end content with hover-activated accents and subtle background gradients.</p>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Star size={16} className="text-primary" /></div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Award size={16} className="text-primary" /></div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Share2 size={16} className="text-primary" /></div>
                </div>
             </div>
          </Card>

          <div className="space-y-4">
            <div className="v56-glass p-6 rounded-3xl border border-white/5 space-y-4">
               <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Premium Data Entry</Label>
               <Input className="v56-glass-input h-14 border-primary/20 focus:border-primary/50 text-lg" placeholder="Enter Amount..." />
               <div className="flex gap-2">
                 <Button variant="outline" className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10">Cancel</Button>
                 <Button className="flex-1 h-12 rounded-xl premium-gradient">Confirm</Button>
               </div>
            </div>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Wallet className="text-primary h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Portfolio Value</p>
                  <p className="font-bold tabular-nums">$1,245.00</p>
                </div>
              </div>
              <TrendingUp className="text-green-500 h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Award className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Visual Hierarchy</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-7xl font-black v56-gradient-text tracking-tighter leading-tight italic">Luxury <br />Experience</h1>
                <p className="text-2xl text-muted-foreground font-medium">Elevating every digital touchpoint through sophisticated typography and spacing.</p>
              </div>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-muted-foreground">We use Montserrat for authoritative headings to evoke a sense of heritage and stability, while Inter provides a clean, readable body text that ensures complex information is accessible.</p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="rounded-full px-8 py-6 uppercase tracking-widest font-black text-xs border-primary/20 hover:bg-primary/5">Platform Guidelines</Button>
                  <Button variant="ghost" className="rounded-full px-8 py-6 uppercase tracking-widest font-black text-xs hover:bg-white/5">Visual Assets</Button>
                </div>
              </div>
           </div>
           
           <div className="v56-glass rounded-[2rem] p-2 relative">
              <div className="bg-black/60 backdrop-blur-3xl rounded-[1.8rem] overflow-hidden border border-white/5">
                <div className="p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <Logo size={48} />
                    <div className="text-right">
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Live Market</p>
                      <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none px-4 py-1 font-bold">BULLISH MARKET</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm uppercase font-black tracking-widest opacity-60">
                           <span>Account Status</span>
                           <span>Premium</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full w-[85%] bg-primary shadow-glow" />
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Direct ROI</p>
                           <p className="text-3xl font-black text-primary italic">+10.0%</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Network</p>
                           <p className="text-3xl font-black text-white italic">LVL 15</p>
                        </div>
                     </div>
                  </div>

                  <Button className="w-full h-14 rounded-2xl premium-gradient text-lg font-bold shadow-luxury">
                    ACCESS PORTFOLIO
                  </Button>
                </div>
              </div>
           </div>
        </div>
      </section>

      <section className="p-12 rounded-[3rem] bg-luxury-gradient border border-primary/10 relative overflow-hidden text-center space-y-8">
         <div className="absolute top-0 left-0 w-full h-full bg-gold-shimmer opacity-10 animate-luxury-shimmer pointer-events-none" />
         <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">Ready to Experience Gold?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">Join the world's most sophisticated gold investment ecosystem. Designed for the discerning elite, built for the future of finance.</p>
            <div className="flex justify-center gap-6">
              <Button size="lg" className="premium-gradient px-12 h-16 rounded-2xl font-black tracking-widest uppercase shadow-luxury group">
                Join VIP Access <Diamond className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
         </div>
      </section>
    </div>
  );
}
