import{s as kt,n as et,d as o,i as le,b as l,q as u,c,e as m,v as Ae,g as q,h as d,j as w,k as tt,w as Et,x as qt,r as Qe,a as O,B as lt,p as ke,f as j,z as st,t as D,y as at,G as nt}from"../chunks/orW8a4RU.js";import{e as Ge}from"../chunks/BYoXW1o8.js";import{S as wt,i as jt}from"../chunks/wt4xWrh0.js";import{g as Xe}from"../chunks/3PQ1VwVZ.js";import{p as Dt}from"../chunks/MSnXaxat.js";import{u as St}from"../chunks/cGHQYVPU.js";import{s as xe}from"../chunks/CCM_4jRA.js";function it(t,e,s){const r=t.slice();return r[34]=e[s],r}function rt(t,e,s){const r=t.slice();return r[34]=e[s],r}function Ct(t){let e,s,r=t[5].name+"",a,i,_,k,g,N="Total Entries",R,T,se=t[6].length+"",P,J,ue,K,$="Paid Entries",ae,ie,Z=t[6].filter(bt).length+"",ve,re,Y,W,pe="Entry Fee",oe,ce,de,he=(t[5].entry_fee||0)+"",_e,U,V,z,L="Total Fees",B,H,h,f=t[6].filter(yt).length*(t[5].entry_fee||0)+"",b,p,n,y,v,S,C,ne,X=t[4].size>0?`(${t[4].size})`:"(All)",I,x,G,F,ge,ye=t[4].size>0?`(${t[4].size})`:"(All)",je,ee,A,me,De,Ee=t[4].size>0?`(${t[4].size})`:"(All)",qe,Ne,fe,Se,Ve="← Back",ze,Te,Ie,He,Q=t[4].size>0&&ot(t);function te(E,M){return E[0].length===0?Pt:Tt}let Pe=te(t),be=Pe(t);return{c(){e=d("div"),s=d("h2"),a=D(r),i=w(),_=d("div"),k=d("div"),g=d("span"),g.textContent=N,R=w(),T=d("span"),P=D(se),J=w(),ue=d("div"),K=d("span"),K.textContent=$,ae=w(),ie=d("span"),ve=D(Z),re=w(),Y=d("div"),W=d("span"),W.textContent=pe,oe=w(),ce=d("span"),de=D("$"),_e=D(he),U=w(),V=d("div"),z=d("span"),z.textContent=L,B=w(),H=d("span"),h=D("$"),b=D(f),p=w(),n=d("div"),y=d("input"),v=w(),Q&&Q.c(),S=w(),C=d("button"),ne=D("🖨️ Print Labels "),I=D(X),G=w(),F=d("button"),ge=D("📊 Export CSV "),je=D(ye),A=w(),me=d("button"),De=D("📝 Print Judging Sheets "),qe=D(Ee),fe=w(),Se=d("button"),Se.textContent=Ve,ze=w(),be.c(),Te=st(),this.h()},l(E){e=c(E,"DIV",{class:!0});var M=m(e);s=c(M,"H2",{class:!0});var Ue=m(s);a=j(Ue,r),Ue.forEach(o),i=q(M),_=c(M,"DIV",{class:!0});var Ce=m(_);k=c(Ce,"DIV",{class:!0});var $e=m(k);g=c($e,"SPAN",{class:!0,"data-svelte-h":!0}),Ae(g)!=="svelte-1ly6mm6"&&(g.textContent=N),R=q($e),T=c($e,"SPAN",{class:!0});var Oe=m(T);P=j(Oe,se),Oe.forEach(o),$e.forEach(o),J=q(Ce),ue=c(Ce,"DIV",{class:!0});var Be=m(ue);K=c(Be,"SPAN",{class:!0,"data-svelte-h":!0}),Ae(K)!=="svelte-1e7gzoe"&&(K.textContent=$),ae=q(Be),ie=c(Be,"SPAN",{class:!0});var Re=m(ie);ve=j(Re,Z),Re.forEach(o),Be.forEach(o),re=q(Ce),Y=c(Ce,"DIV",{class:!0});var Je=m(Y);W=c(Je,"SPAN",{class:!0,"data-svelte-h":!0}),Ae(W)!=="svelte-1dw3q0"&&(W.textContent=pe),oe=q(Je),ce=c(Je,"SPAN",{class:!0});var Le=m(ce);de=j(Le,"$"),_e=j(Le,he),Le.forEach(o),Je.forEach(o),U=q(Ce),V=c(Ce,"DIV",{class:!0});var Ye=m(V);z=c(Ye,"SPAN",{class:!0,"data-svelte-h":!0}),Ae(z)!=="svelte-1k6mrzd"&&(z.textContent=L),B=q(Ye),H=c(Ye,"SPAN",{class:!0});var Fe=m(H);h=j(Fe,"$"),b=j(Fe,f),Fe.forEach(o),Ye.forEach(o),Ce.forEach(o),M.forEach(o),p=q(E),n=c(E,"DIV",{class:!0});var we=m(n);y=c(we,"INPUT",{type:!0,class:!0,placeholder:!0}),v=q(we),Q&&Q.l(we),S=q(we),C=c(we,"BUTTON",{class:!0});var Me=m(C);ne=j(Me,"🖨️ Print Labels "),I=j(Me,X),Me.forEach(o),G=q(we),F=c(we,"BUTTON",{class:!0});var Ze=m(F);ge=j(Ze,"📊 Export CSV "),je=j(Ze,ye),Ze.forEach(o),A=q(we),me=c(we,"BUTTON",{class:!0});var Ke=m(me);De=j(Ke,"📝 Print Judging Sheets "),qe=j(Ke,Ee),Ke.forEach(o),fe=q(we),Se=c(we,"BUTTON",{class:!0,"data-svelte-h":!0}),Ae(Se)!=="svelte-52xzlp"&&(Se.textContent=Ve),we.forEach(o),ze=q(E),be.l(E),Te=st(),this.h()},h(){u(s,"class","svelte-1agls9q"),u(g,"class","info-label svelte-1agls9q"),u(T,"class","info-value svelte-1agls9q"),u(k,"class","info-item svelte-1agls9q"),u(K,"class","info-label svelte-1agls9q"),u(ie,"class","info-value svelte-1agls9q"),u(ue,"class","info-item svelte-1agls9q"),u(W,"class","info-label svelte-1agls9q"),u(ce,"class","info-value svelte-1agls9q"),u(Y,"class","info-item svelte-1agls9q"),u(z,"class","info-label svelte-1agls9q"),u(H,"class","info-value svelte-1agls9q"),u(V,"class","info-item svelte-1agls9q"),u(_,"class","info-grid svelte-1agls9q"),u(e,"class","competition-info svelte-1agls9q"),u(y,"type","text"),u(y,"class","search-input svelte-1agls9q"),u(y,"placeholder","Search entries..."),u(C,"class","btn btn-primary svelte-1agls9q"),C.disabled=x=t[0].length===0,u(F,"class","btn btn-success svelte-1agls9q"),F.disabled=ee=t[0].length===0,u(me,"class","btn btn-info svelte-1agls9q"),me.disabled=Ne=t[0].length===0,u(Se,"class","btn btn-secondary svelte-1agls9q"),u(n,"class","controls svelte-1agls9q")},m(E,M){le(E,e,M),l(e,s),l(s,a),l(e,i),l(e,_),l(_,k),l(k,g),l(k,R),l(k,T),l(T,P),l(_,J),l(_,ue),l(ue,K),l(ue,ae),l(ue,ie),l(ie,ve),l(_,re),l(_,Y),l(Y,W),l(Y,oe),l(Y,ce),l(ce,de),l(ce,_e),l(_,U),l(_,V),l(V,z),l(V,B),l(V,H),l(H,h),l(H,b),le(E,p,M),le(E,n,M),l(n,y),lt(y,t[1]),l(n,v),Q&&Q.m(n,null),l(n,S),l(n,C),l(C,ne),l(C,I),l(n,G),l(n,F),l(F,ge),l(F,je),l(n,A),l(n,me),l(me,De),l(me,qe),l(n,fe),l(n,Se),le(E,ze,M),be.m(E,M),le(E,Te,M),Ie||(He=[ke(y,"input",t[19]),ke(C,"click",t[13]),ke(F,"click",t[15]),ke(me,"click",t[16]),ke(Se,"click",t[14])],Ie=!0)},p(E,M){M[0]&32&&r!==(r=E[5].name+"")&&O(a,r),M[0]&64&&se!==(se=E[6].length+"")&&O(P,se),M[0]&64&&Z!==(Z=E[6].filter(bt).length+"")&&O(ve,Z),M[0]&32&&he!==(he=(E[5].entry_fee||0)+"")&&O(_e,he),M[0]&96&&f!==(f=E[6].filter(yt).length*(E[5].entry_fee||0)+"")&&O(b,f),M[0]&2&&y.value!==E[1]&&lt(y,E[1]),E[4].size>0?Q?Q.p(E,M):(Q=ot(E),Q.c(),Q.m(n,S)):Q&&(Q.d(1),Q=null),M[0]&16&&X!==(X=E[4].size>0?`(${E[4].size})`:"(All)")&&O(I,X),M[0]&1&&x!==(x=E[0].length===0)&&(C.disabled=x),M[0]&16&&ye!==(ye=E[4].size>0?`(${E[4].size})`:"(All)")&&O(je,ye),M[0]&1&&ee!==(ee=E[0].length===0)&&(F.disabled=ee),M[0]&16&&Ee!==(Ee=E[4].size>0?`(${E[4].size})`:"(All)")&&O(qe,Ee),M[0]&1&&Ne!==(Ne=E[0].length===0)&&(me.disabled=Ne),Pe===(Pe=te(E))&&be?be.p(E,M):(be.d(1),be=Pe(E),be&&(be.c(),be.m(Te.parentNode,Te)))},d(E){E&&(o(e),o(p),o(n),o(ze),o(Te)),Q&&Q.d(),be.d(E),Ie=!1,Qe(He)}}}function Nt(t){let e,s='<div class="spinner svelte-1agls9q"></div> <p>Loading entries...</p>';return{c(){e=d("div"),e.innerHTML=s,this.h()},l(r){e=c(r,"DIV",{class:!0,"data-svelte-h":!0}),Ae(e)!=="svelte-e96xyd"&&(e.innerHTML=s),this.h()},h(){u(e,"class","loading svelte-1agls9q")},m(r,a){le(r,e,a)},p:et,d(r){r&&o(e)}}}function ot(t){let e,s=t[4].size+"",r,a;return{c(){e=d("span"),r=D(s),a=D(" selected"),this.h()},l(i){e=c(i,"SPAN",{class:!0});var _=m(e);r=j(_,s),a=j(_," selected"),_.forEach(o),this.h()},h(){u(e,"class","selected-count svelte-1agls9q")},m(i,_){le(i,e,_),l(e,r),l(e,a)},p(i,_){_[0]&16&&s!==(s=i[4].size+"")&&O(r,s)},d(i){i&&o(e)}}}function Tt(t){let e,s,r,a,i,_,k,g,N,R,T,se,P,J,ue,K,$,ae,ie,Z,ve,re,Y,W,pe,oe,ce,de,he,_e,U=t[2]==="entry_number"&&ct(t),V=t[2]==="member_name"&&dt(t),z=t[2]==="beer_name"&&ut(t),L=t[2]==="category"&&ft(t),B=t[2]==="paid"&&_t(t),H=t[2]==="submitted_at"&&pt(t),h=Ge(t[0]),f=[];for(let n=0;n<h.length;n+=1)f[n]=vt(rt(t,h,n));let b=Ge(t[0]),p=[];for(let n=0;n<b.length;n+=1)p[n]=gt(it(t,b,n));return{c(){e=d("div"),s=d("table"),r=d("thead"),a=d("tr"),i=d("th"),_=d("input"),k=w(),g=d("th"),N=D(`Entry #
                `),U&&U.c(),R=w(),T=d("th"),se=D(`Member
                `),V&&V.c(),P=w(),J=d("th"),ue=D(`Beer Name
                `),z&&z.c(),K=w(),$=d("th"),ae=D(`Category
                `),L&&L.c(),ie=w(),Z=d("th"),ve=D(`Paid
                `),B&&B.c(),re=w(),Y=d("th"),W=D(`Submitted
                `),H&&H.c(),pe=w(),oe=d("tbody");for(let n=0;n<f.length;n+=1)f[n].c();ce=w(),de=d("div");for(let n=0;n<p.length;n+=1)p[n].c();this.h()},l(n){e=c(n,"DIV",{class:!0});var y=m(e);s=c(y,"TABLE",{class:!0});var v=m(s);r=c(v,"THEAD",{});var S=m(r);a=c(S,"TR",{class:!0});var C=m(a);i=c(C,"TH",{class:!0});var ne=m(i);_=c(ne,"INPUT",{type:!0}),ne.forEach(o),k=q(C),g=c(C,"TH",{class:!0});var X=m(g);N=j(X,`Entry #
                `),U&&U.l(X),X.forEach(o),R=q(C),T=c(C,"TH",{class:!0});var I=m(T);se=j(I,`Member
                `),V&&V.l(I),I.forEach(o),P=q(C),J=c(C,"TH",{class:!0});var x=m(J);ue=j(x,`Beer Name
                `),z&&z.l(x),x.forEach(o),K=q(C),$=c(C,"TH",{class:!0});var G=m($);ae=j(G,`Category
                `),L&&L.l(G),G.forEach(o),ie=q(C),Z=c(C,"TH",{class:!0});var F=m(Z);ve=j(F,`Paid
                `),B&&B.l(F),F.forEach(o),re=q(C),Y=c(C,"TH",{class:!0});var ge=m(Y);W=j(ge,`Submitted
                `),H&&H.l(ge),ge.forEach(o),C.forEach(o),S.forEach(o),pe=q(v),oe=c(v,"TBODY",{});var ye=m(oe);for(let ee=0;ee<f.length;ee+=1)f[ee].l(ye);ye.forEach(o),v.forEach(o),y.forEach(o),ce=q(n),de=c(n,"DIV",{class:!0});var je=m(de);for(let ee=0;ee<p.length;ee+=1)p[ee].l(je);je.forEach(o),this.h()},h(){u(_,"type","checkbox"),_.checked=t[8],u(i,"class","checkbox-cell svelte-1agls9q"),u(g,"class","svelte-1agls9q"),u(T,"class","svelte-1agls9q"),u(J,"class","svelte-1agls9q"),u($,"class","svelte-1agls9q"),u(Z,"class","svelte-1agls9q"),u(Y,"class","svelte-1agls9q"),u(a,"class","svelte-1agls9q"),u(s,"class","svelte-1agls9q"),u(e,"class","entries-table svelte-1agls9q"),u(de,"class","entries-cards svelte-1agls9q")},m(n,y){le(n,e,y),l(e,s),l(s,r),l(r,a),l(a,i),l(i,_),l(a,k),l(a,g),l(g,N),U&&U.m(g,null),l(a,R),l(a,T),l(T,se),V&&V.m(T,null),l(a,P),l(a,J),l(J,ue),z&&z.m(J,null),l(a,K),l(a,$),l($,ae),L&&L.m($,null),l(a,ie),l(a,Z),l(Z,ve),B&&B.m(Z,null),l(a,re),l(a,Y),l(Y,W),H&&H.m(Y,null),l(s,pe),l(s,oe);for(let v=0;v<f.length;v+=1)f[v]&&f[v].m(oe,null);le(n,ce,y),le(n,de,y);for(let v=0;v<p.length;v+=1)p[v]&&p[v].m(de,null);he||(_e=[ke(_,"change",t[11]),ke(g,"click",t[20]),ke(T,"click",t[21]),ke(J,"click",t[22]),ke($,"click",t[23]),ke(Z,"click",t[24]),ke(Y,"click",t[25])],he=!0)},p(n,y){if(y[0]&256&&(_.checked=n[8]),n[2]==="entry_number"?U?U.p(n,y):(U=ct(n),U.c(),U.m(g,null)):U&&(U.d(1),U=null),n[2]==="member_name"?V?V.p(n,y):(V=dt(n),V.c(),V.m(T,null)):V&&(V.d(1),V=null),n[2]==="beer_name"?z?z.p(n,y):(z=ut(n),z.c(),z.m(J,null)):z&&(z.d(1),z=null),n[2]==="category"?L?L.p(n,y):(L=ft(n),L.c(),L.m($,null)):L&&(L.d(1),L=null),n[2]==="paid"?B?B.p(n,y):(B=_t(n),B.c(),B.m(Z,null)):B&&(B.d(1),B=null),n[2]==="submitted_at"?H?H.p(n,y):(H=pt(n),H.c(),H.m(Y,null)):H&&(H.d(1),H=null),y[0]&5137){h=Ge(n[0]);let v;for(v=0;v<h.length;v+=1){const S=rt(n,h,v);f[v]?f[v].p(S,y):(f[v]=vt(S),f[v].c(),f[v].m(oe,null))}for(;v<f.length;v+=1)f[v].d(1);f.length=h.length}if(y[0]&5137){b=Ge(n[0]);let v;for(v=0;v<b.length;v+=1){const S=it(n,b,v);p[v]?p[v].p(S,y):(p[v]=gt(S),p[v].c(),p[v].m(de,null))}for(;v<p.length;v+=1)p[v].d(1);p.length=b.length}},d(n){n&&(o(e),o(ce),o(de)),U&&U.d(),V&&V.d(),z&&z.d(),L&&L.d(),B&&B.d(),H&&H.d(),at(f,n),at(p,n),he=!1,Qe(_e)}}}function Pt(t){let e,s,r="No entries found",a,i;function _(N,R){return N[1]?It:zt}let k=_(t),g=k(t);return{c(){e=d("div"),s=d("h3"),s.textContent=r,a=w(),i=d("p"),g.c(),this.h()},l(N){e=c(N,"DIV",{class:!0});var R=m(e);s=c(R,"H3",{"data-svelte-h":!0}),Ae(s)!=="svelte-12l3juz"&&(s.textContent=r),a=q(R),i=c(R,"P",{});var T=m(i);g.l(T),T.forEach(o),R.forEach(o),this.h()},h(){u(e,"class","empty-state svelte-1agls9q")},m(N,R){le(N,e,R),l(e,s),l(e,a),l(e,i),g.m(i,null)},p(N,R){k!==(k=_(N))&&(g.d(1),g=k(N),g&&(g.c(),g.m(i,null)))},d(N){N&&o(e),g.d()}}}function ct(t){let e,s=t[3]==="asc"?"↑":"↓",r;return{c(){e=d("span"),r=D(s),this.h()},l(a){e=c(a,"SPAN",{class:!0});var i=m(e);r=j(i,s),i.forEach(o),this.h()},h(){u(e,"class","sort-indicator svelte-1agls9q")},m(a,i){le(a,e,i),l(e,r)},p(a,i){i[0]&8&&s!==(s=a[3]==="asc"?"↑":"↓")&&O(r,s)},d(a){a&&o(e)}}}function dt(t){let e,s=t[3]==="asc"?"↑":"↓",r;return{c(){e=d("span"),r=D(s),this.h()},l(a){e=c(a,"SPAN",{class:!0});var i=m(e);r=j(i,s),i.forEach(o),this.h()},h(){u(e,"class","sort-indicator svelte-1agls9q")},m(a,i){le(a,e,i),l(e,r)},p(a,i){i[0]&8&&s!==(s=a[3]==="asc"?"↑":"↓")&&O(r,s)},d(a){a&&o(e)}}}function ut(t){let e,s=t[3]==="asc"?"↑":"↓",r;return{c(){e=d("span"),r=D(s),this.h()},l(a){e=c(a,"SPAN",{class:!0});var i=m(e);r=j(i,s),i.forEach(o),this.h()},h(){u(e,"class","sort-indicator svelte-1agls9q")},m(a,i){le(a,e,i),l(e,r)},p(a,i){i[0]&8&&s!==(s=a[3]==="asc"?"↑":"↓")&&O(r,s)},d(a){a&&o(e)}}}function ft(t){let e,s=t[3]==="asc"?"↑":"↓",r;return{c(){e=d("span"),r=D(s),this.h()},l(a){e=c(a,"SPAN",{class:!0});var i=m(e);r=j(i,s),i.forEach(o),this.h()},h(){u(e,"class","sort-indicator svelte-1agls9q")},m(a,i){le(a,e,i),l(e,r)},p(a,i){i[0]&8&&s!==(s=a[3]==="asc"?"↑":"↓")&&O(r,s)},d(a){a&&o(e)}}}function _t(t){let e,s=t[3]==="asc"?"↑":"↓",r;return{c(){e=d("span"),r=D(s),this.h()},l(a){e=c(a,"SPAN",{class:!0});var i=m(e);r=j(i,s),i.forEach(o),this.h()},h(){u(e,"class","sort-indicator svelte-1agls9q")},m(a,i){le(a,e,i),l(e,r)},p(a,i){i[0]&8&&s!==(s=a[3]==="asc"?"↑":"↓")&&O(r,s)},d(a){a&&o(e)}}}function pt(t){let e,s=t[3]==="asc"?"↑":"↓",r;return{c(){e=d("span"),r=D(s),this.h()},l(a){e=c(a,"SPAN",{class:!0});var i=m(e);r=j(i,s),i.forEach(o),this.h()},h(){u(e,"class","sort-indicator svelte-1agls9q")},m(a,i){le(a,e,i),l(e,r)},p(a,i){i[0]&8&&s!==(s=a[3]==="asc"?"↑":"↓")&&O(r,s)},d(a){a&&o(e)}}}function mt(t){let e,s,r=t[34].bjcp_category.category_name+"",a;return{c(){e=d("br"),s=d("small"),a=D(r)},l(i){e=c(i,"BR",{}),s=c(i,"SMALL",{});var _=m(s);a=j(_,r),_.forEach(o)},m(i,_){le(i,e,_),le(i,s,_),l(s,a)},p(i,_){_[0]&1&&r!==(r=i[34].bjcp_category.category_name+"")&&O(a,r)},d(i){i&&(o(e),o(s))}}}function vt(t){var G,F,ge,ye,je;let e,s,r,a,i,_,k,g=t[34].entry_number+"",N,R,T,se,P=((G=t[34].members)==null?void 0:G.name)+"",J,ue,K,$=((F=t[34].members)==null?void 0:F.email)+"",ae,ie,Z,ve=(t[34].beer_name||"-")+"",re,Y,W,pe,oe=(((ge=t[34].bjcp_category)==null?void 0:ge.category_number)||"")+"",ce,de=(((ye=t[34].bjcp_category)==null?void 0:ye.subcategory_letter)||"")+"",he,_e,U,V,z,L,B,H,h,f=t[34].is_paid?"Paid":"Unpaid",b,p,n,y=We(t[34].submitted_at)+"",v,S,C,ne;function X(){return t[26](t[34])}let I=((je=t[34].bjcp_category)==null?void 0:je.category_name)&&mt(t);function x(){return t[27](t[34])}return{c(){e=d("tr"),s=d("td"),r=d("input"),i=w(),_=d("td"),k=d("span"),N=D(g),R=w(),T=d("td"),se=d("div"),J=D(P),ue=w(),K=d("small"),ae=D($),ie=w(),Z=d("td"),re=D(ve),Y=w(),W=d("td"),pe=d("span"),ce=D(oe),he=D(de),_e=w(),I&&I.c(),U=w(),V=d("td"),z=d("div"),L=d("div"),H=w(),h=d("span"),b=D(f),p=w(),n=d("td"),v=D(y),S=w(),this.h()},l(ee){e=c(ee,"TR",{class:!0});var A=m(e);s=c(A,"TD",{class:!0});var me=m(s);r=c(me,"INPUT",{type:!0}),me.forEach(o),i=q(A),_=c(A,"TD",{class:!0});var De=m(_);k=c(De,"SPAN",{class:!0});var Ee=m(k);N=j(Ee,g),Ee.forEach(o),De.forEach(o),R=q(A),T=c(A,"TD",{class:!0});var qe=m(T);se=c(qe,"DIV",{});var Ne=m(se);J=j(Ne,P),Ne.forEach(o),ue=q(qe),K=c(qe,"SMALL",{});var fe=m(K);ae=j(fe,$),fe.forEach(o),qe.forEach(o),ie=q(A),Z=c(A,"TD",{class:!0});var Se=m(Z);re=j(Se,ve),Se.forEach(o),Y=q(A),W=c(A,"TD",{class:!0});var Ve=m(W);pe=c(Ve,"SPAN",{class:!0});var ze=m(pe);ce=j(ze,oe),he=j(ze,de),ze.forEach(o),_e=q(Ve),I&&I.l(Ve),Ve.forEach(o),U=q(A),V=c(A,"TD",{class:!0});var Te=m(V);z=c(Te,"DIV",{class:!0});var Ie=m(z);L=c(Ie,"DIV",{class:!0}),m(L).forEach(o),H=q(Ie),h=c(Ie,"SPAN",{});var He=m(h);b=j(He,f),He.forEach(o),Ie.forEach(o),Te.forEach(o),p=q(A),n=c(A,"TD",{class:!0});var Q=m(n);v=j(Q,y),Q.forEach(o),S=q(A),A.forEach(o),this.h()},h(){u(r,"type","checkbox"),r.checked=a=t[4].has(t[34].id),u(s,"class","checkbox-cell svelte-1agls9q"),u(k,"class","entry-number svelte-1agls9q"),u(_,"class","svelte-1agls9q"),u(T,"class","svelte-1agls9q"),u(Z,"class","svelte-1agls9q"),u(pe,"class","category-badge svelte-1agls9q"),u(W,"class","svelte-1agls9q"),u(L,"class",B="toggle-switch "+(t[34].is_paid?"active":"")+" svelte-1agls9q"),u(z,"class","payment-toggle svelte-1agls9q"),u(V,"class","svelte-1agls9q"),u(n,"class","svelte-1agls9q"),u(e,"class","svelte-1agls9q")},m(ee,A){le(ee,e,A),l(e,s),l(s,r),l(e,i),l(e,_),l(_,k),l(k,N),l(e,R),l(e,T),l(T,se),l(se,J),l(T,ue),l(T,K),l(K,ae),l(e,ie),l(e,Z),l(Z,re),l(e,Y),l(e,W),l(W,pe),l(pe,ce),l(pe,he),l(W,_e),I&&I.m(W,null),l(e,U),l(e,V),l(V,z),l(z,L),l(z,H),l(z,h),l(h,b),l(e,p),l(e,n),l(n,v),l(e,S),C||(ne=[ke(r,"change",X),ke(L,"click",x)],C=!0)},p(ee,A){var me,De,Ee,qe,Ne;t=ee,A[0]&17&&a!==(a=t[4].has(t[34].id))&&(r.checked=a),A[0]&1&&g!==(g=t[34].entry_number+"")&&O(N,g),A[0]&1&&P!==(P=((me=t[34].members)==null?void 0:me.name)+"")&&O(J,P),A[0]&1&&$!==($=((De=t[34].members)==null?void 0:De.email)+"")&&O(ae,$),A[0]&1&&ve!==(ve=(t[34].beer_name||"-")+"")&&O(re,ve),A[0]&1&&oe!==(oe=(((Ee=t[34].bjcp_category)==null?void 0:Ee.category_number)||"")+"")&&O(ce,oe),A[0]&1&&de!==(de=(((qe=t[34].bjcp_category)==null?void 0:qe.subcategory_letter)||"")+"")&&O(he,de),(Ne=t[34].bjcp_category)!=null&&Ne.category_name?I?I.p(t,A):(I=mt(t),I.c(),I.m(W,null)):I&&(I.d(1),I=null),A[0]&1&&B!==(B="toggle-switch "+(t[34].is_paid?"active":"")+" svelte-1agls9q")&&u(L,"class",B),A[0]&1&&f!==(f=t[34].is_paid?"Paid":"Unpaid")&&O(b,f),A[0]&1&&y!==(y=We(t[34].submitted_at)+"")&&O(v,y)},d(ee){ee&&o(e),I&&I.d(),C=!1,Qe(ne)}}}function ht(t){let e,s,r=t[34].bjcp_category.category_name+"",a;return{c(){e=d("br"),s=d("small"),a=D(r),this.h()},l(i){e=c(i,"BR",{}),s=c(i,"SMALL",{style:!0});var _=m(s);a=j(_,r),_.forEach(o),this.h()},h(){nt(s,"color","#666"),nt(s,"font-size","0.8rem")},m(i,_){le(i,e,_),le(i,s,_),l(s,a)},p(i,_){_[0]&1&&r!==(r=i[34].bjcp_category.category_name+"")&&O(a,r)},d(i){i&&(o(e),o(s))}}}function gt(t){var Ve,ze,Te,Ie,He;let e,s,r,a,i,_=t[34].entry_number+"",k,g,N,R=(t[34].beer_name||"No name provided")+"",T,se,P,J,ue,K,$,ae,ie,Z="Category",ve,re,Y,W=(((Ve=t[34].bjcp_category)==null?void 0:Ve.category_number)||"")+"",pe,oe=(((ze=t[34].bjcp_category)==null?void 0:ze.subcategory_letter)||"")+"",ce,de,he,_e,U,V="Submitted",z,L,B=We(t[34].submitted_at)+"",H,h,f,b,p="Brewer Information",n,y,v=((Te=t[34].members)==null?void 0:Te.name)+"",S,C,ne,X=((Ie=t[34].members)==null?void 0:Ie.email)+"",I,x,G,F,ge,ye,je,ee,A=t[34].is_paid?"Paid":"Unpaid",me,De,Ee,qe;function Ne(){return t[28](t[34])}let fe=((He=t[34].bjcp_category)==null?void 0:He.category_name)&&ht(t);function Se(){return t[29](t[34])}return{c(){e=d("div"),s=d("div"),r=d("div"),a=d("h4"),i=D("#"),k=D(_),g=w(),N=d("div"),T=D(R),se=w(),P=d("div"),J=d("input"),K=w(),$=d("div"),ae=d("div"),ie=d("span"),ie.textContent=Z,ve=w(),re=d("div"),Y=d("span"),pe=D(W),ce=D(oe),de=w(),fe&&fe.c(),he=w(),_e=d("div"),U=d("span"),U.textContent=V,z=w(),L=d("span"),H=D(B),h=w(),f=d("div"),b=d("h5"),b.textContent=p,n=w(),y=d("div"),S=D(v),C=w(),ne=d("div"),I=D(X),x=w(),G=d("div"),F=d("div"),ge=d("div"),je=w(),ee=d("span"),me=D(A),De=w(),this.h()},l(Q){e=c(Q,"DIV",{class:!0});var te=m(e);s=c(te,"DIV",{class:!0});var Pe=m(s);r=c(Pe,"DIV",{class:!0});var be=m(r);a=c(be,"H4",{class:!0});var E=m(a);i=j(E,"#"),k=j(E,_),E.forEach(o),g=q(be),N=c(be,"DIV",{class:!0});var M=m(N);T=j(M,R),M.forEach(o),be.forEach(o),se=q(Pe),P=c(Pe,"DIV",{class:!0});var Ue=m(P);J=c(Ue,"INPUT",{type:!0}),Ue.forEach(o),Pe.forEach(o),K=q(te),$=c(te,"DIV",{class:!0});var Ce=m($);ae=c(Ce,"DIV",{class:!0});var $e=m(ae);ie=c($e,"SPAN",{class:!0,"data-svelte-h":!0}),Ae(ie)!=="svelte-13uauhn"&&(ie.textContent=Z),ve=q($e),re=c($e,"DIV",{class:!0});var Oe=m(re);Y=c(Oe,"SPAN",{class:!0});var Be=m(Y);pe=j(Be,W),ce=j(Be,oe),Be.forEach(o),de=q(Oe),fe&&fe.l(Oe),Oe.forEach(o),$e.forEach(o),he=q(Ce),_e=c(Ce,"DIV",{class:!0});var Re=m(_e);U=c(Re,"SPAN",{class:!0,"data-svelte-h":!0}),Ae(U)!=="svelte-baos0g"&&(U.textContent=V),z=q(Re),L=c(Re,"SPAN",{class:!0});var Je=m(L);H=j(Je,B),Je.forEach(o),Re.forEach(o),Ce.forEach(o),h=q(te),f=c(te,"DIV",{class:!0});var Le=m(f);b=c(Le,"H5",{class:!0,"data-svelte-h":!0}),Ae(b)!=="svelte-6h9wyx"&&(b.textContent=p),n=q(Le),y=c(Le,"DIV",{class:!0});var Ye=m(y);S=j(Ye,v),Ye.forEach(o),C=q(Le),ne=c(Le,"DIV",{class:!0});var Fe=m(ne);I=j(Fe,X),Fe.forEach(o),Le.forEach(o),x=q(te),G=c(te,"DIV",{class:!0});var we=m(G);F=c(we,"DIV",{class:!0});var Me=m(F);ge=c(Me,"DIV",{class:!0}),m(ge).forEach(o),je=q(Me),ee=c(Me,"SPAN",{});var Ze=m(ee);me=j(Ze,A),Ze.forEach(o),Me.forEach(o),we.forEach(o),De=q(te),te.forEach(o),this.h()},h(){u(a,"class","svelte-1agls9q"),u(N,"class","beer-name svelte-1agls9q"),u(r,"class","entry-info svelte-1agls9q"),u(J,"type","checkbox"),J.checked=ue=t[4].has(t[34].id),u(P,"class","entry-actions svelte-1agls9q"),u(s,"class","entry-header svelte-1agls9q"),u(ie,"class","label svelte-1agls9q"),u(Y,"class","category-mobile svelte-1agls9q"),u(re,"class","value svelte-1agls9q"),u(ae,"class","detail-group svelte-1agls9q"),u(U,"class","label svelte-1agls9q"),u(L,"class","value svelte-1agls9q"),u(_e,"class","detail-group svelte-1agls9q"),u($,"class","entry-details svelte-1agls9q"),u(b,"class","svelte-1agls9q"),u(y,"class","name svelte-1agls9q"),u(ne,"class","email svelte-1agls9q"),u(f,"class","member-info svelte-1agls9q"),u(ge,"class",ye="toggle-switch "+(t[34].is_paid?"active":"")+" svelte-1agls9q"),u(F,"class","payment-toggle svelte-1agls9q"),u(G,"class","payment-status-mobile svelte-1agls9q"),u(e,"class","entry-card svelte-1agls9q")},m(Q,te){le(Q,e,te),l(e,s),l(s,r),l(r,a),l(a,i),l(a,k),l(r,g),l(r,N),l(N,T),l(s,se),l(s,P),l(P,J),l(e,K),l(e,$),l($,ae),l(ae,ie),l(ae,ve),l(ae,re),l(re,Y),l(Y,pe),l(Y,ce),l(re,de),fe&&fe.m(re,null),l($,he),l($,_e),l(_e,U),l(_e,z),l(_e,L),l(L,H),l(e,h),l(e,f),l(f,b),l(f,n),l(f,y),l(y,S),l(f,C),l(f,ne),l(ne,I),l(e,x),l(e,G),l(G,F),l(F,ge),l(F,je),l(F,ee),l(ee,me),l(e,De),Ee||(qe=[ke(J,"change",Ne),ke(ge,"click",Se)],Ee=!0)},p(Q,te){var Pe,be,E,M,Ue;t=Q,te[0]&1&&_!==(_=t[34].entry_number+"")&&O(k,_),te[0]&1&&R!==(R=(t[34].beer_name||"No name provided")+"")&&O(T,R),te[0]&17&&ue!==(ue=t[4].has(t[34].id))&&(J.checked=ue),te[0]&1&&W!==(W=(((Pe=t[34].bjcp_category)==null?void 0:Pe.category_number)||"")+"")&&O(pe,W),te[0]&1&&oe!==(oe=(((be=t[34].bjcp_category)==null?void 0:be.subcategory_letter)||"")+"")&&O(ce,oe),(E=t[34].bjcp_category)!=null&&E.category_name?fe?fe.p(t,te):(fe=ht(t),fe.c(),fe.m(re,null)):fe&&(fe.d(1),fe=null),te[0]&1&&B!==(B=We(t[34].submitted_at)+"")&&O(H,B),te[0]&1&&v!==(v=((M=t[34].members)==null?void 0:M.name)+"")&&O(S,v),te[0]&1&&X!==(X=((Ue=t[34].members)==null?void 0:Ue.email)+"")&&O(I,X),te[0]&1&&ye!==(ye="toggle-switch "+(t[34].is_paid?"active":"")+" svelte-1agls9q")&&u(ge,"class",ye),te[0]&1&&A!==(A=t[34].is_paid?"Paid":"Unpaid")&&O(me,A)},d(Q){Q&&o(e),fe&&fe.d(),Ee=!1,Qe(qe)}}}function zt(t){let e;return{c(){e=D("No entries have been submitted yet")},l(s){e=j(s,"No entries have been submitted yet")},m(s,r){le(s,e,r)},d(s){s&&o(e)}}}function It(t){let e;return{c(){e=D("Try adjusting your search")},l(s){e=j(s,"Try adjusting your search")},m(s,r){le(s,e,r)},d(s){s&&o(e)}}}function At(t){let e,s,r='<h1 class="svelte-1agls9q"><span class="emoji svelte-1agls9q">📋</span> Competition Entries</h1> <p class="subtitle svelte-1agls9q">Manage entries and print labels</p>',a;function i(g,N){if(g[7])return Nt;if(g[5])return Ct}let _=i(t),k=_&&_(t);return{c(){e=d("div"),s=d("div"),s.innerHTML=r,a=w(),k&&k.c(),this.h()},l(g){e=c(g,"DIV",{class:!0});var N=m(e);s=c(N,"DIV",{class:!0,"data-svelte-h":!0}),Ae(s)!=="svelte-7nznvx"&&(s.innerHTML=r),a=q(N),k&&k.l(N),N.forEach(o),this.h()},h(){u(s,"class","hero svelte-1agls9q"),u(e,"class","container svelte-1agls9q")},m(g,N){le(g,e,N),l(e,s),l(e,a),k&&k.m(e,null)},p(g,N){_===(_=i(g))&&k?k.p(g,N):(k&&k.d(1),k=_&&_(g),k&&(k.c(),k.m(e,null)))},i:et,o:et,d(g){g&&o(e),k&&k.d()}}}function We(t){if(!t||t===null||t===void 0)return"No date";try{const e=String(t).trim();let s=e;if(e.includes(" ")&&!e.includes("T")){if(s=e.replace(" ","T"),s.includes(".")){const[a,i]=s.split("."),_=i.substring(0,3);s=`${a}.${_}`}!s.includes("+")&&!s.includes("Z")&&(s+="Z")}const r=new Date(s);return isNaN(r.getTime())?(console.warn("Invalid date after parsing:",e,"->",s),"Invalid Date"):r.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return console.warn("Error formatting date:",t,e),"Invalid Date"}}const bt=t=>t.is_paid,yt=t=>t.is_paid;function Vt(t,e,s){let r,a,i;tt(t,Dt,h=>s(17,a=h)),tt(t,St,h=>s(18,i=h));let _=null,k=[],g=[],N=!0,R="",T="entry_number",se="asc",P=new Set,J=!1;Et(()=>{ue()}),qt(()=>{});async function ue(){s(7,N=!0);try{const{data:h,error:f}=await xe.from("competitions").select("*").eq("id",r).single();if(f)throw f;s(5,_=h);const{data:b,error:p}=await xe.from("competition_entries").select(`
          *,
          members!inner(
            name,
            email,
            phone
          ),
          bjcp_category:bjcp_categories(
            id,
            category_number,
            subcategory_letter,
            subcategory_name,
            category_name
          )
        `).eq("competition_id",r).order("entry_number");if(p)throw p;s(6,k=b||[]),K()}catch(h){console.error("Error loading data:",h),alert("Failed to load competition entries"),Xe("/officers/manage-competitions")}finally{s(7,N=!1)}}function K(){let h=[...k];if(R.trim()){const f=R.toLowerCase();h=h.filter(b=>{var p,n,y,v,S,C,ne,X,I,x,G,F;return((p=b.entry_number)==null?void 0:p.toLowerCase().includes(f))||((n=b.beer_name)==null?void 0:n.toLowerCase().includes(f))||((v=(y=b.members)==null?void 0:y.name)==null?void 0:v.toLowerCase().includes(f))||((C=(S=b.members)==null?void 0:S.email)==null?void 0:C.toLowerCase().includes(f))||((X=(ne=b.bjcp_category)==null?void 0:ne.category_name)==null?void 0:X.toLowerCase().includes(f))||`${(I=b.bjcp_category)==null?void 0:I.category_number}${(x=b.bjcp_category)==null?void 0:x.subcategory_letter}`.toLowerCase().includes(f)||((G=b.special_ingredients)==null?void 0:G.toLowerCase().includes(f))||((F=b.notes)==null?void 0:F.toLowerCase().includes(f))})}h.sort((f,b)=>{var y,v,S,C,ne,X;let p,n;switch(T){case"entry_number":p=f.entry_number||"",n=b.entry_number||"";break;case"member_name":p=((y=f.members)==null?void 0:y.name)||"",n=((v=b.members)==null?void 0:v.name)||"";break;case"beer_name":p=f.beer_name||"",n=b.beer_name||"";break;case"category":p=`${((S=f.bjcp_category)==null?void 0:S.category_number)||""}${((C=f.bjcp_category)==null?void 0:C.subcategory_letter)||""}`,n=`${((ne=b.bjcp_category)==null?void 0:ne.category_number)||""}${((X=b.bjcp_category)==null?void 0:X.subcategory_letter)||""}`;break;case"paid":p=f.is_paid?1:0,n=b.is_paid?1:0;break;case"submitted_at":const I=x=>{if(!x)return new Date(0);let G=x;if(x.includes(" ")&&!x.includes("T")){if(G=x.replace(" ","T"),G.includes(".")){const[F,ge]=G.split("."),ye=ge.substring(0,3);G=`${F}.${ye}`}!G.includes("+")&&!G.includes("Z")&&(G+="Z")}return new Date(G)};p=I(f.submitted_at),n=I(b.submitted_at);break;default:p=f[T]||"",n=b[T]||""}return se==="asc"?p>n?1:p<n?-1:0:p<n?1:p>n?-1:0}),s(0,g=h)}function $(h){T===h?s(3,se=se==="asc"?"desc":"asc"):(s(2,T=h),s(3,se="asc")),K()}function ae(h){P.has(h)?P.delete(h):P.add(h),s(4,P=new Set(P))}function ie(){J?P.clear():g.forEach(h=>P.add(h.id)),s(4,P=new Set(P)),s(8,J=!J)}async function Z(h,f){try{const{error:b}=await xe.from("competition_entries").update({is_paid:f,payment_date:f?new Date().toISOString():null}).eq("id",h);if(b)throw b;const p=k.findIndex(n=>n.id===h);p!==-1&&(s(6,k[p].is_paid=f,k),s(6,k[p].payment_date=f?new Date().toISOString():null,k),K())}catch(b){console.error("Error updating payment status:",b),alert("Failed to update payment status")}}function ve(){const h=P.size>0?g.filter(p=>P.has(p.id)):g;if(h.length===0){alert("No entries selected for printing");return}const f=window.open("","_blank"),b=h.flatMap(p=>{var y,v,S,C;const n=`
      <div class="label">
        <div class="label-header">
          <strong>${(_==null?void 0:_.name)||"Competition"}</strong>
        </div>
        <div class="entry-number">
          Entry #: <span>${p.entry_number}</span>
        </div>
        <div class="beer-style">
          Style: <span>${((y=p.bjcp_category)==null?void 0:y.category_number)||""}${((v=p.bjcp_category)==null?void 0:v.subcategory_letter)||""}</span> - ${((S=p.bjcp_category)==null?void 0:S.category_name)||""}
          ${(C=p.bjcp_category)!=null&&C.subcategory_name?`<br><small>${p.bjcp_category.subcategory_name}</small>`:""}
          ${p.beer_notes?`<br><small>Special: ${p.beer_notes}</small>`:""}
        </div>
        ${p.notes?`
          <div class="notes">
            Notes: ${p.notes}
          </div>
        `:""}
      </div>
    `;return[n,n,n]}).join("");f.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Competition Entry Labels</title>
      <style>
        @page {
          size: 8.5in 11in;
          margin: 0.5in;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .labels-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.1875in;
          justify-content: flex-start;
        }
        .label {
          width: 2.25in;
          height: 2.25in;
          padding: 0.125in;
          box-sizing: border-box;
          border: 1px solid #000;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-bottom: 0.1875in;
          break-inside: avoid;
        }
        .label-header {
          font-size: 10pt;
          text-align: center;
          margin-bottom: 0.1in;
          border-bottom: 1px solid #000;
          padding-bottom: 0.05in;
        }
        .entry-number {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 0.1in;
        }
        .entry-number span {
          font-size: 18pt;
          color: #ff3e00;
        }
        .beer-style {
          font-size: 10pt;
          margin-bottom: 0.1in;
        }
        .beer-style span {
          font-weight: bold;
          font-size: 12pt;
        }
        .beer-style small {
          font-size: 9pt;
        }
        .special, .notes {
          font-size: 9pt;
          margin-top: 0.05in;
          padding-top: 0.05in;
          border-top: 1px solid #ccc;
        }
        @media print {
          .label {
            border: 1px solid #000 !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="labels-container">
        ${b}
      </div>
    </body>
    </html>
  `),f.document.close(),f.focus(),setTimeout(()=>{f.print(),f.close()},250)}function re(){Xe("/officers/manage-competitions")}function Y(){const h=P.size>0?g.filter(S=>P.has(S.id)):g;if(h.length===0){alert("No entries to export");return}const p=[["Entry Number","Member Name","Beer Name","Category Number","Category Name","Subcategory Name","Paid","Submitted Date"].join(","),...h.map(S=>{var C,ne,X,I,x;return[S.entry_number||"",`"${((C=S.members)==null?void 0:C.name)||""}"`,`"${S.beer_name||""}"`,`${((ne=S.bjcp_category)==null?void 0:ne.category_number)||""}${((X=S.bjcp_category)==null?void 0:X.subcategory_letter)||""}`,`"${((I=S.bjcp_category)==null?void 0:I.category_name)||""}"`,`"${((x=S.bjcp_category)==null?void 0:x.subcategory_name)||""}"`,S.is_paid?"Yes":"No",We(S.submitted_at)].join(",")})].join(`
`),n=new Blob([p],{type:"text/csv"}),y=window.URL.createObjectURL(n),v=document.createElement("a");v.href=y,v.download=`${(_==null?void 0:_.name)||"competition"}_entries_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(v),v.click(),document.body.removeChild(v),window.URL.revokeObjectURL(y)}function W(){const h=P.size>0?g.filter(p=>P.has(p.id)):g;if(h.length===0){alert("No entries to print judging sheets for");return}const f=window.open("","_blank"),b=pe(h);f.document.write(b),f.document.close(),f.onload=()=>{f.print(),f.close()}}function pe(h){const f=(_==null?void 0:_.name)||"Competition",b=new Date().toLocaleDateString();return`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Judging Sheet - ${f}</title>
          <style>
            @media print {
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              margin: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            
            .competition-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .judge-info {
              margin: 20px 0;
              border: 1px solid #666;
              padding: 15px;
            }
            
            .judge-line {
              display: inline-block;
              border-bottom: 1px solid #333;
              width: 200px;
              height: 20px;
              margin: 0 10px;
            }
            
            .entries-section {
              margin: 20px 0;
            }
            
            .entry-item {
              border: 1px solid #ccc;
              margin-bottom: 15px;
              padding: 10px;
              background-color: #fafafa;
            }
            
            .entry-header {
              font-weight: bold;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            
            .entry-number {
              font-size: 14px;
              color: #000;
            }
            
            .beer-style {
              color: #666;
              font-size: 11px;
            }
            
            .tasting-notes {
              margin-top: 10px;
            }
            
            .notes-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .notes-lines {
              border-bottom: 1px solid #ccc;
              height: 80px;
              margin-bottom: 10px;
            }
            
            .top-picks {
              margin-top: 40px;
              border: 2px solid #333;
              padding: 20px;
              background-color: #f0f0f0;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .top-picks-title {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 20px;
            }
            
            .pick-line {
              margin: 15px 0;
              font-size: 14px;
            }
            
            .pick-number {
              display: inline-block;
              border-bottom: 2px solid #333;
              width: 100px;
              height: 25px;
              margin-left: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="competition-title">${f} - Judging Sheet</div>
            <div>Date: ${b}</div>
          </div>
          
          <div class="judge-info">
            <strong>Judge Name:</strong> <span class="judge-line"></span>
            <strong style="margin-left: 40px;">Signature:</strong> <span class="judge-line"></span>
          </div>
          
          <div class="entries-section">
            ${h.map(p=>{var n,y,v,S;return`
              <div class="entry-item">
                <div class="entry-header">
                  <div class="entry-number">Entry #${p.entry_number}</div>
                  <div class="beer-style">
                    ${((n=p.bjcp_category)==null?void 0:n.category_number)||""}${((y=p.bjcp_category)==null?void 0:y.subcategory_letter)||""} - 
                    ${((v=p.bjcp_category)==null?void 0:v.category_name)||"Unknown Category"}${(S=p.bjcp_category)!=null&&S.subcategory_name?` - ${p.bjcp_category.subcategory_name}`:""}
                  </div>
                </div>
                ${p.beer_notes?`<div><strong>Additional Notes:</strong> ${p.beer_notes}</div>`:""}
                <div class="tasting-notes">
                  <div class="notes-label">Tasting Notes:</div>
                  <div class="notes-lines"></div>
                </div>
              </div>
            `}).join("")}
          </div>
          
          <div class="top-picks">
            <div class="top-picks-title">Your Top 3 Picks</div>
            <div class="pick-line">
              <strong>1st Place Entry #:</strong> <span class="pick-number"></span>
            </div>
            <div class="pick-line">
              <strong>2nd Place Entry #:</strong> <span class="pick-number"></span>
            </div>
            <div class="pick-line">
              <strong>3rd Place Entry #:</strong> <span class="pick-number"></span>
            </div>
          </div>
        </body>
      </html>
    `}function oe(){R=this.value,s(1,R)}const ce=()=>$("entry_number"),de=()=>$("member_name"),he=()=>$("beer_name"),_e=()=>$("category"),U=()=>$("paid"),V=()=>$("submitted_at"),z=h=>ae(h.id),L=h=>Z(h.id,!h.is_paid),B=h=>ae(h.id),H=h=>Z(h.id,!h.is_paid);return t.$$.update=()=>{t.$$.dirty[0]&262144&&i&&!i.is_officer&&Xe("/"),t.$$.dirty[0]&131072&&(r=a.params.id),t.$$.dirty[0]&14&&K(),t.$$.dirty[0]&17&&s(8,J=P.size===g.length&&g.length>0)},[g,R,T,se,P,_,k,N,J,$,ae,ie,Z,ve,re,Y,W,a,i,oe,ce,de,he,_e,U,V,z,L,B,H]}class Rt extends wt{constructor(e){super(),jt(this,e,Vt,At,kt,{},null,[-1,-1])}}export{Rt as component};
