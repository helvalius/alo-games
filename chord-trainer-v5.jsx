import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#1a2f3a", surface:"#264653", surf2:"#1e3a47",
  teal:"#2a9d8f", yellow:"#e9c46a", orange:"#f4a261",
  coral:"#e76f51", text:"#f0ebe0", textDim:"#7aacb8", dim:"#3a5a6a",
};

// ── Voicings ──────────────────────────────────────────────────────────────────
// frets: [low-E … high-e]  -1=muted  0=open  n=fret
// fingers: null=no dot label  1-4=finger
// barre: [fromStrIdx, toStrIdx, fretNum]
const VOICINGS = {
  E:[
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[0,2,2,1,0,0],   sf:1, fingers:[null,2,3,1,null,null]},
    {id:"power",    cat:"Anfänger",   label:"E5 Power Chord",  frets:[0,2,2,-1,-1,-1],sf:1, fingers:[null,1,2,null,null,null],  note:"Nur Grundton + Quinte"},
    {id:"e7",       cat:"Beliebt",    label:"E7",              frets:[0,2,0,1,0,0],   sf:1, fingers:[null,2,null,1,null,null],  note:"Dominant 7 – bluesig"},
    {id:"e9",       cat:"Alternativ", label:"E9",              frets:[0,2,2,1,3,2],   sf:1, fingers:[null,2,3,1,4,null],        note:"Funky, Soul & R&B"},
  ],
  Em:[
    {id:"1finger",  cat:"Anfänger",   label:"Em7 (1 Finger)",  frets:[0,2,0,0,0,0],   sf:1, fingers:[null,1,null,null,null,null], note:"1 Finger – ideal zum Einstieg"},
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[0,2,2,0,0,0],   sf:1, fingers:[null,2,3,null,null,null]},
    {id:"em7",      cat:"Beliebt",    label:"Em7",             frets:[0,2,2,0,3,3],   sf:1, fingers:[null,1,2,null,3,4],         note:"Sehr beliebt in Pop & Folk"},
    {id:"barre",    cat:"Alternativ", label:"Barre (7. Bund)", frets:[7,9,9,7,7,7],   sf:7, barre:[0,5,7], fingers:[null,3,4,null,null,null], note:"E-Shape Barre"},
  ],
  A:[
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[-1,0,2,2,2,0],  sf:1, fingers:[null,null,1,2,3,null]},
    {id:"barre2",   cat:"Anfänger",   label:"Index Barre",     frets:[-1,0,2,2,2,0],  sf:1, fingers:[null,null,1,1,1,null],      note:"Index quer über Saiten 2–4"},
    {id:"a7",       cat:"Beliebt",    label:"A7",              frets:[-1,0,2,0,2,0],  sf:1, fingers:[null,null,2,null,3,null],  note:"Blues & Country"},
    {id:"barre5",   cat:"Alternativ", label:"Barre (5. Bund)", frets:[5,7,7,6,5,5],   sf:5, barre:[0,5,5], fingers:[null,3,4,2,null,null]},
  ],
  Am:[
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[-1,0,2,2,1,0],  sf:1, fingers:[null,null,2,3,1,null]},
    {id:"power",    cat:"Anfänger",   label:"Am Power",        frets:[-1,0,2,2,-1,-1],sf:1, fingers:[null,null,1,2,null,null],   note:"Nur 2 Finger nötig"},
    {id:"am7",      cat:"Beliebt",    label:"Am7",             frets:[-1,0,2,0,1,0],  sf:1, fingers:[null,null,2,null,1,null],  note:"Weicher, jazziger Klang"},
    {id:"barre5",   cat:"Alternativ", label:"Barre (5. Bund)", frets:[5,7,7,5,5,5],   sf:5, barre:[0,5,5], fingers:[null,3,4,null,null,null]},
  ],
  D:[
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[-1,-1,0,2,3,2], sf:1, fingers:[null,null,null,1,3,2]},
    {id:"dadd9",    cat:"Beliebt",    label:"Dadd9",           frets:[-1,-1,0,2,3,0], sf:1, fingers:[null,null,null,1,2,null],  note:"Offener Klang – Pop & Rock"},
    {id:"d7",       cat:"Alternativ", label:"D7",              frets:[-1,-1,0,2,1,2], sf:1, fingers:[null,null,null,2,1,3],    note:"Dominant 7"},
    {id:"barre5",   cat:"Alternativ", label:"Barre (5. Bund)", frets:[5,5,7,7,7,5],   sf:5, barre:[0,5,5], fingers:[null,null,2,3,4,null]},
  ],
  Dm:[
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[-1,-1,0,2,3,1], sf:1, fingers:[null,null,null,2,3,1]},
    {id:"dm7",      cat:"Beliebt",    label:"Dm7",             frets:[-1,-1,0,2,1,1], sf:1, barre:[4,5,1], fingers:[null,null,null,2,null,null], note:"Jazz-Variante"},
    {id:"barre5",   cat:"Alternativ", label:"Barre (5. Bund)", frets:[5,5,7,7,6,5],   sf:5, barre:[0,5,5], fingers:[null,null,3,4,2,null]},
  ],
  G:[
    {id:"beginner", cat:"Anfänger",   label:"3-Finger G",          frets:[3,2,0,0,0,3], sf:1, fingers:[2,1,null,null,null,3],    note:"Klassische Einstiegsvariante"},
    {id:"standard", cat:"Standard",   label:"Standard (4-Finger)", frets:[3,2,0,0,3,3], sf:1, fingers:[2,1,null,null,3,4],       note:"Vollerer, kräftigerer Klang"},
    {id:"barre3",   cat:"Beliebt",    label:"Barre (3. Bund)",     frets:[3,5,5,4,3,3], sf:3, barre:[0,5,3], fingers:[null,3,4,2,null,null]},
    {id:"g7",       cat:"Alternativ", label:"G7",                  frets:[3,2,0,0,0,1], sf:1, fingers:[3,2,null,null,null,1],    note:"Dominant 7"},
  ],
  C:[
    {id:"standard", cat:"Standard",   label:"Standard",        frets:[-1,3,2,0,1,0],  sf:1, fingers:[null,3,2,null,1,null]},
    {id:"beginner", cat:"Anfänger",   label:"Mini C (3 Saiten)",frets:[-1,-1,2,0,1,0],sf:1, fingers:[null,null,3,null,1,null],  note:"Nur 3 Saiten – leichter Einstieg"},
    {id:"cadd9",    cat:"Beliebt",    label:"Cadd9",           frets:[-1,3,2,0,3,3],  sf:1, fingers:[null,3,2,null,4,4],        note:"Sehr beliebt in Pop"},
    {id:"barre3",   cat:"Alternativ", label:"Barre (3. Bund)", frets:[-1,3,5,5,5,3],  sf:3, barre:[1,5,3], fingers:[null,null,2,3,4,null]},
  ],
  F:[
    {id:"mini",     cat:"Anfänger",   label:"Mini F (4 Saiten)",frets:[-1,-1,3,2,1,1],sf:1, barre:[4,5,1], fingers:[null,null,3,2,null,null], note:"Kein voller Barre nötig"},
    {id:"fmaj7",    cat:"Beliebt",    label:"Fmaj7",           frets:[-1,-1,3,2,1,0], sf:1, fingers:[null,null,3,2,1,null],    note:"Weicher Klang, kein Barre"},
    {id:"standard", cat:"Standard",   label:"Barre (Standard)",frets:[1,1,2,3,3,1],   sf:1, barre:[0,5,1], fingers:[null,null,2,3,4,null]},
    {id:"barre8",   cat:"Alternativ", label:"Barre (8. Bund)", frets:[8,10,10,9,8,8], sf:8, barre:[0,5,8], fingers:[null,3,4,2,null,null],   note:"E-Shape, höhere Lage"},
  ],
  Bm:[
    {id:"mini",     cat:"Anfänger",   label:"Mini Bm",         frets:[-1,2,4,4,-1,-1],sf:2, fingers:[null,1,3,4,null,null],    note:"Ohne Barre, 3 Finger"},
    {id:"standard", cat:"Standard",   label:"Barre Standard",  frets:[-1,2,4,4,3,2],  sf:2, barre:[1,5,2], fingers:[null,null,3,4,2,null]},
    {id:"bm7",      cat:"Beliebt",    label:"Bm7",             frets:[-1,2,4,2,3,2],  sf:2, barre:[1,5,2], fingers:[null,null,3,null,4,null], note:"Weicher Klang"},
  ],
  B:[
    {id:"b7",       cat:"Anfänger",   label:"B7",              frets:[-1,2,1,2,0,2],  sf:1, fingers:[null,2,1,3,null,4],       note:"Einfacher als Barre"},
    {id:"standard", cat:"Standard",   label:"Barre Standard",  frets:[-1,2,4,4,4,2],  sf:2, barre:[1,5,2], fingers:[null,null,2,3,4,null]},
    {id:"barre7",   cat:"Alternativ", label:"Barre (7. Bund)", frets:[7,9,9,8,7,7],   sf:7, barre:[0,5,7], fingers:[null,3,4,2,null,null],   note:"E-Shape"},
  ],
  "F#m":[
    {id:"mini",     cat:"Anfänger",   label:"Mini F#m",        frets:[-1,-1,4,6,7,5], sf:4, fingers:[null,null,1,3,4,2],       note:"Ohne Low-Barre"},
    {id:"standard", cat:"Standard",   label:"Barre Standard",  frets:[2,4,4,2,2,2],   sf:2, barre:[0,5,2], fingers:[null,3,4,null,null,null]},
    {id:"f#m7",     cat:"Beliebt",    label:"F#m7",            frets:[2,4,4,2,5,2],   sf:2, barre:[0,5,2], fingers:[null,2,3,null,4,null],   note:"Jazziger Klang"},
  ],
  "C#m":[
    {id:"mini",     cat:"Anfänger",   label:"Mini C#m",        frets:[-1,-1,6,6,5,4], sf:4, fingers:[null,null,3,4,2,1],       note:"Ohne A-Saite"},
    {id:"standard", cat:"Standard",   label:"Barre Standard",  frets:[-1,4,6,6,5,4],  sf:4, barre:[1,5,4], fingers:[null,null,3,4,2,null]},
    {id:"c#m7",     cat:"Beliebt",    label:"C#m7",            frets:[-1,4,6,4,5,4],  sf:4, barre:[1,5,4], fingers:[null,null,3,null,4,null], note:"Smooth Jazz/Pop"},
  ],
  "G#m":[
    {id:"mini",     cat:"Anfänger",   label:"Mini G#m",        frets:[-1,-1,6,8,8,6], sf:6, barre:[2,5,6], fingers:[null,null,null,3,4,null], note:"Ohne Bass-Saiten"},
    {id:"standard", cat:"Standard",   label:"Barre Standard",  frets:[4,6,6,4,4,4],   sf:4, barre:[0,5,4], fingers:[null,3,4,null,null,null]},
  ],
};

const KEY_CHORDS = {
  C:["C","Dm","Em","F","G","Am",null],
  G:["G","Am","Bm","C","D","Em",null],
  D:["D","Em","F#m","G","A","Bm",null],
  A:["A","Bm","C#m","D","E","F#m",null],
  E:["E","F#m","G#m","A","B","C#m",null],
};

const PROGRESSIONS = [
  {label:"I – IV – V",       d:[0,3,4]},
  {label:"I – V – vi – IV",  d:[0,4,5,3]},
  {label:"I – vi – IV – V",  d:[0,5,3,4]},
  {label:"ii – V – I",       d:[1,4,0]},
  {label:"I – IV – I – V",   d:[0,3,0,4]},
  {label:"12-Bar Blues",     d:[0,0,0,0,3,3,0,0,4,3,0,4]},
];

const ROMAN = ["I","ii","iii","IV","V","vi","vii°"];
const CATS   = ["Anfänger","Standard","Beliebt","Alternativ"];

function getVoicing(name, selectedId) {
  const vs = VOICINGS[name];
  if (!vs) return null;
  return vs.find(v=>v.id===selectedId) || vs.find(v=>v.id==="standard") || vs[0];
}

// ── SVG Diagram ───────────────────────────────────────────────────────────────
function Diagram({ name, voicing, active, size }) {
  if (!voicing) return null;
  const { frets, sf, barre, fingers } = voicing;

  const big = size === "big";
  const ML = big?20:16, MT = big?32:28, SS = big?14:12, FS = big?20:18, NF = 4;
  const sx = i => ML + i*SS;
  const fy = j => MT + j*FS;
  const W  = big?108:88,  H = big?126:108;

  const lineCol  = active ? "#a8dce8" : "#6a9aaa";
  const nutCol   = active ? C.yellow  : "#a8ccd8";
  const openCol  = active ? C.yellow  : "#a8ccd8";
  const mutedCol = "#4a7a8a";
  const barreCol = active ? C.teal    : "#5a9aaa";
  const dotCol   = active ? C.yellow  : C.orange;
  const numCol   = C.bg;

  const dots = frets.map((fr,i)=>{
    if(fr<=0) return null;
    return {x:sx(i), y:fy(fr-sf)+FS/2, f:fingers?.[i]??null, k:`d${i}`};
  }).filter(Boolean);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      {/* Strings */}
      {[0,1,2,3,4,5].map(i=>(
        <line key={`s${i}`} x1={sx(i)} y1={MT} x2={sx(i)} y2={fy(NF)}
          stroke={lineCol} strokeWidth={i===0||i===5?1.2:0.7}/>
      ))}
      {/* Frets */}
      {[0,1,2,3,4].map(j=>(
        <line key={`f${j}`} x1={sx(0)} y1={fy(j)} x2={sx(5)} y2={fy(j)}
          stroke={j===0&&sf===1?nutCol:lineCol}
          strokeWidth={j===0&&sf===1?3.5:0.7}/>
      ))}
      {/* Fret label */}
      {sf>1 && (
        <text x={sx(0)-6} y={fy(0)+FS/2+4} fontSize={8} fill={C.textDim}
          textAnchor="end" fontFamily="sans-serif">{sf}fr</text>
      )}
      {/* Open / muted */}
      {frets.map((fr,i)=>{
        if(fr===0)  return <circle key={`o${i}`} cx={sx(i)} cy={MT-11} r={big?5.5:4.5} fill="none" stroke={openCol} strokeWidth={1.5}/>;
        if(fr===-1) return <g key={`x${i}`}>
          <line x1={sx(i)-4} y1={MT-16} x2={sx(i)+4} y2={MT-8} stroke={mutedCol} strokeWidth={1.5}/>
          <line x1={sx(i)+4} y1={MT-16} x2={sx(i)-4} y2={MT-8} stroke={mutedCol} strokeWidth={1.5}/>
        </g>;
        return null;
      })}
      {/* Barre */}
      {barre&&(()=>{
        const [fs,ts,bf]=barre;
        const by=fy(bf-sf)+FS/2;
        return <>
          <line x1={sx(fs)} y1={by} x2={sx(ts)} y2={by}
            stroke={barreCol} strokeWidth={big?14:12} strokeLinecap="round" opacity={0.9}/>
          <text x={(sx(fs)+sx(ts))/2} y={by+4} fontSize={big?10:9} textAnchor="middle"
            fill={C.bg} fontFamily="sans-serif" fontWeight="bold">1</text>
        </>;
      })()}
      {/* Dots */}
      {dots.map(({x,y,f,k})=>(
        <g key={k}>
          <circle cx={x} cy={y} r={big?9:8} fill={dotCol}/>
          {f && <text x={x} y={y+4} fontSize={big?11:10} textAnchor="middle"
            fill={numCol} fontFamily="sans-serif" fontWeight="bold">{f}</text>}
        </g>
      ))}
    </svg>
  );
}

// ── Progression chord card ────────────────────────────────────────────────────
function ChordCard({ name, voicing, active, roman, beat, bpc, playing, onClick }) {
  const selId = voicing?.id;
  const vs    = VOICINGS[name];
  const hasAlts = vs && vs.length > 1;

  return (
    <div onClick={onClick} style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      padding:"12px 10px 10px",
      borderRadius:10,
      background: active ? "rgba(42,157,143,0.15)" : "rgba(255,255,255,0.03)",
      border:`2px solid ${active?C.teal:C.dim}`,
      cursor:"pointer",
      transition:"all 0.2s",
      position:"relative",
    }}>
      {/* Voicing tag */}
      {selId && selId!=="standard" && (
        <div style={{
          position:"absolute",top:4,right:6,
          fontSize:8,color:C.orange,letterSpacing:1,opacity:0.8,
        }}>{voicing?.label?.split(" ")[0]}</div>
      )}
      {hasAlts && (
        <div style={{position:"absolute",top:4,left:6,fontSize:9,color:C.dim}}>⋯</div>
      )}

      <div style={{
        fontFamily:"'Barlow Condensed',sans-serif",
        fontWeight:800, fontSize:18,
        color: active?C.yellow:C.text,
        textShadow: active?`0 0 14px ${C.yellow}88`:"none",
        letterSpacing:1,
      }}>{name}</div>

      <Diagram name={name} voicing={voicing} active={active}/>

      <div style={{fontSize:10,color:active?C.orange:C.dim,letterSpacing:2,fontWeight:700}}>
        {roman}
      </div>
      {active && playing && (
        <div style={{display:"flex",gap:5,marginTop:2}}>
          {Array.from({length:bpc}).map((_,i)=>(
            <div key={i} style={{
              width:7,height:7,borderRadius:"50%",
              background: i===beat?C.coral:C.dim,
              boxShadow: i===beat?`0 0 10px ${C.coral}`:"none",
              transition:"background 0.05s",
            }}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail / Voicing picker ───────────────────────────────────────────────────
function DetailView({ chord, currentVoicingId, onSelect, onBack }) {
  const vs = VOICINGS[chord] || [];

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
        <button onClick={onBack} style={{
          padding:"8px 14px",fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:700, fontSize:14, letterSpacing:2,
          background:"transparent", color:C.textDim,
          border:`1.5px solid ${C.dim}`, borderRadius:8, cursor:"pointer",
        }}>← ZURÜCK</button>
        <div style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:800, fontSize:34, color:C.yellow, letterSpacing:3,
        }}>{chord}</div>
        <div style={{fontSize:11,color:C.dim,alignSelf:"flex-end",paddingBottom:4}}>
          — Spielweisen
        </div>
      </div>

      {CATS.map(cat=>{
        const group = vs.filter(v=>v.cat===cat);
        if(!group.length) return null;
        return (
          <div key={cat} style={{marginBottom:20}}>
            <div style={{
              fontSize:9,color:C.teal,letterSpacing:3,marginBottom:10,
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,
            }}>{cat.toUpperCase()}</div>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",
              gap:12,
            }}>
              {group.map(v=>{
                const sel = v.id===currentVoicingId || (!currentVoicingId&&v.id==="standard");
                return (
                  <div key={v.id} onClick={()=>onSelect(v.id)} style={{
                    padding:"12px 10px",borderRadius:10,
                    background: sel?"rgba(233,196,106,0.12)":"rgba(255,255,255,0.03)",
                    border:`2px solid ${sel?C.yellow:C.dim}`,
                    cursor:"pointer", transition:"all 0.15s",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  }}>
                    <Diagram name={chord} voicing={v} active={sel} size="big"/>
                    <div style={{
                      fontFamily:"'Barlow Condensed',sans-serif",
                      fontWeight:700, fontSize:14,
                      color:sel?C.yellow:C.text, textAlign:"center",
                    }}>{v.label}</div>
                    {v.note && (
                      <div style={{
                        fontSize:9,color:C.textDim,textAlign:"center",
                        lineHeight:1.4, letterSpacing:0.3,
                      }}>{v.note}</div>
                    )}
                    {sel && (
                      <div style={{
                        fontSize:9,color:C.teal,letterSpacing:2,fontWeight:700,
                        fontFamily:"'Barlow Condensed',sans-serif",
                      }}>✓ AUSGEWÄHLT</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function ChordTrainer() {
  const [key,       setKey]       = useState("G");
  const [progIdx,   setProgIdx]   = useState(0);
  const [bpm,       setBpm]       = useState(72);
  const [bpc,       setBpc]       = useState(4);
  const [playing,   setPlaying]   = useState(false);
  const [chordIdx,  setChordIdx]  = useState(0);
  const [beat,      setBeat]      = useState(0);
  const [flash,     setFlash]     = useState(false);
  const [tab,       setTab]       = useState("trainer");
  const [detail,    setDetail]    = useState(null);            // chordName | null
  const [selected,  setSelected]  = useState({});             // {chordName: voicingId}

  const audioRef=useRef(null); const timerRef=useRef(null);
  const beatR=useRef(0); const chordR=useRef(0);
  const bpcR=useRef(bpc); const chordsR=useRef([]);
  const tapRef=useRef([]);

  const prog       = PROGRESSIONS[progIdx];
  const chordNames = prog.d.map(d=>KEY_CHORDS[key][d]).filter(n=>n&&VOICINGS[n]);

  useEffect(()=>{bpcR.current=bpc;},[bpc]);
  useEffect(()=>{chordsR.current=chordNames;},[chordNames.join(",")]);
  useEffect(()=>{
    if(playing) stopM();
    beatR.current=0; chordR.current=0; setChordIdx(0); setBeat(0);
  },[key,progIdx]);

  const getCtx=()=>{if(!audioRef.current)audioRef.current=new AudioContext();return audioRef.current;};
  const click=(acc)=>{
    const ctx=getCtx(),osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g);g.connect(ctx.destination);
    osc.frequency.value=acc?1050:700;
    g.gain.setValueAtTime(acc?0.5:0.3,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08);
    osc.start();osc.stop(ctx.currentTime+0.08);
  };
  const tick=useCallback(()=>{
    click(beatR.current===0);
    setFlash(true); setTimeout(()=>setFlash(false),100);
    setBeat(beatR.current);
    beatR.current=(beatR.current+1)%bpcR.current;
    if(beatR.current===0){
      const n=(chordR.current+1)%chordsR.current.length;
      chordR.current=n; setChordIdx(n);
    }
  },[]);

  const startM=()=>{beatR.current=0;setPlaying(true);const ms=(60/bpm)*1000;tick();timerRef.current=setInterval(tick,ms);};
  const stopM=()=>{clearInterval(timerRef.current);setPlaying(false);setBeat(0);};
  const handleBpm=v=>{setBpm(v);if(playing){clearInterval(timerRef.current);timerRef.current=setInterval(tick,(60/v)*1000);}};
  const tapTempo=()=>{
    const now=Date.now();tapRef.current=[...tapRef.current.filter(t=>now-t<3000),now];
    if(tapRef.current.length>=2){
      const gaps=tapRef.current.slice(1).map((t,i)=>t-tapRef.current[i]);
      handleBpm(Math.max(40,Math.min(220,Math.round(60000/gaps.reduce((a,b)=>a+b,0)*gaps.length**-1))));
    }
  };
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const allKeyChords=[0,1,2,3,4,5].map(d=>({name:KEY_CHORDS[key][d],degree:d})).filter(x=>x.name&&VOICINGS[x.name]);

  // Pill button
  const Pill=({active,onClick,children,wide})=>(
    <button onClick={onClick} style={{
      padding:wide?"6px 14px":"6px 12px", fontSize:11, letterSpacing:1,
      fontFamily:"'Barlow Condensed',sans-serif", fontWeight:active?700:400,
      background:active?C.teal:"transparent", color:active?C.bg:C.textDim,
      border:`1.5px solid ${active?C.teal:C.dim}`, borderRadius:6, cursor:"pointer",
      transition:"all 0.15s",
    }}>{children}</button>
  );

  const box={background:C.surface,border:`1px solid ${C.dim}`,borderRadius:12,padding:"18px 16px"};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg}!important;}
        input[type=range]{width:100%;accent-color:${C.teal};cursor:pointer;}
        button:hover{opacity:0.85;}
      `}</style>

      <div style={{
        minHeight:"100vh",background:C.bg,
        fontFamily:"'DM Sans',sans-serif",color:C.text,
        padding:"24px 16px 48px", userSelect:"none",
      }}>

        {/* Detail view */}
        {detail && (
          <DetailView
            chord={detail}
            currentVoicingId={selected[detail]}
            onSelect={id=>{
              setSelected(s=>({...s,[detail]:id}));
            }}
            onBack={()=>setDetail(null)}
          />
        )}

        {/* Main view */}
        {!detail && <>
          {/* Header */}
          <div style={{textAlign:"center",marginBottom:26}}>
            <div style={{
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,
              fontSize:40,letterSpacing:6,color:C.orange,
              textShadow:`0 0 30px ${C.orange}66`,
            }}>CHORD TRAINER</div>
            <div style={{fontSize:9,color:C.dim,letterSpacing:4,marginTop:3}}>ELECTRIC GUITAR</div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
            {[["trainer","TRAINER"],["library","CHORD LIBRARY"]].map(([id,l])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"7px 20px",fontSize:11,letterSpacing:2,
                fontFamily:"'Barlow Condensed',sans-serif",fontWeight:tab===id?700:400,
                background:tab===id?C.teal:"transparent",color:tab===id?C.bg:C.dim,
                border:`1.5px solid ${tab===id?C.teal:C.dim}`,borderRadius:6,cursor:"pointer",
                transition:"all 0.15s",
              }}>{l}</button>
            ))}
          </div>

          {tab==="trainer" && <>
            {/* Key + Progression */}
            <div style={{display:"flex",flexWrap:"wrap",gap:14,justifyContent:"center",marginBottom:20}}>
              <div style={box}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:3,marginBottom:8}}>KEY</div>
                <div style={{display:"flex",gap:6}}>
                  {Object.keys(KEY_CHORDS).map(k=>(
                    <Pill key={k} active={k===key} onClick={()=>setKey(k)}>{k}</Pill>
                  ))}
                </div>
              </div>
              <div style={box}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:3,marginBottom:8}}>PROGRESSION</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {PROGRESSIONS.map((p,i)=>(
                    <Pill key={i} active={i===progIdx} onClick={()=>setProgIdx(i)} wide>{p.label}</Pill>
                  ))}
                </div>
              </div>
            </div>

            {/* Chord sequence */}
            <div style={{...box,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:3}}>
                  CHORD SEQUENCE <span style={{color:C.dim,fontSize:8}}>— Akkord antippen für Alternativen</span>
                </div>
                {playing && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                      width:10,height:10,borderRadius:"50%",
                      background:flash?C.coral:C.dim,
                      boxShadow:flash?`0 0 14px ${C.coral}`:"none",
                      transition:"all 0.06s",
                    }}/>
                    <span style={{fontSize:9,color:C.textDim,letterSpacing:2}}>BEAT {beat+1}/{bpc}</span>
                  </div>
                )}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
                {chordNames.map((name,i)=>{
                  const isActive = playing?i===chordIdx:i===0;
                  return (
                    <ChordCard key={`${name}-${i}`}
                      name={name}
                      voicing={getVoicing(name, selected[name])}
                      active={isActive}
                      roman={ROMAN[prog.d[i]]}
                      beat={beat} bpc={bpc} playing={playing}
                      onClick={()=>setDetail(name)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Metronome */}
            <div style={box}>
              <div style={{fontSize:9,color:C.textDim,letterSpacing:3,marginBottom:14}}>METRONOME</div>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                  <span style={{fontSize:10,color:C.textDim,letterSpacing:1}}>TEMPO</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:800,color:C.yellow,letterSpacing:2}}>
                    {bpm} <span style={{fontSize:13,color:C.dim,fontWeight:400}}>BPM</span>
                  </span>
                </div>
                <input type="range" min={40} max={220} value={bpm} onChange={e=>handleBpm(Number(e.target.value))}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.dim,marginTop:2}}>
                  <span>40</span><span>220</span>
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:3,marginBottom:8}}>BEATS / CHORD</div>
                <div style={{display:"flex",gap:6}}>
                  {[2,4,8].map(n=><Pill key={n} active={n===bpc} onClick={()=>setBpc(n)}>{n}</Pill>)}
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={playing?stopM:startM} style={{
                  flex:1,padding:"13px 0",
                  fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,letterSpacing:3,
                  background:playing?"transparent":C.coral,color:playing?C.coral:C.text,
                  border:`2px solid ${C.coral}`,borderRadius:8,cursor:"pointer",
                  boxShadow:playing?`0 0 20px ${C.coral}44`:"none",transition:"all 0.15s",
                }}>{playing?"⏹  STOP":"▶  START"}</button>
                <button onClick={tapTempo} style={{
                  padding:"13px 20px",
                  fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:700,letterSpacing:2,
                  background:"transparent",color:C.textDim,
                  border:`1.5px solid ${C.dim}`,borderRadius:8,cursor:"pointer",
                }}>TAP</button>
              </div>
            </div>
          </>}

          {tab==="library" && (
            <div style={box}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:3}}>KEY OF {key}</div>
                <div style={{display:"flex",gap:5}}>
                  {Object.keys(KEY_CHORDS).map(k=><Pill key={k} active={k===key} onClick={()=>setKey(k)}>{k}</Pill>)}
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
                {allKeyChords.map(({name,degree})=>(
                  <div key={name} onClick={()=>setDetail(name)}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
                    <ChordCard name={name} voicing={getVoicing(name,selected[name])} active={false} roman={ROMAN[degree]}/>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,padding:"10px 14px",background:C.surf2,border:`1px solid ${C.dim}`,borderRadius:8}}>
                <div style={{fontSize:9,color:C.textDim,lineHeight:1.8,letterSpacing:0.5}}>
                  1 = Zeigefinger &nbsp;·&nbsp; 2 = Mittelfinger &nbsp;·&nbsp; 3 = Ringfinger &nbsp;·&nbsp; 4 = kleiner Finger
                </div>
              </div>
            </div>
          )}
        </>}
      </div>
    </>
  );
}
