import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Denomination config ─────────────────────────────────────── */
const DENOMS = {
  100: { type:"note", label:"$100", w:148, h:72, bg:["#3BA8C5","#1C7A99"], accent:"#FFE066", serial:"AA 000001" },
  50:  { type:"note", label:"$50",  w:148, h:72, bg:["#E6B84A","#B88520"], accent:"#fff",    serial:"BB 000002" },
  20:  { type:"note", label:"$20",  w:148, h:72, bg:["#E05A5E","#A83035"], accent:"#FFE066", serial:"CC 000003" },
  10:  { type:"note", label:"$10",  w:148, h:72, bg:["#62BF94","#2E8A60"], accent:"#fff",    serial:"DD 000004" },
  5:   { type:"note", label:"$5",   w:148, h:72, bg:["#E07840","#A84820"], accent:"#FFE066", serial:"EE 000005" },
};
const COIN_DENOMS = {
  "100":  { type:"coin", label:"$1",  r:16, gold:true  },
  "50":   { type:"coin", label:"50¢", r:15, gold:false },
  "20":   { type:"coin", label:"20¢", r:13, gold:false },
  "10":   { type:"coin", label:"10¢", r:11, gold:false },
  "5":    { type:"coin", label:"5¢",  r:10, gold:false },
  "1":    { type:"coin", label:"1¢",  r:8,  gold:true  },
};

function centsKey(v) { return String(Math.round(v*100)); }

/* ─── Break amount into notes + coins ────────────────────────────*/
function makeChange(totalCents) {
  const items = [];
  const noteVals = [10000,5000,2000,1000,500];
  const coinVals = [100,50,20,10,5,1];
  let rem = totalCents;
  for (const v of noteVals) { while(rem>=v){items.push(v/100); rem-=v;} }
  for (const v of coinVals) { while(rem>=v){items.push(v/100); rem-=v;} }
  return items;
}

/* ─── Note SVG ────────────────────────────────────────────────── */
function Note({ val, width=148, height=72, style={} }) {
  const d = DENOMS[val];
  if (!d) return null;
  const [c1,c2] = d.bg;
  const id = `ng${val}`;
  const patterns = {
    100: <><circle cx={width*0.78} cy={height*0.5} r={height*0.7} fill={c2} opacity="0.28"/><circle cx={width*0.82} cy={height*0.48} r={height*0.38} fill={d.accent} opacity="0.12"/></>,
    50:  <><polygon points={`${width*0.62},5 ${width*0.92},${height/2} ${width*0.62},${height-5} ${width*0.5},${height/2}`} fill={c2} opacity="0.22"/></>,
    20:  <><rect x={width*0.56} y="4" width={width*0.4} height={height-8} rx="4" fill={c2} opacity="0.18"/></>,
    10:  <><ellipse cx={width*0.76} cy={height*0.5} rx={height*0.52} ry={height*0.46} fill={c2} opacity="0.22"/></>,
    5:   <><line x1={width*0.48} y1="0" x2={width+10} y2={height+10} stroke={c2} strokeWidth="22" opacity="0.2"/></>,
  };
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display:"block", ...style }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
        </linearGradient>
        <clipPath id={`cl${val}`}><rect width={width} height={height} rx="6"/></clipPath>
      </defs>
      <rect width={width} height={height} rx="6" fill={`url(#${id})`}/>
      <g clipPath={`url(#cl${val})`}>{patterns[val]}</g>
      <rect width={width} height={height} rx="6" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
      {/* Corner badge */}
      <rect x="5" y="5" width="34" height="20" rx="3" fill="rgba(0,0,0,0.18)"/>
      <text x="22" y="19" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="10" fill="rgba(255,255,255,0.9)">AUD</text>
      {/* Big denomination */}
      <text x={width/2} y={height/2+11} textAnchor="middle" fontFamily="Georgia,serif" fontWeight="900" fontSize="30" fill="rgba(255,255,255,0.96)">{d.label}</text>
      {/* Bottom text */}
      <text x={width-7} y={height-6} textAnchor="end" fontFamily="Georgia,serif" fontSize="7.5" fill="rgba(255,255,255,0.45)" letterSpacing="1">{d.serial}</text>
      <text x="7" y={height-6} fontFamily="Georgia,serif" fontSize="7.5" fill="rgba(255,255,255,0.45)">AUSTRALIA</text>
    </svg>
  );
}

/* ─── Coin SVG ────────────────────────────────────────────────── */
function Coin({ val, r=16, style={} }) {
  const ck = centsKey(val);
  const d = COIN_DENOMS[ck];
  if (!d) return null;
  const size = r*2;
  const gid = `cg${ck}`;
  const gold = d.gold;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:"block", ...style }}>
      <defs>
        <radialGradient id={gid} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor={gold?"#FFE090":"#F0F0F0"}/>
          <stop offset="55%" stopColor={gold?"#C8962A":"#B0B0B0"}/>
          <stop offset="100%" stopColor={gold?"#8A6010":"#707070"}/>
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r-0.5} fill={`url(#${gid})`}/>
      <circle cx={r} cy={r} r={r-0.5} fill="none" stroke={gold?"#A07820":"#888"} strokeWidth="1"/>
      <circle cx={r} cy={r} r={r*0.7} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
      <text x={r} y={r+r*0.32} textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800"
        fontSize={r*0.58} fill={gold?"#5A3800":"#333"}>{d.label}</text>
    </svg>
  );
}

/* ─── Tiny physics engine ─────────────────────────────────────── */
const GRAVITY = 0.45;
const DAMPING = 0.998;
const FRICTION = 0.88;
const BOUNCE   = 0.22;
const ANGDAMP  = 0.96;

function createBody(val, x, y, W, H) {
  const d = DENOMS[val];
  const ck = centsKey(val);
  const cd = COIN_DENOMS[ck];
  const isNote = !!d;
  const bw = isNote ? d.w : (cd?cd.r*2:20);
  const bh = isNote ? d.h : (cd?cd.r*2:20);
  return {
    id: Math.random().toString(36).slice(2),
    val,
    type: isNote ? "note" : "coin",
    x, y,
    vx: (Math.random()-0.5)*2,
    vy: (Math.random()-0.5)*2,
    angle: (Math.random()-0.5)*1.2,
    va: (Math.random()-0.5)*0.06,
    w: bw, h: bh,
    r: isNote ? 0 : (cd?cd.r:10),
  };
}

function stepBodies(bodies, W, H, pinned) {
  return bodies.map(b => {
    if (pinned) return b;
    let { x, y, vx, vy, angle, va, w, h, r } = b;
    const isNote = b.type === "note";

    vy += GRAVITY;
    vx *= DAMPING; vy *= DAMPING;
    va *= ANGDAMP;
    x += vx; y += vy; angle += va;

    if (isNote) {
      const hw = w/2, hh = h/2;
      // crude AABB bounds (ignore rotation for walls)
      const maxR = Math.sqrt(hw*hw+hh*hh);
      if (x - maxR < 0)  { x = maxR;   vx = Math.abs(vx)*BOUNCE; va *= -0.5; }
      if (x + maxR > W)  { x = W-maxR; vx = -Math.abs(vx)*BOUNCE; va *= -0.5; }
      if (y - maxR < 0)  { y = maxR;   vy = Math.abs(vy)*BOUNCE; }
      if (y + maxR > H)  { y = H-maxR; vy = -Math.abs(vy)*BOUNCE*0.7; vx *= FRICTION; va *= FRICTION; }
    } else {
      if (x - r < 0)   { x = r;   vx = Math.abs(vx)*BOUNCE; }
      if (x + r > W)   { x = W-r; vx = -Math.abs(vx)*BOUNCE; }
      if (y - r < 0)   { y = r;   vy = Math.abs(vy)*BOUNCE; }
      if (y + r > H)   { y = H-r; vy = -Math.abs(vy)*BOUNCE*0.7; vx *= FRICTION; }
    }

    return { ...b, x, y, vx, vy, angle, va };
  });
}

function resolveCollisions(bodies) {
  const out = bodies.map(b => ({...b}));
  for (let i=0; i<out.length; i++) {
    for (let j=i+1; j<out.length; j++) {
      const a=out[i], b=out[j];
      const dx=b.x-a.x, dy=b.y-a.y;
      const dist=Math.sqrt(dx*dx+dy*dy)||0.001;
      let minDist;
      if(a.type==="coin"&&b.type==="coin") minDist=a.r+b.r;
      else minDist=35;
      if(dist<minDist){
        const nx=dx/dist, ny=dy/dist;
        const push=(minDist-dist)*0.35;
        out[i].x-=nx*push*0.5; out[i].y-=ny*push*0.5;
        out[j].x+=nx*push*0.5; out[j].y+=ny*push*0.5;
        const dvx=b.vx-a.vx, dvy=b.vy-a.vy;
        const dot=dvx*nx+dvy*ny;
        if(dot<0){
          out[i].vx+=dot*nx*0.3; out[i].vy+=dot*ny*0.3;
          out[j].vx-=dot*nx*0.3; out[j].vy-=dot*ny*0.3;
        }
      }
    }
  }
  return out;
}

/* ─── Organised layout calculator ────────────────────────────── */
function organiseLayout(bodies, W) {
  const noteVals = [100,50,20,10,5];
  const coinVals = [1,0.5,0.2,0.1,0.05,0.01];
  const noteCounts = {}, coinCounts = {};
  bodies.forEach(b => {
    if(b.type==="note") noteCounts[b.val]=(noteCounts[b.val]||0)+1;
    else coinCounts[b.val]=(coinCounts[b.val]||0)+1;
  });

  const usedNoteVals = noteVals.filter(v=>noteCounts[v]);
  const usedCoinVals = coinVals.filter(v=>coinCounts[v]);
  const nw = 148, nh = 72, gap = 10;
  const totalNoteW = usedNoteVals.length*(nw+gap)-gap;
  const noteStartX = Math.max(10,(W-totalNoteW)/2);
  const noteRowY = 120;

  const map = {};
  const noteIdx = {};

  bodies.forEach(b => {
    if(b.type==="note"){
      const vi = usedNoteVals.indexOf(b.val);
      if(vi===-1) return;
      const ni = noteIdx[b.val]||0;
      noteIdx[b.val]=ni+1;
      map[b.id] = {
        x: noteStartX + vi*(nw+gap) + nw/2,
        y: noteRowY + ni*16,
        angle: 0,
      };
    }
  });

  const coinStartY = noteRowY + nh + 70;
  const coinGap = 8;
  const maxCoinR = 16;
  let totalCoinW = 0;
  usedCoinVals.forEach(v => {
    const ck = centsKey(v);
    const cd = COIN_DENOMS[ck];
    if(cd) totalCoinW += cd.r*2 + coinGap;
  });
  totalCoinW -= coinGap;
  let coinX = (W - totalCoinW) / 2;
  const coinIdx = {};
  const coinColX = {};
  let cx2 = coinX;
  usedCoinVals.forEach(v => {
    const ck=centsKey(v), cd=COIN_DENOMS[ck];
    if(!cd) return;
    coinColX[v] = cx2 + cd.r;
    cx2 += cd.r*2 + coinGap;
  });

  bodies.forEach(b => {
    if(b.type==="coin"){
      const ck=centsKey(b.val), cd=COIN_DENOMS[ck];
      if(!cd) return;
      const vi = usedCoinVals.indexOf(b.val);
      if(vi===-1) return;
      const ci = coinIdx[b.val]||0;
      coinIdx[b.val]=ci+1;
      map[b.id] = {
        x: coinColX[b.val],
        y: coinStartY + ci*(cd.r*2+5) + cd.r,
        angle: 0,
      };
    }
  });
  return map;
}

/* ─── Main App ────────────────────────────────────────────────── */
export default function WalletApp() {
  const BALANCE = 1432.67;
  const [bodies, setBodies] = useState([]);
  const [organised, setOrganised] = useState(false);
  const [orgMap, setOrgMap] = useState({});
  const containerRef = useRef(null);
  const sizeRef = useRef({ w:390, h:844 });
  const animRef = useRef(null);
  const bodiesRef = useRef([]);
  const organisedRef = useRef(false);
  const dragRef = useRef(null); // { id, startY, startX, currentY }
  const [swipeOffset, setSwipeOffset] = useState({});
  const [flyingOut, setFlyingOut] = useState(null);
  const [droppingIn, setDroppingIn] = useState([]);

  useEffect(() => {
    const el = containerRef.current;
    if(!el) return;
    const W = el.clientWidth || 390;
    const H = el.clientHeight || 844;
    sizeRef.current = { w:W, h:H };

    const wallet = makeChange(Math.round(BALANCE*100));
    const bs = wallet.map(val => {
      const x = 60 + Math.random()*(W-120);
      const y = 80 + Math.random()*(H-200);
      return createBody(val, x, y, W, H);
    });
    bodiesRef.current = bs;
    setBodies(bs);

    const loop = () => {
      if(!organisedRef.current) {
        let bs2 = stepBodies(bodiesRef.current, W, H, false);
        bs2 = resolveCollisions(bs2);
        bodiesRef.current = bs2;
        setBodies([...bs2]);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleOrganise = () => {
    const el = containerRef.current;
    const W = el?.clientWidth || 390;
    if(!organised) {
      const map = organiseLayout(bodiesRef.current, W);
      setOrgMap(map);
      organisedRef.current = true;
      setOrganised(true);
    } else {
      organisedRef.current = false;
      // give them random kick
      bodiesRef.current = bodiesRef.current.map(b => ({
        ...b,
        vx: (Math.random()-0.5)*6,
        vy: -2-Math.random()*4,
        va: (Math.random()-0.5)*0.12,
      }));
      setOrganised(false);
    }
  };

  /* Swipe handlers */
  const onPointerDown = (e, b) => {
    if(b.type !== "note") return;
    if(organised) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id:b.id, startY:e.clientY, startX:e.clientX, val:b.val };
  };

  const onPointerMove = (e) => {
    if(!dragRef.current) return;
    const dy = e.clientY - dragRef.current.startY;
    setSwipeOffset({ [dragRef.current.id]: dy });
  };

  const onPointerUp = (e) => {
    if(!dragRef.current) return;
    const dy = e.clientY - dragRef.current.startY;
    const { id, val } = dragRef.current;
    dragRef.current = null;
    setSwipeOffset({});

    if(dy < -90) {
      // swipe up! pay
      setFlyingOut(id);
      setTimeout(() => {
        setFlyingOut(null);
        // Remove body
        bodiesRef.current = bodiesRef.current.filter(b => b.id !== id);
        setBodies([...bodiesRef.current]);

        // Drop change back in
        const changeVals = makeChange(Math.round(val*100));
        const el = containerRef.current;
        const W = el?.clientWidth || 390;
        const newBodies = changeVals.map((v, i) => {
          const x = W/2 + (Math.random()-0.5)*W*0.5;
          const nb = createBody(v, x, -80 - i*30, W, 844);
          return { ...nb, vy: 3+i*0.3, vx:(Math.random()-0.5)*2 };
        });
        newBodies.forEach((nb,i) => {
          setTimeout(() => {
            bodiesRef.current = [...bodiesRef.current, nb];
          }, i*80);
        });
      }, 400);
    }
  };

  const getStyle = (b) => {
    const hw = b.w/2, hh = b.h/2;
    let x = b.x, y = b.y;
    let angle = b.angle;
    let transition = "";
    let zIndex = 1;
    let opacity = 1;

    if(organised && orgMap[b.id]) {
      x = orgMap[b.id].x;
      y = orgMap[b.id].y;
      angle = 0;
      transition = "left 0.5s cubic-bezier(.4,0,.2,1),top 0.5s cubic-bezier(.4,0,.2,1),transform 0.5s cubic-bezier(.4,0,.2,1)";
    }

    let extraY = 0;
    if(swipeOffset[b.id] !== undefined) {
      extraY = swipeOffset[b.id];
      zIndex = 50;
    }
    if(flyingOut === b.id) {
      extraY = -500;
      opacity = 0;
      transition = "top 0.4s ease-in, opacity 0.35s";
    }

    return {
      position: "absolute",
      width: b.w,
      height: b.h,
      left: x - hw,
      top: (y - hh) + extraY,
      transform: `rotate(${angle}rad)`,
      cursor: b.type==="note" ? "grab" : "default",
      userSelect: "none",
      touchAction: "none",
      transition,
      zIndex,
      opacity,
      willChange: "transform",
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position:"fixed", inset:0,
        background:"#111622",
        overflow:"hidden",
        fontFamily:"Georgia, serif",
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Background grid */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.035,pointerEvents:"none"}}>
        <defs><pattern id="bg-grid" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M44 0L0 0 0 44" fill="none" stroke="#fff" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#bg-grid)"/>
      </svg>

      {/* Items */}
      {bodies.map(b => (
        <div
          key={b.id}
          style={getStyle(b)}
          onPointerDown={e => onPointerDown(e, b)}
        >
          {b.type === "note"
            ? <Note val={b.val} width={b.w} height={b.h}/>
            : <Coin val={b.val} r={b.r}/>
          }
        </div>
      ))}

      {/* Organise button */}
      <button
        onClick={handleOrganise}
        style={{
          position:"absolute", top:20, left:16, zIndex:300,
          background: organised ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.1)",
          backdropFilter:"blur(10px)",
          color: organised ? "#111622" : "rgba(255,255,255,0.88)",
          border:"1px solid rgba(255,255,255,0.2)",
          borderRadius:24,
          padding:"9px 20px",
          fontSize:13,
          fontFamily:"Georgia,serif",
          fontWeight:600,
          letterSpacing:"0.04em",
          cursor:"pointer",
          transition:"all 0.25s",
          boxShadow: organised ? "0 2px 16px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {organised ? "✦ organised" : "organise"}
      </button>

      {/* Balance */}
      <div style={{
        position:"absolute", top:24, right:18, zIndex:300,
        color:"rgba(255,255,255,0.38)",
        fontSize:12,
        fontFamily:"Georgia,serif",
        letterSpacing:"0.06em",
      }}>
        ${BALANCE.toFixed(2)}
      </div>

      {/* Hint */}
      {!organised && (
        <div style={{
          position:"absolute", bottom:24, left:0, right:0,
          textAlign:"center", zIndex:10,
          color:"rgba(255,255,255,0.15)",
          fontSize:10.5,
          fontFamily:"Georgia,serif",
          letterSpacing:"0.1em",
          pointerEvents:"none",
          textTransform:"lowercase",
        }}>
          swipe notes upward to pay
        </div>
      )}
    </div>
  );
}
