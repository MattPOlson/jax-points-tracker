import{w as l}from"./DPKnjtfy.js";import{s as g}from"./CCM_4jRA.js";const n=l([]),f=l(""),i=l(!1);let p=0;const u=1e4;setTimeout(()=>{try{const e=localStorage.getItem("leaderboard");if(e){const r=JSON.parse(e);Array.isArray(r)&&n.set(r)}n.subscribe(r=>{try{localStorage.setItem("leaderboard",JSON.stringify(r))}catch(s){console.warn("Error writing leaderboard to localStorage:",s)}})}catch(e){console.warn("Error reading leaderboard from localStorage:",e)}},0);async function S(e=!1){var d,c;if(!e&&Date.now()-p<u)return;i.set(!0);const{data:r,error:s}=await g.from("point_submissions").select(`
      points,
      approved,
      member_id,
      members(id, name)
    `).eq("approved",!0);if(p=Date.now(),s){console.error("Error loading leaderboard:",s),f.set("Failed to load leaderboard."),n.set([]),i.set(!1);return}const t=new Map;for(const a of r){const o=(d=a.members)==null?void 0:d.id,m=(c=a.members)==null?void 0:c.name,b=a.points||0;!o||!m||(t.has(o)||t.set(o,{name:m,points:0}),t.get(o).points+=b)}n.set(Array.from(t.values()).sort((a,o)=>o.points-a.points).slice(0,10)),f.set(""),i.set(!1)}export{i as a,n as b,S as l,f as m};
