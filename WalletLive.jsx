import { useEffect, useRef, useState } from "react";

const BALANCE = 1432.67;

const NOTE_DEFS = {
  100:{ label:"$100", w:148, h:70, c1:"#3BA8C5", c2:"#1C7A99", ac:"#FFE066", ser:"AA 000001" },
  50: { label:"$50",  w:148, h:70, c1:"#E6B84A", c2:"#B88520", ac:"#fff",    ser:"BB 000002" },
  20: { label:"$20",  w:148, h:70, c1:"#E05A5E", c2:"#A83035", ac:"#FFE066", ser:"CC 000003" },
  10: { label:"$10",  w:148, h:70, c1:"#62BF94", c2:"#2E8A60", ac:"#fff",    ser:"DD 000004" },
  5:  { label:"$5",   w:148, h:70, c1:"#E07840", c2:"#A84820", ac:"#FFE066", ser:"EE 000005" },
};
const COIN_DEFS = {
  100:{ label:"$1",  r:16, gold:true  },
  50: { label:"50¢", r:15, gold:false },
  20: { label:"20¢", r:13, gold:false },
  10: { label:"10¢", r:11, gold:false },
  5:  { label:"5¢",  r:10, gold:false },
  1:  { label:"1¢",  r:8,  gold:true  },
};

function centsKey(v){ return String(Math.round(v*100)); }

function makeChange(totalCents){
  const items=[];
  const ns=[10000,5000,2000,1000,500];
  const cs=[100,50,20,10,5,1];
  let rem=totalCents;
  for(const v of ns){while(rem>=v){items.push(v/100);rem-=v;}}
  for(const v of cs){while(rem>=v){items.push(v/100);rem-=v;}}
  return items;
}

function NoteCard({val,width=148,height=70}){
  const d=NOTE_DEFS[val]; if(!d) return null;
  const id=`ng${val}`;
  const pats={
    100:<><circle cx={width*.78} cy={height*.5} r={height*.72} fill={d.c2} opacity=".28"/><circle cx={width*.82} cy={height*.48} r={height*.38} fill={d.ac} opacity=".12"/></>,
    50:<><polygon points={`${width*.62},4 ${width*.92},${height/2} ${width*.62},${height-4} ${width*.5},${height/2}`} fill={d.c2} opacity=".22"/></>,
    20:<><rect x={width*.56} y="3" width={width*.41} height={height-6} rx="4" fill={d.c2} opacity=".18"/></>,
    10:<><ellipse cx={width*.76} cy={height*.5} rx={height*.52} ry={height*.46} fill={d.c2} opacity=".22"/></>,
    5:<><line x1={width*.48} y1="0" x2={width+10} y2={height+10} stroke={d.c2} strokeWidth="24" opacity=".2"/></>,
  };
  return(
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display:"block"}}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={d.c1}/><stop offset="100%" stopColor={d.c2}/>
        </linearGradient>
        <clipPath id={`cl${val}`}><rect width={width} height={height} rx="6"/></clipPath>
      </defs>
      <rect width={width} height={height} rx="6" fill={`url(#${id})`}/>
      <g clipPath={`url(#cl${val})`}>{pats[val]}</g>
      <rect width={width} height={height} rx="6" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5"/>
      <rect x="5" y="5" width="34" height="20" rx="3" fill="rgba(0,0,0,.2)"/>
      <text x="22" y="19" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="10" fill="rgba(255,255,255,.9)">AUD</text>
      <text x={width/2} y={height/2+11} textAnchor="middle" fontFamily="Georgia,serif" fontWeight="900" fontSize="29" fill="rgba(255,255,255,.96)">{d.label}</text>
      <text x={width-7} y={height-6} textAnchor="end" fontFamily="Georgia,serif" fontSize="7" fill="rgba(255,255,255,.4)" letterSpacing="1">{d.ser}</text>
      <text x="7" y={height-6} fontFamily="Georgia,serif" fontSize="7" fill="rgba(255,255,255,.4)">AUSTRALIA</text>
    </svg>
  );
}

function CoinCircle({val}){
  const ck=centsKey(val); const d=COIN_DEFS[ck]; if(!d) return null;
  const r=d.r; const size=r*2; const gid=`cg${ck}`;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
      <defs>
        <radialGradient id={gid} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor={d.gold?"#FFE090":"#F2F2F2"}/>
          <stop offset="55%" stopColor={d.gold?"#C8962A":"#B4B4B4"}/>
          <stop offset="100%" stopColor={d.gold?"#8A6010":"#727272"}/>
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r-.5} fill={`url(#${gid})`}/>
      <circle cx={r} cy={r} r={r-.5} fill="none" stroke={d.gold?"#A07820":"#888"} strokeWidth="1"/>
      <circle cx={r} cy={r} r={r*.7} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".8"/>
      <text x={r} y={r+r*.32} textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800"
        fontSize={r*.58} fill={d.gold?"#5A3800":"#2a2a2a"}>{d.label}</text>
    </svg>
  );
}

const G=0.44, DAMP=0.9985, FRIC=0.87, BOUNCE=0.21, ADAMP=0.96;

function mkBody(val,x,y){
  const d=NOTE_DEFS[val]; const ck=centsKey(val); const cd=COIN_DEFS[ck];
  const isNote=!!d;
  return{
    id:Math.random().toString(36).slice(2)+Date.now(),
    val, type:isNote?"note":"coin",
    x,y,
    vx:(Math.random()-.5)*2,
    vy:(Math.random()-.5)*2,
    angle:(Math.random()-.5)*1.1,
    va:(Math.random()-.5)*.05,
    w:isNote?d.w:(cd?cd.r*2:20),
    h:isNote?d.h:(cd?cd.r*2:20),
    r:isNote?0:(cd?cd.r:10),
  };
}

function stepAll(bodies,W,H){
  let bs=bodies.map(b=>{
    let{x,y,vx,vy,angle,va,w,h,r}=b;
    vy+=G; vx*=DAMP; vy*=DAMP; va*=ADAMP;
    x+=vx; y+=vy; angle+=va;
    if(b.type==="note"){
      const mr=Math.sqrt(w*w+h*h)/2;
      if(x-mr<0){x=mr;vx=Math.abs(vx)*BOUNCE;va*=-.5;}
      if(x+mr>W){x=W-mr;vx=-Math.abs(vx)*BOUNCE;va*=-.5;}
      if(y-mr<0){y=mr;vy=Math.abs(vy)*BOUNCE;}
      if(y+mr>H){y=H-mr;vy=-Math.abs(vy)*BOUNCE*.7;vx*=FRIC;va*=FRIC;}
    }else{
      if(x-r<0){x=r;vx=Math.abs(vx)*BOUNCE;}
      if(x+r>W){x=W-r;vx=-Math.abs(vx)*BOUNCE;}
      if(y-r<0){y=r;vy=Math.abs(vy)*BOUNCE;}
      if(y+r>H){y=H-r;vy=-Math.abs(vy)*BOUNCE*.7;vx*=FRIC;}
    }
    return{...b,x,y,vx,vy,angle,va};
  });
  // simple coin-coin collision
  for(let i=0;i<bs.length;i++){
    for(let j=i+1;j<bs.length;j++){
      const a=bs[i],b=bs[j];
      if(a.type!=="coin"||b.type!=="coin") continue;
      const dx=b.x-a.x,dy=b.y-a.y;
      const dist=Math.sqrt(dx*dx+dy*dy)||.001;
      const md=a.r+b.r;
      if(dist<md){
        const nx=dx/dist,ny=dy/dist,push=(md-dist)*.4;
        bs[i]={...bs[i],x:a.x-nx*push*.5,y:a.y-ny*push*.5};
        bs[j]={...bs[j],x:b.x+nx*push*.5,y:b.y+ny*push*.5};
      }
    }
  }
  return bs;
}

function orgLayout(bodies,W){
  const nv=[100,50,20,10,5],cv=[1,.5,.2,.1,.05,.01];
  const nc={},cc={};
  bodies.forEach(b=>{b.type==="note"?nc[b.val]=(nc[b.val]||0)+1:cc[b.val]=(cc[b.val]||0)+1;});
  const unv=nv.filter(v=>nc[v]),ucv=cv.filter(v=>cc[v]);
  const NW=148,NH=70,GAP=10;
  const totNW=unv.length*(NW+GAP)-GAP;
  const nsx=Math.max(8,(W-totNW)/2);
  const nry=100;
  const map={};
  const ni={};
  bodies.forEach(b=>{
    if(b.type==="note"){
      const vi=unv.indexOf(b.val);if(vi===-1)return;
      const idx=ni[b.val]||0;ni[b.val]=idx+1;
      map[b.id]={x:nsx+vi*(NW+GAP)+NW/2,y:nry+idx*15,angle:0};
    }
  });
  const cry=nry+NH+68;
  const cg=7;
  let totCW=0;
  ucv.forEach(v=>{const d=COIN_DEFS[centsKey(v)];if(d)totCW+=d.r*2+cg;});
  totCW-=cg;
  let cx=(W-totCW)/2;
  const colX={};
  ucv.forEach(v=>{const d=COIN_DEFS[centsKey(v)];if(!d)return;colX[v]=cx+d.r;cx+=d.r*2+cg;});
  const ci={};
  bodies.forEach(b=>{
    if(b.type==="coin"){
      const d=COIN_DEFS[centsKey(b.val)];if(!d)return;
      const idx=ci[b.val]||0;ci[b.val]=idx+1;
      map[b.id]={x:colX[b.val],y:cry+idx*(d.r*2+5)+d.r,angle:0};
    }
  });
  return map;
}

export default function App(){
  const ref=useRef(null);
  const sz=useRef({w:390,h:844});
  const bRef=useRef([]);
  const orgRef=useRef(false);
  const [bodies,setBodies]=useState([]);
  const [organised,setOrganised]=useState(false);
  const [orgMap,setOrgMap]=useState({});
  const raf=useRef(null);
  const drag=useRef(null);
  const [swipeOff,setSwipeOff]=useState({});
  const [flyOut,setFlyOut]=useState(null);

  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const W=el.clientWidth||390,H=el.clientHeight||844;
    sz.current={w:W,h:H};
    const wallet=makeChange(Math.round(BALANCE*100));
    const bs=wallet.map(val=>{
      const x=60+Math.random()*(W-120);
      const y=80+Math.random()*(H-200);
      return mkBody(val,x,y);
    });
    bRef.current=bs;setBodies([...bs]);
    const loop=()=>{
      if(!orgRef.current){
        const nb=stepAll(bRef.current,W,H);
        bRef.current=nb;setBodies([...nb]);
      }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  const toggleOrg=()=>{
    const W=ref.current?.clientWidth||390;
    if(!organised){
      setOrgMap(orgLayout(bRef.current,W));
      orgRef.current=true;setOrganised(true);
    }else{
      bRef.current=bRef.current.map(b=>({...b,
        vx:(Math.random()-.5)*7,vy:-3-Math.random()*4,va:(Math.random()-.5)*.14
      }));
      orgRef.current=false;setOrganised(false);
    }
  };

  const onPD=(e,b)=>{
    if(b.type!=="note"||organised)return;
    e.stopPropagation();
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch(err){}
    drag.current={id:b.id,sy:e.clientY,val:b.val};
  };
  const onPM=(e)=>{
    if(!drag.current)return;
    setSwipeOff({[drag.current.id]:e.clientY-drag.current.sy});
  };
  const onPU=(e)=>{
    if(!drag.current)return;
    const dy=e.clientY-drag.current.sy;
    const{id,val}=drag.current;
    drag.current=null;setSwipeOff({});
    if(dy<-88){
      setFlyOut(id);
      setTimeout(()=>{
        setFlyOut(null);
        bRef.current=bRef.current.filter(b=>b.id!==id);
        const W=ref.current?.clientWidth||390;
        const changeVals=makeChange(Math.round(val*100));
        changeVals.forEach((v,i)=>{
          const x=W/2+(Math.random()-.5)*W*.45;
          const nb={...mkBody(v,x,-60-i*25),vy:3+i*.25,vx:(Math.random()-.5)*2};
          setTimeout(()=>{
            bRef.current=[...bRef.current,nb];
          },i*90);
        });
      },380);
    }
  };

  const getStyle=(b)=>{
    const hw=b.w/2,hh=b.h/2;
    let bx=b.x,by=b.y,ang=b.angle,zi=1,op=1,trans="";
    if(organised&&orgMap[b.id]){
      bx=orgMap[b.id].x;by=orgMap[b.id].y;ang=0;
      trans="left .5s cubic-bezier(.4,0,.2,1),top .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1)";
    }
    let ey=0;
    if(swipeOff[b.id]!==undefined){ey=swipeOff[b.id];zi=50;}
    if(flyOut===b.id){ey=-520;op=0;trans="top .38s ease-in,opacity .32s";}
    return{
      position:"absolute",width:b.w,height:b.h,
      left:bx-hw,top:(by-hh)+ey,
      transform:`rotate(${ang}rad)`,
      cursor:b.type==="note"?"grab":"default",
      userSelect:"none",touchAction:"none",
      transition:trans,zIndex:zi,opacity:op,
      willChange:"transform,top,left",
    };
  };

  return(
    <div ref={ref} style={{
      position:"fixed",inset:0,
      background:"linear-gradient(160deg,#0d1220 0%,#111828 60%,#0e1a14 100%)",
      overflow:"hidden",fontFamily:"Georgia,serif",
    }}
    onPointerMove={onPM} onPointerUp={onPU}
    >
      {/* Faint grid */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.032,pointerEvents:"none"}}>
        <defs><pattern id="g" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M44 0L0 0 0 44" fill="none" stroke="#fff" strokeWidth=".5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>

      {bodies.map(b=>(
        <div key={b.id} style={getStyle(b)} onPointerDown={e=>onPD(e,b)}>
          {b.type==="note"
            ?<NoteCard val={b.val} width={b.w} height={b.h}/>
            :<CoinCircle val={b.val}/>
          }
        </div>
      ))}

      <button onClick={toggleOrg} style={{
        position:"absolute",top:18,left:14,zIndex:300,
        background:organised?"rgba(255,255,255,.93)":"rgba(255,255,255,.09)",
        backdropFilter:"blur(12px)",
        color:organised?"#0d1220":"rgba(255,255,255,.85)",
        border:"1px solid rgba(255,255,255,.18)",
        borderRadius:24,padding:"9px 20px",
        fontSize:13,fontFamily:"Georgia,serif",fontWeight:600,
        letterSpacing:".04em",cursor:"pointer",
        transition:"all .25s",
      }}>
        {organised?"✦ organised":"organise"}
      </button>

      <div style={{
        position:"absolute",top:24,right:16,zIndex:300,
        color:"rgba(255,255,255,.32)",fontSize:12,
        fontFamily:"Georgia,serif",letterSpacing:".06em",
      }}>${BALANCE.toFixed(2)}</div>

      {!organised&&(
        <div style={{
          position:"absolute",bottom:22,left:0,right:0,
          textAlign:"center",zIndex:10,
          color:"rgba(255,255,255,.13)",fontSize:10,
          fontFamily:"Georgia,serif",letterSpacing:".1em",
          pointerEvents:"none",
        }}>swipe a note upward to pay</div>
      )}
    </div>
  );
}
