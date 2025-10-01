import{w as r}from"./DPKnjtfy.js";import{s as l}from"./CCM_4jRA.js";const t=r([]),n=r(""),o=r(!1);let i=0;const c=1e4;setTimeout(()=>{try{const s=localStorage.getItem("approvals");if(s){const e=JSON.parse(s);Array.isArray(e)&&t.set(e)}t.subscribe(e=>{try{localStorage.setItem("approvals",JSON.stringify(e))}catch(a){console.warn("Failed to store approvals:",a)}})}catch(s){console.warn("Failed to access localStorage for approvals:",s)}},0);async function m(s=!1){if(!s&&Date.now()-i<c)return;o.set(!0);const{data:e,error:a}=await l.from("point_submissions").select(`
      id,
      category,
      description,
      points,
      event_date,
      submitted_at,
      member_id,
      member:member_id ( name )
    `).eq("approved",!1).order("event_date",{ascending:!1});if(i=Date.now(),a){console.error("Supabase query error:",a),n.set(`Failed to load submissions: ${a.message}`),t.set([]),o.set(!1);return}t.set(e),n.set(e.length===0?"No pending submissions found to review.":""),o.set(!1)}export{t as a,o as b,m as l,n as m};
