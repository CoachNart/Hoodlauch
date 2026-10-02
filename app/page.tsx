import Link from 'next/link';
import {ArrowRight,ShieldCheck,TrendingUp,Users,Zap} from 'lucide-react';
import Shell from '@/components/Shell';
import TokenCard from '@/components/TokenCard';
import {getCreatedTokens} from '@/lib/onchain';

export const dynamic='force-dynamic';

export default async function Home(){
  const live=await getCreatedTokens();
  const liveTokens=live.map(t=>({address:t.address,name:t.name,symbol:t.symbol,creator:t.creator,description:t.description||'Creator token launched on Robinhood Chain.',marketCap:'—',volume:'—',holders:'—',progress:0,status:'Bonding' as const,color:'violet',logo:t.metadataURI||'https://api.dicebear.com/9.x/shapes/svg?seed='+t.address}));
  return <Shell>
    <main>
      <section className="hero">
        <div className="shell">
          <div className="hero-copy">
            <span className="eyebrow"><i className="dot"/> Permissionless creator launchpad</span>
            <h1>Launch culture.<br/><span>Own the upside.</span></h1>
            <p>Hoodlaunch gives creators a direct path from idea to an onchain token — with transparent reserves, creator fees and a market built around discovery.</p>
            <div className="hero-actions">
              <Link className="btn primary" href="/launch">Launch a token <ArrowRight size={15}/></Link>
              <Link className="btn" href="#discover">Explore launches</Link>
            </div>
          </div>

          <div className="cinematic-stage" aria-label="Cinematic Hoodlaunch network visual">
            <div className="cinematic-image" />
            <div className="cinematic-vignette" />
            <div className="cinematic-scan" />
            <div className="cinematic-glow" />
            <div className="cinematic-top"><span>HOODLAUNCH / LIVE NETWORK</span><b>CHAIN 4663</b></div>
            <div className="cinematic-copy">
              <span className="cinematic-kicker">THE LAUNCH LAYER</span>
              <strong>Ideas move.<br/>Markets form.</strong>
              <p>Real creators. Real tokens. Real onchain activity.</p>
            </div>
            <div className="cinematic-bottom">
              <span><i className="live-dot"/> NETWORK LIVE</span>
              <span>{live.length.toString().padStart(2,'0')} LAUNCHES</span>
              <span>1% CREATOR FEE</span>
            </div>
          </div>

          <div className="metrics">
            <div className="metric"><label>LIVE TOKENS</label><strong>{live.length}</strong></div>
            <div className="metric"><label>CHAIN</label><strong>4663</strong></div>
            <div className="metric"><label>CREATOR FEE</label><strong>1%</strong></div>
            <div className="metric"><label>TRADING</label><strong>ONCHAIN</strong></div>
          </div>
        </div>
      </section>

      <section id="discover" className="section">
        <div className="shell">
          <div className="sectionhead">
            <div><span className="section-kicker">THE MARKET</span><h2>Live launches</h2><p>Every token shown here comes from the configured Hoodlaunch factory.</p></div>
            <div className="filters"><span className="filter active">Onchain</span><span className="filter">Robinhood Chain</span></div>
          </div>
          {liveTokens.length?<div className="grid">{liveTokens.map(t=><TokenCard key={t.address} token={t}/>)}</div>:<div className="card cardpad empty-state"><Zap size={22}/><h3>No launches yet</h3><p className="muted">Deploy the Hoodlaunch factory and create the first token to populate this market.</p><Link className="btn primary" href="/launch">Launch first token <ArrowRight size={14}/></Link></div>}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="card feature">
            <div><span className="eyebrow"><Zap size={12}/> Built for creators</span><h2>Own the launch.<br/><span>Keep earning.</span></h2><p className="muted">Transparent token deployment, a dedicated earnings dashboard, shareable token pages and onchain claim flows — designed as one connected product.</p><Link className="btn primary" href="/launch">Create your first token <ArrowRight size={14}/></Link></div>
            <div className="feature-grid">
              <div className="mini-grid"><div><label><ShieldCheck size={12}/> ONCHAIN</label><strong>Transparent contracts</strong></div><div><label><TrendingUp size={12}/> DISCOVERY</label><strong>Live reserve data</strong></div></div>
              <div className="mini-grid"><div><label><Users size={12}/> CREATOR</label><strong>Own your community</strong></div><div><label><Zap size={12}/> FEES</label><strong>Claimable rewards</strong></div></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </Shell>
}
