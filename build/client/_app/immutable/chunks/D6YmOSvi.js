import{d,w as c}from"./KTA_1Rqc.js";import{s as m}from"./CCM_4jRA.js";import{u as f}from"./CN8V5uJw.js";import{l as u}from"./DpwROyu6.js";const s=c([]),y=c(!1),w=c(!1),l=c(null),b=c(null);d(s,e=>{const t={};return e.forEach(o=>{const n=o.competition.id;t[n]||(t[n]={competition:o.competition,entries:[]}),t[n].entries.push(o)}),Object.values(t).sort((o,n)=>new Date(n.competition.entry_deadline)-new Date(o.competition.entry_deadline))});d(s,e=>{const t=new Date;return e.filter(o=>o.competition.active&&new Date(o.competition.entry_deadline)>t)});d(s,e=>{const t=new Date;return e.filter(o=>!o.competition.active||new Date(o.competition.entry_deadline)<=t)});const M=d(s,e=>{const t={total:e.length,active:0,past:0,pending_payment:0,paid:0},o=new Date;return e.forEach(n=>{n.competition.active&&new Date(n.competition.entry_deadline)>o?t.active++:t.past++,n.entry_fee_paid?t.paid++:t.pending_payment++}),t});async function h(e=!1){const t=new Date,o=u(b);let n=0,r=u(f);for(;!(r!=null&&r.id)&&n<10;)console.log(`⏳ Waiting for user profile... (attempt ${n+1})`),await new Promise(a=>setTimeout(a,100)),r=u(f),n++;if(!(r!=null&&r.id)){console.log("❌ No user ID available after waiting - user may not be logged in"),l.set("User not logged in"),y.set(!0);return}const D=r.id;if(!e&&o&&t-o<3e4){console.log("🍺 Using cached competition entries");return}w.set(!0),l.set(null);try{console.log("🍺 Loading my competition entries...");const{data:a,error:p}=await m.from("competition_entries").select(`
                *,
                competition:competitions(
                    id,
                    name,
                    description,
                    entry_deadline,
                    judging_date,
                    results_published,
                    active
                ),
                bjcp_category:bjcp_categories(
                    id,
                    category_number,
                    subcategory_letter,
                    subcategory_name,
                    category_name
                ),
                results:competition_results(
                    score,
                    placement,
                    judge_notes
                )
            `).eq("member_id",D).order("submitted_at",{ascending:!1});if(p)throw console.error("❌ Error loading entries:",p),p;const g=(a||[]).map(i=>{var _;return{...i,category_display:i.bjcp_category?`${i.bjcp_category.category_number}${i.bjcp_category.subcategory_letter} - ${i.bjcp_category.subcategory_name}`:"Unknown Category",can_edit:i.competition.active&&new Date(i.competition.entry_deadline)>t,days_until_deadline:i.competition.active?Math.ceil((new Date(i.competition.entry_deadline)-t)/(1e3*60*60*24)):0,has_results:i.results&&i.results.length>0,result:((_=i.results)==null?void 0:_[0])||null}});console.log(`✅ Loaded ${g.length} competition entries`),s.set(g),b.set(t)}catch(a){console.error("💥 Failed to load competition entries:",a),l.set(a.message||"Failed to load competition entries")}finally{w.set(!1),y.set(!0)}}async function L(e,t){try{console.log("📝 Updating competition entry:",e);const{data:o,error:n}=await m.from("competition_entries").update({beer_name:t.beer_name,beer_notes:t.beer_notes,bjcp_category_id:t.bjcp_category_id,updated_at:new Date().toISOString()}).eq("id",e).select(`
                *,
                competition:competitions(
                    id,
                    name,
                    entry_deadline,
                    active
                ),
                bjcp_category:bjcp_categories(
                    category_number,
                    subcategory_letter,
                    subcategory_name
                )
            `).single();if(n)throw console.error("❌ Error updating entry:",n),n;return console.log("✅ Entry updated successfully"),await h(!0),o}catch(o){throw console.error("💥 Failed to update entry:",o),o}}async function P(e){try{console.log("🗑️ Deleting competition entry:",e);const{error:t}=await m.from("competition_entries").delete().eq("id",e);if(t)throw console.error("❌ Error deleting entry:",t),t;console.log("✅ Entry deleted successfully"),await h(!0)}catch(t){throw console.error("💥 Failed to delete entry:",t),t}}function U(e){if(!e)return!1;const t=new Date;return e.competition.active&&new Date(e.competition.entry_deadline)>t}function $(e){var n;if(!((n=e==null?void 0:e.competition)!=null&&n.entry_deadline))return"";const t=new Date(e.competition.entry_deadline),o={weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"};return t.toLocaleDateString("en-US",o)}function q(e){if(!e)return null;switch(e.placement){case"1":return"🥇 1st Place";case"2":return"🥈 2nd Place";case"3":return"🥉 3rd Place";case"HM":return"🏅 Honorable Mention";default:return e.score?`Score: ${e.score}/50`:"No Results"}}function F(e){return e.entry_fee_paid?{text:"✅ Paid",class:"paid"}:{text:"⏳ Pending",class:"pending"}}typeof window<"u"&&(s.subscribe(e=>{console.log("🍺 My entries updated:",e.length,"entries")}),l.subscribe(e=>{e&&console.error("❌ My entries store error:",e)}));export{q as a,w as b,U as c,P as d,M as e,$ as f,F as g,l as h,y as i,h as l,s as m,L as u};
