import{s as zt,n as Qe,d as o,i as B,g as k,G as st,j as E,k as ft,C as Vt,D as Lt,b as l,w as Se,q as f,c,e as m,E as Ne,h as d,r as lt,a as U,I as _t,f as D,t as w,F as pt,M as mt}from"../chunks/Clc9C5PT.js";import{e as tt}from"../chunks/CERxzA5o.js";import{S as Ht,i as Ut}from"../chunks/D83E1sq8.js";import{g as at}from"../chunks/-d-XqP67.js";import{p as Bt}from"../chunks/DYjnv9o3.js";import{u as Mt}from"../chunks/BZKsMI7B.js";import{s as it}from"../chunks/CCM_4jRA.js";function vt(s,e,t){const a=s.slice();return a[37]=e[t],a}function bt(s,e,t){const a=s.slice();return a[37]=e[t],a}function ht(s){let e,t,a,n="🔒 Access Restricted",i,r,h="Only Competition Directors can access competition entries. This restriction helps maintain the integrity of competitions by ensuring that brewer information remains confidential until after judging is complete.",g,j,V="If you need access to this page, please contact an administrator to have your role updated to Competition Director.",L,J,Q="Return to Competitions",M,z;return{c(){e=d("div"),t=d("div"),a=d("h2"),a.textContent=n,i=E(),r=d("p"),r.textContent=h,g=E(),j=d("p"),j.textContent=V,L=E(),J=d("button"),J.textContent=Q,this.h()},l(F){e=c(F,"DIV",{class:!0});var O=m(e);t=c(O,"DIV",{class:!0});var R=m(t);a=c(R,"H2",{class:!0,"data-svelte-h":!0}),Ne(a)!=="svelte-1vimua2"&&(a.textContent=n),i=k(R),r=c(R,"P",{class:!0,"data-svelte-h":!0}),Ne(r)!=="svelte-1urfdgx"&&(r.textContent=h),g=k(R),j=c(R,"P",{class:!0,"data-svelte-h":!0}),Ne(j)!=="svelte-17raeg3"&&(j.textContent=V),L=k(R),J=c(R,"BUTTON",{class:!0,"data-svelte-h":!0}),Ne(J)!=="svelte-16lagpj"&&(J.textContent=Q),R.forEach(o),O.forEach(o),this.h()},h(){f(a,"class","svelte-8idnns"),f(r,"class","svelte-8idnns"),f(j,"class","svelte-8idnns"),f(J,"class","modal-button svelte-8idnns"),f(t,"class","modal svelte-8idnns"),f(e,"class","modal-overlay svelte-8idnns")},m(F,O){B(F,e,O),l(e,t),l(t,a),l(t,i),l(t,r),l(t,g),l(t,j),l(t,L),l(t,J),M||(z=Se(J,"click",s[17]),M=!0)},p:Qe,d(F){F&&o(e),M=!1,z()}}}function gt(s){let e,t,a='<h1 class="svelte-8idnns"><span class="emoji svelte-8idnns">📋</span> Competition Entries</h1> <p class="subtitle svelte-8idnns">Manage entries and print labels</p>',n;function i(g,j){if(g[9])return Rt;if(g[1])return Ot}let r=i(s),h=r&&r(s);return{c(){e=d("div"),t=d("div"),t.innerHTML=a,n=E(),h&&h.c(),this.h()},l(g){e=c(g,"DIV",{class:!0});var j=m(e);t=c(j,"DIV",{class:!0,"data-svelte-h":!0}),Ne(t)!=="svelte-7nznvx"&&(t.innerHTML=a),n=k(j),h&&h.l(j),j.forEach(o),this.h()},h(){f(t,"class","hero svelte-8idnns"),f(e,"class","container svelte-8idnns")},m(g,j){B(g,e,j),l(e,t),l(e,n),h&&h.m(e,null)},p(g,j){r===(r=i(g))&&h?h.p(g,j):(h&&h.d(1),h=r&&r(g),h&&(h.c(),h.m(e,null)))},d(g){g&&o(e),h&&h.d()}}}function Ot(s){let e,t,a=s[1].name+"",n,i,r,h,g,j="Total Entries",V,L,J=s[8].length+"",Q,M,z,F,O="Paid Entries",R,X,le=s[8].filter(It).length+"",ye,ce,te,x,he="Entry Fee",se,ae,ie,ne=(s[1].entry_fee||0)+"",me,de,ue,be,W="Total Fees",$,I,q,K=s[8].filter(At).length*(s[1].entry_fee||0)+"",Y,v,_,y,p,u,C,b,N=s[6].size>0?`(${s[6].size})`:"(All)",A,fe,_e,G,H,T=s[6].size>0?`(${s[6].size})`:"(All)",ge,we,je,re,ve,ze=s[6].size>0?`(${s[6].size})`:"(All)",De,P,Ie,ke,Ve="← Back",Te,Ae,$e,qe,pe=s[6].size>0&&yt(s);function Ee(S,Z){return S[2].length===0?qt:$t}let oe=Ee(s),Pe=oe(s);return{c(){e=d("div"),t=d("h2"),n=w(a),i=E(),r=d("div"),h=d("div"),g=d("span"),g.textContent=j,V=E(),L=d("span"),Q=w(J),M=E(),z=d("div"),F=d("span"),F.textContent=O,R=E(),X=d("span"),ye=w(le),ce=E(),te=d("div"),x=d("span"),x.textContent=he,se=E(),ae=d("span"),ie=w("$"),me=w(ne),de=E(),ue=d("div"),be=d("span"),be.textContent=W,$=E(),I=d("span"),q=w("$"),Y=w(K),v=E(),_=d("div"),y=d("input"),p=E(),pe&&pe.c(),u=E(),C=d("button"),b=w("🖨️ Print Labels "),A=w(N),_e=E(),G=d("button"),H=w("📊 Export CSV "),ge=w(T),je=E(),re=d("button"),ve=w("📝 Print Judging Sheets "),De=w(ze),Ie=E(),ke=d("button"),ke.textContent=Ve,Te=E(),Pe.c(),Ae=st(),this.h()},l(S){e=c(S,"DIV",{class:!0});var Z=m(e);t=c(Z,"H2",{class:!0});var Je=m(t);n=D(Je,a),Je.forEach(o),i=k(Z),r=c(Z,"DIV",{class:!0});var Ue=m(r);h=c(Ue,"DIV",{class:!0});var Ze=m(h);g=c(Ze,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(g)!=="svelte-1ly6mm6"&&(g.textContent=j),V=k(Ze),L=c(Ze,"SPAN",{class:!0});var Le=m(L);Q=D(Le,J),Le.forEach(o),Ze.forEach(o),M=k(Ue),z=c(Ue,"DIV",{class:!0});var ee=m(z);F=c(ee,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(F)!=="svelte-1e7gzoe"&&(F.textContent=O),R=k(ee),X=c(ee,"SPAN",{class:!0});var Be=m(X);ye=D(Be,le),Be.forEach(o),ee.forEach(o),ce=k(Ue),te=c(Ue,"DIV",{class:!0});var He=m(te);x=c(He,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(x)!=="svelte-1dw3q0"&&(x.textContent=he),se=k(He),ae=c(He,"SPAN",{class:!0});var Me=m(ae);ie=D(Me,"$"),me=D(Me,ne),Me.forEach(o),He.forEach(o),de=k(Ue),ue=c(Ue,"DIV",{class:!0});var Oe=m(ue);be=c(Oe,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(be)!=="svelte-1k6mrzd"&&(be.textContent=W),$=k(Oe),I=c(Oe,"SPAN",{class:!0});var Re=m(I);q=D(Re,"$"),Y=D(Re,K),Re.forEach(o),Oe.forEach(o),Ue.forEach(o),Z.forEach(o),v=k(S),_=c(S,"DIV",{class:!0});var Ce=m(_);y=c(Ce,"INPUT",{type:!0,class:!0,placeholder:!0}),p=k(Ce),pe&&pe.l(Ce),u=k(Ce),C=c(Ce,"BUTTON",{class:!0});var Fe=m(C);b=D(Fe,"🖨️ Print Labels "),A=D(Fe,N),Fe.forEach(o),_e=k(Ce),G=c(Ce,"BUTTON",{class:!0});var We=m(G);H=D(We,"📊 Export CSV "),ge=D(We,T),We.forEach(o),je=k(Ce),re=c(Ce,"BUTTON",{class:!0});var Ye=m(re);ve=D(Ye,"📝 Print Judging Sheets "),De=D(Ye,ze),Ye.forEach(o),Ie=k(Ce),ke=c(Ce,"BUTTON",{class:!0,"data-svelte-h":!0}),Ne(ke)!=="svelte-52xzlp"&&(ke.textContent=Ve),Ce.forEach(o),Te=k(S),Pe.l(S),Ae=st(),this.h()},h(){f(t,"class","svelte-8idnns"),f(g,"class","info-label svelte-8idnns"),f(L,"class","info-value svelte-8idnns"),f(h,"class","info-item svelte-8idnns"),f(F,"class","info-label svelte-8idnns"),f(X,"class","info-value svelte-8idnns"),f(z,"class","info-item svelte-8idnns"),f(x,"class","info-label svelte-8idnns"),f(ae,"class","info-value svelte-8idnns"),f(te,"class","info-item svelte-8idnns"),f(be,"class","info-label svelte-8idnns"),f(I,"class","info-value svelte-8idnns"),f(ue,"class","info-item svelte-8idnns"),f(r,"class","info-grid svelte-8idnns"),f(e,"class","competition-info svelte-8idnns"),f(y,"type","text"),f(y,"class","search-input svelte-8idnns"),f(y,"placeholder","Search entries..."),f(C,"class","btn btn-primary svelte-8idnns"),C.disabled=fe=s[2].length===0,f(G,"class","btn btn-success svelte-8idnns"),G.disabled=we=s[2].length===0,f(re,"class","btn btn-info svelte-8idnns"),re.disabled=P=s[2].length===0,f(ke,"class","btn btn-secondary svelte-8idnns"),f(_,"class","controls svelte-8idnns")},m(S,Z){B(S,e,Z),l(e,t),l(t,n),l(e,i),l(e,r),l(r,h),l(h,g),l(h,V),l(h,L),l(L,Q),l(r,M),l(r,z),l(z,F),l(z,R),l(z,X),l(X,ye),l(r,ce),l(r,te),l(te,x),l(te,se),l(te,ae),l(ae,ie),l(ae,me),l(r,de),l(r,ue),l(ue,be),l(ue,$),l(ue,I),l(I,q),l(I,Y),B(S,v,Z),B(S,_,Z),l(_,y),_t(y,s[3]),l(_,p),pe&&pe.m(_,null),l(_,u),l(_,C),l(C,b),l(C,A),l(_,_e),l(_,G),l(G,H),l(G,ge),l(_,je),l(_,re),l(re,ve),l(re,De),l(_,Ie),l(_,ke),B(S,Te,Z),Pe.m(S,Z),B(S,Ae,Z),$e||(qe=[Se(y,"input",s[23]),Se(C,"click",s[15]),Se(G,"click",s[18]),Se(re,"click",s[19]),Se(ke,"click",s[16])],$e=!0)},p(S,Z){Z[0]&2&&a!==(a=S[1].name+"")&&U(n,a),Z[0]&256&&J!==(J=S[8].length+"")&&U(Q,J),Z[0]&256&&le!==(le=S[8].filter(It).length+"")&&U(ye,le),Z[0]&2&&ne!==(ne=(S[1].entry_fee||0)+"")&&U(me,ne),Z[0]&258&&K!==(K=S[8].filter(At).length*(S[1].entry_fee||0)+"")&&U(Y,K),Z[0]&8&&y.value!==S[3]&&_t(y,S[3]),S[6].size>0?pe?pe.p(S,Z):(pe=yt(S),pe.c(),pe.m(_,u)):pe&&(pe.d(1),pe=null),Z[0]&64&&N!==(N=S[6].size>0?`(${S[6].size})`:"(All)")&&U(A,N),Z[0]&4&&fe!==(fe=S[2].length===0)&&(C.disabled=fe),Z[0]&64&&T!==(T=S[6].size>0?`(${S[6].size})`:"(All)")&&U(ge,T),Z[0]&4&&we!==(we=S[2].length===0)&&(G.disabled=we),Z[0]&64&&ze!==(ze=S[6].size>0?`(${S[6].size})`:"(All)")&&U(De,ze),Z[0]&4&&P!==(P=S[2].length===0)&&(re.disabled=P),oe===(oe=Ee(S))&&Pe?Pe.p(S,Z):(Pe.d(1),Pe=oe(S),Pe&&(Pe.c(),Pe.m(Ae.parentNode,Ae)))},d(S){S&&(o(e),o(v),o(_),o(Te),o(Ae)),pe&&pe.d(),Pe.d(S),$e=!1,lt(qe)}}}function Rt(s){let e,t='<div class="spinner svelte-8idnns"></div> <p>Loading entries...</p>';return{c(){e=d("div"),e.innerHTML=t,this.h()},l(a){e=c(a,"DIV",{class:!0,"data-svelte-h":!0}),Ne(e)!=="svelte-e96xyd"&&(e.innerHTML=t),this.h()},h(){f(e,"class","loading svelte-8idnns")},m(a,n){B(a,e,n)},p:Qe,d(a){a&&o(e)}}}function yt(s){let e,t=s[6].size+"",a,n;return{c(){e=d("span"),a=w(t),n=w(" selected"),this.h()},l(i){e=c(i,"SPAN",{class:!0});var r=m(e);a=D(r,t),n=D(r," selected"),r.forEach(o),this.h()},h(){f(e,"class","selected-count svelte-8idnns")},m(i,r){B(i,e,r),l(e,a),l(e,n)},p(i,r){r[0]&64&&t!==(t=i[6].size+"")&&U(a,t)},d(i){i&&o(e)}}}function $t(s){let e,t,a,n,i,r,h,g,j,V,L,J,Q,M,z,F,O,R,X,le,ye="Style",ce,te,x,he,se,ae,ie,ne,me,de,ue,be,W=s[4]==="entry_number"&&kt(s),$=s[4]==="member_name"&&Et(s),I=s[4]==="beer_name"&&Ct(s),q=s[4]==="category"&&jt(s),K=s[4]==="paid"&&Dt(s),Y=s[4]==="submitted_at"&&wt(s),v=tt(s[2]),_=[];for(let u=0;u<v.length;u+=1)_[u]=Nt(bt(s,v,u));let y=tt(s[2]),p=[];for(let u=0;u<y.length;u+=1)p[u]=Pt(vt(s,y,u));return{c(){e=d("div"),t=d("table"),a=d("thead"),n=d("tr"),i=d("th"),r=d("input"),h=E(),g=d("th"),j=w(`Entry #
                `),W&&W.c(),V=E(),L=d("th"),J=w(`Member
                `),$&&$.c(),Q=E(),M=d("th"),z=w(`Beer Name
                `),I&&I.c(),F=E(),O=d("th"),R=w(`Category
                `),q&&q.c(),X=E(),le=d("th"),le.textContent=ye,ce=E(),te=d("th"),x=w(`Paid
                `),K&&K.c(),he=E(),se=d("th"),ae=w(`Submitted
                `),Y&&Y.c(),ie=E(),ne=d("tbody");for(let u=0;u<_.length;u+=1)_[u].c();me=E(),de=d("div");for(let u=0;u<p.length;u+=1)p[u].c();this.h()},l(u){e=c(u,"DIV",{class:!0});var C=m(e);t=c(C,"TABLE",{class:!0});var b=m(t);a=c(b,"THEAD",{});var N=m(a);n=c(N,"TR",{class:!0});var A=m(n);i=c(A,"TH",{class:!0});var fe=m(i);r=c(fe,"INPUT",{type:!0}),fe.forEach(o),h=k(A),g=c(A,"TH",{class:!0});var _e=m(g);j=D(_e,`Entry #
                `),W&&W.l(_e),_e.forEach(o),V=k(A),L=c(A,"TH",{class:!0});var G=m(L);J=D(G,`Member
                `),$&&$.l(G),G.forEach(o),Q=k(A),M=c(A,"TH",{class:!0});var H=m(M);z=D(H,`Beer Name
                `),I&&I.l(H),H.forEach(o),F=k(A),O=c(A,"TH",{class:!0});var T=m(O);R=D(T,`Category
                `),q&&q.l(T),T.forEach(o),X=k(A),le=c(A,"TH",{class:!0,"data-svelte-h":!0}),Ne(le)!=="svelte-1cj4qqf"&&(le.textContent=ye),ce=k(A),te=c(A,"TH",{class:!0});var ge=m(te);x=D(ge,`Paid
                `),K&&K.l(ge),ge.forEach(o),he=k(A),se=c(A,"TH",{class:!0});var we=m(se);ae=D(we,`Submitted
                `),Y&&Y.l(we),we.forEach(o),A.forEach(o),N.forEach(o),ie=k(b),ne=c(b,"TBODY",{});var je=m(ne);for(let ve=0;ve<_.length;ve+=1)_[ve].l(je);je.forEach(o),b.forEach(o),C.forEach(o),me=k(u),de=c(u,"DIV",{class:!0});var re=m(de);for(let ve=0;ve<p.length;ve+=1)p[ve].l(re);re.forEach(o),this.h()},h(){f(r,"type","checkbox"),r.checked=s[10],f(i,"class","checkbox-cell svelte-8idnns"),f(g,"class","svelte-8idnns"),f(L,"class","svelte-8idnns"),f(M,"class","svelte-8idnns"),f(O,"class","svelte-8idnns"),f(le,"class","svelte-8idnns"),f(te,"class","svelte-8idnns"),f(se,"class","svelte-8idnns"),f(n,"class","svelte-8idnns"),f(t,"class","svelte-8idnns"),f(e,"class","entries-table svelte-8idnns"),f(de,"class","entries-cards svelte-8idnns")},m(u,C){B(u,e,C),l(e,t),l(t,a),l(a,n),l(n,i),l(i,r),l(n,h),l(n,g),l(g,j),W&&W.m(g,null),l(n,V),l(n,L),l(L,J),$&&$.m(L,null),l(n,Q),l(n,M),l(M,z),I&&I.m(M,null),l(n,F),l(n,O),l(O,R),q&&q.m(O,null),l(n,X),l(n,le),l(n,ce),l(n,te),l(te,x),K&&K.m(te,null),l(n,he),l(n,se),l(se,ae),Y&&Y.m(se,null),l(t,ie),l(t,ne);for(let b=0;b<_.length;b+=1)_[b]&&_[b].m(ne,null);B(u,me,C),B(u,de,C);for(let b=0;b<p.length;b+=1)p[b]&&p[b].m(de,null);ue||(be=[Se(r,"change",s[13]),Se(g,"click",s[24]),Se(L,"click",s[25]),Se(M,"click",s[26]),Se(O,"click",s[27]),Se(te,"click",s[28]),Se(se,"click",s[29])],ue=!0)},p(u,C){if(C[0]&1024&&(r.checked=u[10]),u[4]==="entry_number"?W?W.p(u,C):(W=kt(u),W.c(),W.m(g,null)):W&&(W.d(1),W=null),u[4]==="member_name"?$?$.p(u,C):($=Et(u),$.c(),$.m(L,null)):$&&($.d(1),$=null),u[4]==="beer_name"?I?I.p(u,C):(I=Ct(u),I.c(),I.m(M,null)):I&&(I.d(1),I=null),u[4]==="category"?q?q.p(u,C):(q=jt(u),q.c(),q.m(O,null)):q&&(q.d(1),q=null),u[4]==="paid"?K?K.p(u,C):(K=Dt(u),K.c(),K.m(te,null)):K&&(K.d(1),K=null),u[4]==="submitted_at"?Y?Y.p(u,C):(Y=wt(u),Y.c(),Y.m(se,null)):Y&&(Y.d(1),Y=null),C[0]&20548){v=tt(u[2]);let b;for(b=0;b<v.length;b+=1){const N=bt(u,v,b);_[b]?_[b].p(N,C):(_[b]=Nt(N),_[b].c(),_[b].m(ne,null))}for(;b<_.length;b+=1)_[b].d(1);_.length=v.length}if(C[0]&20548){y=tt(u[2]);let b;for(b=0;b<y.length;b+=1){const N=vt(u,y,b);p[b]?p[b].p(N,C):(p[b]=Pt(N),p[b].c(),p[b].m(de,null))}for(;b<p.length;b+=1)p[b].d(1);p.length=y.length}},d(u){u&&(o(e),o(me),o(de)),W&&W.d(),$&&$.d(),I&&I.d(),q&&q.d(),K&&K.d(),Y&&Y.d(),pt(_,u),pt(p,u),ue=!1,lt(be)}}}function qt(s){let e,t,a="No entries found",n,i;function r(j,V){return j[3]?Gt:Wt}let h=r(s),g=h(s);return{c(){e=d("div"),t=d("h3"),t.textContent=a,n=E(),i=d("p"),g.c(),this.h()},l(j){e=c(j,"DIV",{class:!0});var V=m(e);t=c(V,"H3",{"data-svelte-h":!0}),Ne(t)!=="svelte-12l3juz"&&(t.textContent=a),n=k(V),i=c(V,"P",{});var L=m(i);g.l(L),L.forEach(o),V.forEach(o),this.h()},h(){f(e,"class","empty-state svelte-8idnns")},m(j,V){B(j,e,V),l(e,t),l(e,n),l(e,i),g.m(i,null)},p(j,V){h!==(h=r(j))&&(g.d(1),g=h(j),g&&(g.c(),g.m(i,null)))},d(j){j&&o(e),g.d()}}}function kt(s){let e,t=s[5]==="asc"?"↑":"↓",a;return{c(){e=d("span"),a=w(t),this.h()},l(n){e=c(n,"SPAN",{class:!0});var i=m(e);a=D(i,t),i.forEach(o),this.h()},h(){f(e,"class","sort-indicator svelte-8idnns")},m(n,i){B(n,e,i),l(e,a)},p(n,i){i[0]&32&&t!==(t=n[5]==="asc"?"↑":"↓")&&U(a,t)},d(n){n&&o(e)}}}function Et(s){let e,t=s[5]==="asc"?"↑":"↓",a;return{c(){e=d("span"),a=w(t),this.h()},l(n){e=c(n,"SPAN",{class:!0});var i=m(e);a=D(i,t),i.forEach(o),this.h()},h(){f(e,"class","sort-indicator svelte-8idnns")},m(n,i){B(n,e,i),l(e,a)},p(n,i){i[0]&32&&t!==(t=n[5]==="asc"?"↑":"↓")&&U(a,t)},d(n){n&&o(e)}}}function Ct(s){let e,t=s[5]==="asc"?"↑":"↓",a;return{c(){e=d("span"),a=w(t),this.h()},l(n){e=c(n,"SPAN",{class:!0});var i=m(e);a=D(i,t),i.forEach(o),this.h()},h(){f(e,"class","sort-indicator svelte-8idnns")},m(n,i){B(n,e,i),l(e,a)},p(n,i){i[0]&32&&t!==(t=n[5]==="asc"?"↑":"↓")&&U(a,t)},d(n){n&&o(e)}}}function jt(s){let e,t=s[5]==="asc"?"↑":"↓",a;return{c(){e=d("span"),a=w(t),this.h()},l(n){e=c(n,"SPAN",{class:!0});var i=m(e);a=D(i,t),i.forEach(o),this.h()},h(){f(e,"class","sort-indicator svelte-8idnns")},m(n,i){B(n,e,i),l(e,a)},p(n,i){i[0]&32&&t!==(t=n[5]==="asc"?"↑":"↓")&&U(a,t)},d(n){n&&o(e)}}}function Dt(s){let e,t=s[5]==="asc"?"↑":"↓",a;return{c(){e=d("span"),a=w(t),this.h()},l(n){e=c(n,"SPAN",{class:!0});var i=m(e);a=D(i,t),i.forEach(o),this.h()},h(){f(e,"class","sort-indicator svelte-8idnns")},m(n,i){B(n,e,i),l(e,a)},p(n,i){i[0]&32&&t!==(t=n[5]==="asc"?"↑":"↓")&&U(a,t)},d(n){n&&o(e)}}}function wt(s){let e,t=s[5]==="asc"?"↑":"↓",a;return{c(){e=d("span"),a=w(t),this.h()},l(n){e=c(n,"SPAN",{class:!0});var i=m(e);a=D(i,t),i.forEach(o),this.h()},h(){f(e,"class","sort-indicator svelte-8idnns")},m(n,i){B(n,e,i),l(e,a)},p(n,i){i[0]&32&&t!==(t=n[5]==="asc"?"↑":"↓")&&U(a,t)},d(n){n&&o(e)}}}function Jt(s){let e;return{c(){e=w("-")},l(t){e=D(t,"-")},m(t,a){B(t,e,a)},p:Qe,d(t){t&&o(e)}}}function Ft(s){let e=s[37].bjcp_category.category_number+"",t,a,n=s[37].bjcp_category.category_name+"",i;return{c(){t=w(e),a=E(),i=w(n)},l(r){t=D(r,e),a=k(r),i=D(r,n)},m(r,h){B(r,t,h),B(r,a,h),B(r,i,h)},p(r,h){h[0]&4&&e!==(e=r[37].bjcp_category.category_number+"")&&U(t,e),h[0]&4&&n!==(n=r[37].bjcp_category.category_name+"")&&U(i,n)},d(r){r&&(o(t),o(a),o(i))}}}function St(s){let e,t,a=s[37].bjcp_category.subcategory_name+"",n;return{c(){e=d("br"),t=d("small"),n=w(a)},l(i){e=c(i,"BR",{}),t=c(i,"SMALL",{});var r=m(t);n=D(r,a),r.forEach(o)},m(i,r){B(i,e,r),B(i,t,r),l(t,n)},p(i,r){r[0]&4&&a!==(a=i[37].bjcp_category.subcategory_name+"")&&U(n,a)},d(i){i&&(o(e),o(t))}}}function Nt(s){var we,je,re,ve,ze;let e,t,a,n,i,r,h,g=s[37].entry_number+"",j,V,L,J,Q=((we=s[37].members)==null?void 0:we.name)+"",M,z,F,O=((je=s[37].members)==null?void 0:je.email)+"",R,X,le,ye=(s[37].beer_name||"-")+"",ce,te,x,he,se,ae,ie=(((re=s[37].bjcp_category)==null?void 0:re.category_number)||"")+"",ne,me=(((ve=s[37].bjcp_category)==null?void 0:ve.subcategory_letter)||"")+"",de,ue,be,W,$,I,q,K,Y,v=s[37].is_paid?"Paid":"Unpaid",_,y,p,u=Ke(s[37].submitted_at)+"",C,b,N,A;function fe(){return s[30](s[37])}function _e(De,P){return De[37].bjcp_category?Ft:Jt}let G=_e(s),H=G(s),T=((ze=s[37].bjcp_category)==null?void 0:ze.subcategory_name)&&St(s);function ge(){return s[31](s[37])}return{c(){e=d("tr"),t=d("td"),a=d("input"),i=E(),r=d("td"),h=d("span"),j=w(g),V=E(),L=d("td"),J=d("div"),M=w(Q),z=E(),F=d("small"),R=w(O),X=E(),le=d("td"),ce=w(ye),te=E(),x=d("td"),H.c(),he=E(),se=d("td"),ae=d("span"),ne=w(ie),de=w(me),ue=E(),T&&T.c(),be=E(),W=d("td"),$=d("div"),I=d("div"),K=E(),Y=d("span"),_=w(v),y=E(),p=d("td"),C=w(u),b=E(),this.h()},l(De){e=c(De,"TR",{class:!0});var P=m(e);t=c(P,"TD",{class:!0});var Ie=m(t);a=c(Ie,"INPUT",{type:!0}),Ie.forEach(o),i=k(P),r=c(P,"TD",{class:!0});var ke=m(r);h=c(ke,"SPAN",{class:!0});var Ve=m(h);j=D(Ve,g),Ve.forEach(o),ke.forEach(o),V=k(P),L=c(P,"TD",{class:!0});var Te=m(L);J=c(Te,"DIV",{});var Ae=m(J);M=D(Ae,Q),Ae.forEach(o),z=k(Te),F=c(Te,"SMALL",{});var $e=m(F);R=D($e,O),$e.forEach(o),Te.forEach(o),X=k(P),le=c(P,"TD",{class:!0});var qe=m(le);ce=D(qe,ye),qe.forEach(o),te=k(P),x=c(P,"TD",{class:!0});var pe=m(x);H.l(pe),pe.forEach(o),he=k(P),se=c(P,"TD",{class:!0});var Ee=m(se);ae=c(Ee,"SPAN",{class:!0});var oe=m(ae);ne=D(oe,ie),de=D(oe,me),oe.forEach(o),ue=k(Ee),T&&T.l(Ee),Ee.forEach(o),be=k(P),W=c(P,"TD",{class:!0});var Pe=m(W);$=c(Pe,"DIV",{class:!0});var S=m($);I=c(S,"DIV",{class:!0}),m(I).forEach(o),K=k(S),Y=c(S,"SPAN",{});var Z=m(Y);_=D(Z,v),Z.forEach(o),S.forEach(o),Pe.forEach(o),y=k(P),p=c(P,"TD",{class:!0});var Je=m(p);C=D(Je,u),Je.forEach(o),b=k(P),P.forEach(o),this.h()},h(){f(a,"type","checkbox"),a.checked=n=s[6].has(s[37].id),f(t,"class","checkbox-cell svelte-8idnns"),f(h,"class","entry-number svelte-8idnns"),f(r,"class","svelte-8idnns"),f(L,"class","svelte-8idnns"),f(le,"class","svelte-8idnns"),f(x,"class","svelte-8idnns"),f(ae,"class","category-badge svelte-8idnns"),f(se,"class","svelte-8idnns"),f(I,"class",q="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-8idnns"),f($,"class","payment-toggle svelte-8idnns"),f(W,"class","svelte-8idnns"),f(p,"class","svelte-8idnns"),f(e,"class","svelte-8idnns")},m(De,P){B(De,e,P),l(e,t),l(t,a),l(e,i),l(e,r),l(r,h),l(h,j),l(e,V),l(e,L),l(L,J),l(J,M),l(L,z),l(L,F),l(F,R),l(e,X),l(e,le),l(le,ce),l(e,te),l(e,x),H.m(x,null),l(e,he),l(e,se),l(se,ae),l(ae,ne),l(ae,de),l(se,ue),T&&T.m(se,null),l(e,be),l(e,W),l(W,$),l($,I),l($,K),l($,Y),l(Y,_),l(e,y),l(e,p),l(p,C),l(e,b),N||(A=[Se(a,"change",fe),Se(I,"click",ge)],N=!0)},p(De,P){var Ie,ke,Ve,Te,Ae;s=De,P[0]&68&&n!==(n=s[6].has(s[37].id))&&(a.checked=n),P[0]&4&&g!==(g=s[37].entry_number+"")&&U(j,g),P[0]&4&&Q!==(Q=((Ie=s[37].members)==null?void 0:Ie.name)+"")&&U(M,Q),P[0]&4&&O!==(O=((ke=s[37].members)==null?void 0:ke.email)+"")&&U(R,O),P[0]&4&&ye!==(ye=(s[37].beer_name||"-")+"")&&U(ce,ye),G===(G=_e(s))&&H?H.p(s,P):(H.d(1),H=G(s),H&&(H.c(),H.m(x,null))),P[0]&4&&ie!==(ie=(((Ve=s[37].bjcp_category)==null?void 0:Ve.category_number)||"")+"")&&U(ne,ie),P[0]&4&&me!==(me=(((Te=s[37].bjcp_category)==null?void 0:Te.subcategory_letter)||"")+"")&&U(de,me),(Ae=s[37].bjcp_category)!=null&&Ae.subcategory_name?T?T.p(s,P):(T=St(s),T.c(),T.m(se,null)):T&&(T.d(1),T=null),P[0]&4&&q!==(q="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-8idnns")&&f(I,"class",q),P[0]&4&&v!==(v=s[37].is_paid?"Paid":"Unpaid")&&U(_,v),P[0]&4&&u!==(u=Ke(s[37].submitted_at)+"")&&U(C,u)},d(De){De&&o(e),H.d(),T&&T.d(),N=!1,lt(A)}}}function Yt(s){let e;return{c(){e=w("-")},l(t){e=D(t,"-")},m(t,a){B(t,e,a)},p:Qe,d(t){t&&o(e)}}}function Zt(s){let e=s[37].bjcp_category.category_number+"",t,a,n=s[37].bjcp_category.category_name+"",i;return{c(){t=w(e),a=E(),i=w(n)},l(r){t=D(r,e),a=k(r),i=D(r,n)},m(r,h){B(r,t,h),B(r,a,h),B(r,i,h)},p(r,h){h[0]&4&&e!==(e=r[37].bjcp_category.category_number+"")&&U(t,e),h[0]&4&&n!==(n=r[37].bjcp_category.category_name+"")&&U(i,n)},d(r){r&&(o(t),o(a),o(i))}}}function Tt(s){let e,t,a=s[37].bjcp_category.subcategory_name+"",n;return{c(){e=d("br"),t=d("small"),n=w(a),this.h()},l(i){e=c(i,"BR",{}),t=c(i,"SMALL",{style:!0});var r=m(t);n=D(r,a),r.forEach(o),this.h()},h(){mt(t,"color","#666"),mt(t,"font-size","0.8rem")},m(i,r){B(i,e,r),B(i,t,r),l(t,n)},p(i,r){r[0]&4&&a!==(a=i[37].bjcp_category.subcategory_name+"")&&U(n,a)},d(i){i&&(o(e),o(t))}}}function Pt(s){var S,Z,Je,Ue,Ze;let e,t,a,n,i,r=s[37].entry_number+"",h,g,j,V=(s[37].beer_name||"No name provided")+"",L,J,Q,M,z,F,O,R,X,le="Category",ye,ce,te,x,he,se="Style",ae,ie,ne,me=(((S=s[37].bjcp_category)==null?void 0:S.category_number)||"")+"",de,ue=(((Z=s[37].bjcp_category)==null?void 0:Z.subcategory_letter)||"")+"",be,W,$,I,q,K="Submitted",Y,v,_=Ke(s[37].submitted_at)+"",y,p,u,C,b="Brewer Information",N,A,fe=((Je=s[37].members)==null?void 0:Je.name)+"",_e,G,H,T=((Ue=s[37].members)==null?void 0:Ue.email)+"",ge,we,je,re,ve,ze,De,P,Ie=s[37].is_paid?"Paid":"Unpaid",ke,Ve,Te,Ae;function $e(){return s[32](s[37])}function qe(Le,ee){return Le[37].bjcp_category?Zt:Yt}let pe=qe(s),Ee=pe(s),oe=((Ze=s[37].bjcp_category)==null?void 0:Ze.subcategory_name)&&Tt(s);function Pe(){return s[33](s[37])}return{c(){e=d("div"),t=d("div"),a=d("div"),n=d("h4"),i=w("#"),h=w(r),g=E(),j=d("div"),L=w(V),J=E(),Q=d("div"),M=d("input"),F=E(),O=d("div"),R=d("div"),X=d("span"),X.textContent=le,ye=E(),ce=d("div"),Ee.c(),te=E(),x=d("div"),he=d("span"),he.textContent=se,ae=E(),ie=d("div"),ne=d("span"),de=w(me),be=w(ue),W=E(),oe&&oe.c(),$=E(),I=d("div"),q=d("span"),q.textContent=K,Y=E(),v=d("span"),y=w(_),p=E(),u=d("div"),C=d("h5"),C.textContent=b,N=E(),A=d("div"),_e=w(fe),G=E(),H=d("div"),ge=w(T),we=E(),je=d("div"),re=d("div"),ve=d("div"),De=E(),P=d("span"),ke=w(Ie),Ve=E(),this.h()},l(Le){e=c(Le,"DIV",{class:!0});var ee=m(e);t=c(ee,"DIV",{class:!0});var Be=m(t);a=c(Be,"DIV",{class:!0});var He=m(a);n=c(He,"H4",{class:!0});var Me=m(n);i=D(Me,"#"),h=D(Me,r),Me.forEach(o),g=k(He),j=c(He,"DIV",{class:!0});var Oe=m(j);L=D(Oe,V),Oe.forEach(o),He.forEach(o),J=k(Be),Q=c(Be,"DIV",{class:!0});var Re=m(Q);M=c(Re,"INPUT",{type:!0}),Re.forEach(o),Be.forEach(o),F=k(ee),O=c(ee,"DIV",{class:!0});var Ce=m(O);R=c(Ce,"DIV",{class:!0});var Fe=m(R);X=c(Fe,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(X)!=="svelte-13uauhn"&&(X.textContent=le),ye=k(Fe),ce=c(Fe,"DIV",{class:!0});var We=m(ce);Ee.l(We),We.forEach(o),Fe.forEach(o),te=k(Ce),x=c(Ce,"DIV",{class:!0});var Ye=m(x);he=c(Ye,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(he)!=="svelte-3grn8s"&&(he.textContent=se),ae=k(Ye),ie=c(Ye,"DIV",{class:!0});var Xe=m(ie);ne=c(Xe,"SPAN",{class:!0});var nt=m(ne);de=D(nt,me),be=D(nt,ue),nt.forEach(o),W=k(Xe),oe&&oe.l(Xe),Xe.forEach(o),Ye.forEach(o),$=k(Ce),I=c(Ce,"DIV",{class:!0});var xe=m(I);q=c(xe,"SPAN",{class:!0,"data-svelte-h":!0}),Ne(q)!=="svelte-baos0g"&&(q.textContent=K),Y=k(xe),v=c(xe,"SPAN",{class:!0});var rt=m(v);y=D(rt,_),rt.forEach(o),xe.forEach(o),Ce.forEach(o),p=k(ee),u=c(ee,"DIV",{class:!0});var Ge=m(u);C=c(Ge,"H5",{class:!0,"data-svelte-h":!0}),Ne(C)!=="svelte-6h9wyx"&&(C.textContent=b),N=k(Ge),A=c(Ge,"DIV",{class:!0});var ot=m(A);_e=D(ot,fe),ot.forEach(o),G=k(Ge),H=c(Ge,"DIV",{class:!0});var ct=m(H);ge=D(ct,T),ct.forEach(o),Ge.forEach(o),we=k(ee),je=c(ee,"DIV",{class:!0});var dt=m(je);re=c(dt,"DIV",{class:!0});var et=m(re);ve=c(et,"DIV",{class:!0}),m(ve).forEach(o),De=k(et),P=c(et,"SPAN",{});var ut=m(P);ke=D(ut,Ie),ut.forEach(o),et.forEach(o),dt.forEach(o),Ve=k(ee),ee.forEach(o),this.h()},h(){f(n,"class","svelte-8idnns"),f(j,"class","beer-name svelte-8idnns"),f(a,"class","entry-info svelte-8idnns"),f(M,"type","checkbox"),M.checked=z=s[6].has(s[37].id),f(Q,"class","entry-actions svelte-8idnns"),f(t,"class","entry-header svelte-8idnns"),f(X,"class","label svelte-8idnns"),f(ce,"class","value svelte-8idnns"),f(R,"class","detail-group svelte-8idnns"),f(he,"class","label svelte-8idnns"),f(ne,"class","category-mobile svelte-8idnns"),f(ie,"class","value svelte-8idnns"),f(x,"class","detail-group svelte-8idnns"),f(q,"class","label svelte-8idnns"),f(v,"class","value svelte-8idnns"),f(I,"class","detail-group svelte-8idnns"),f(O,"class","entry-details svelte-8idnns"),f(C,"class","svelte-8idnns"),f(A,"class","name svelte-8idnns"),f(H,"class","email svelte-8idnns"),f(u,"class","member-info svelte-8idnns"),f(ve,"class",ze="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-8idnns"),f(re,"class","payment-toggle svelte-8idnns"),f(je,"class","payment-status-mobile svelte-8idnns"),f(e,"class","entry-card svelte-8idnns")},m(Le,ee){B(Le,e,ee),l(e,t),l(t,a),l(a,n),l(n,i),l(n,h),l(a,g),l(a,j),l(j,L),l(t,J),l(t,Q),l(Q,M),l(e,F),l(e,O),l(O,R),l(R,X),l(R,ye),l(R,ce),Ee.m(ce,null),l(O,te),l(O,x),l(x,he),l(x,ae),l(x,ie),l(ie,ne),l(ne,de),l(ne,be),l(ie,W),oe&&oe.m(ie,null),l(O,$),l(O,I),l(I,q),l(I,Y),l(I,v),l(v,y),l(e,p),l(e,u),l(u,C),l(u,N),l(u,A),l(A,_e),l(u,G),l(u,H),l(H,ge),l(e,we),l(e,je),l(je,re),l(re,ve),l(re,De),l(re,P),l(P,ke),l(e,Ve),Te||(Ae=[Se(M,"change",$e),Se(ve,"click",Pe)],Te=!0)},p(Le,ee){var Be,He,Me,Oe,Re;s=Le,ee[0]&4&&r!==(r=s[37].entry_number+"")&&U(h,r),ee[0]&4&&V!==(V=(s[37].beer_name||"No name provided")+"")&&U(L,V),ee[0]&68&&z!==(z=s[6].has(s[37].id))&&(M.checked=z),pe===(pe=qe(s))&&Ee?Ee.p(s,ee):(Ee.d(1),Ee=pe(s),Ee&&(Ee.c(),Ee.m(ce,null))),ee[0]&4&&me!==(me=(((Be=s[37].bjcp_category)==null?void 0:Be.category_number)||"")+"")&&U(de,me),ee[0]&4&&ue!==(ue=(((He=s[37].bjcp_category)==null?void 0:He.subcategory_letter)||"")+"")&&U(be,ue),(Me=s[37].bjcp_category)!=null&&Me.subcategory_name?oe?oe.p(s,ee):(oe=Tt(s),oe.c(),oe.m(ie,null)):oe&&(oe.d(1),oe=null),ee[0]&4&&_!==(_=Ke(s[37].submitted_at)+"")&&U(y,_),ee[0]&4&&fe!==(fe=((Oe=s[37].members)==null?void 0:Oe.name)+"")&&U(_e,fe),ee[0]&4&&T!==(T=((Re=s[37].members)==null?void 0:Re.email)+"")&&U(ge,T),ee[0]&4&&ze!==(ze="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-8idnns")&&f(ve,"class",ze),ee[0]&4&&Ie!==(Ie=s[37].is_paid?"Paid":"Unpaid")&&U(ke,Ie)},d(Le){Le&&o(e),Ee.d(),oe&&oe.d(),Te=!1,lt(Ae)}}}function Wt(s){let e;return{c(){e=w("No entries have been submitted yet")},l(t){e=D(t,"No entries have been submitted yet")},m(t,a){B(t,e,a)},d(t){t&&o(e)}}}function Gt(s){let e;return{c(){e=w("Try adjusting your search")},l(t){e=D(t,"Try adjusting your search")},m(t,a){B(t,e,a)},d(t){t&&o(e)}}}function Qt(s){let e,t,a=s[7]&&ht(s),n=s[0]&&gt(s);return{c(){a&&a.c(),e=E(),n&&n.c(),t=st()},l(i){a&&a.l(i),e=k(i),n&&n.l(i),t=st()},m(i,r){a&&a.m(i,r),B(i,e,r),n&&n.m(i,r),B(i,t,r)},p(i,r){i[7]?a?a.p(i,r):(a=ht(i),a.c(),a.m(e.parentNode,e)):a&&(a.d(1),a=null),i[0]?n?n.p(i,r):(n=gt(i),n.c(),n.m(t.parentNode,t)):n&&(n.d(1),n=null)},i:Qe,o:Qe,d(i){i&&(o(e),o(t)),a&&a.d(i),n&&n.d(i)}}}function Ke(s){if(!s||s===null||s===void 0)return"No date";try{const e=String(s).trim();let t=e;if(e.includes(" ")&&!e.includes("T")){if(t=e.replace(" ","T"),t.includes(".")){const[n,i]=t.split("."),r=i.substring(0,3);t=`${n}.${r}`}!t.includes("+")&&!t.includes("Z")&&(t+="Z")}const a=new Date(t);return isNaN(a.getTime())?(console.warn("Invalid date after parsing:",e,"->",t),"Invalid Date"):a.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return console.warn("Error formatting date:",s,e),"Invalid Date"}}const It=s=>s.is_paid,At=s=>s.is_paid;function Kt(s,e,t){let a,n,i;ft(s,Bt,v=>t(21,n=v)),ft(s,Mt,v=>t(22,i=v));let r=!1,h=!1,g=null,j=[],V=[],L=!0,J="",Q="entry_number",M="asc",z=new Set,F=!1;Vt(()=>{}),Lt(()=>{});async function O(){t(9,L=!0);try{const{data:v,error:_}=await it.from("competitions").select("*").eq("id",a).single();if(_)throw _;t(1,g=v);const{data:y,error:p}=await it.from("competition_entries").select(`
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
        `).eq("competition_id",a).order("entry_number");if(p)throw p;t(8,j=y||[]),R()}catch(v){console.error("Error loading data:",v),alert("Failed to load competition entries"),at("/officers/manage-competitions")}finally{t(9,L=!1)}}function R(){let v=[...j];if(J.trim()){const _=J.toLowerCase();v=v.filter(y=>{var p,u,C,b,N,A,fe,_e,G,H,T,ge;return((p=y.entry_number)==null?void 0:p.toLowerCase().includes(_))||((u=y.beer_name)==null?void 0:u.toLowerCase().includes(_))||((b=(C=y.members)==null?void 0:C.name)==null?void 0:b.toLowerCase().includes(_))||((A=(N=y.members)==null?void 0:N.email)==null?void 0:A.toLowerCase().includes(_))||((_e=(fe=y.bjcp_category)==null?void 0:fe.category_name)==null?void 0:_e.toLowerCase().includes(_))||`${(G=y.bjcp_category)==null?void 0:G.category_number}${(H=y.bjcp_category)==null?void 0:H.subcategory_letter}`.toLowerCase().includes(_)||((T=y.special_ingredients)==null?void 0:T.toLowerCase().includes(_))||((ge=y.notes)==null?void 0:ge.toLowerCase().includes(_))})}v.sort((_,y)=>{var C,b,N,A,fe,_e;let p,u;switch(Q){case"entry_number":p=_.entry_number||"",u=y.entry_number||"";break;case"member_name":p=((C=_.members)==null?void 0:C.name)||"",u=((b=y.members)==null?void 0:b.name)||"";break;case"beer_name":p=_.beer_name||"",u=y.beer_name||"";break;case"category":p=`${((N=_.bjcp_category)==null?void 0:N.category_number)||""}${((A=_.bjcp_category)==null?void 0:A.subcategory_letter)||""}`,u=`${((fe=y.bjcp_category)==null?void 0:fe.category_number)||""}${((_e=y.bjcp_category)==null?void 0:_e.subcategory_letter)||""}`;break;case"paid":p=_.is_paid?1:0,u=y.is_paid?1:0;break;case"submitted_at":const G=H=>{if(!H)return new Date(0);let T=H;if(H.includes(" ")&&!H.includes("T")){if(T=H.replace(" ","T"),T.includes(".")){const[ge,we]=T.split("."),je=we.substring(0,3);T=`${ge}.${je}`}!T.includes("+")&&!T.includes("Z")&&(T+="Z")}return new Date(T)};p=G(_.submitted_at),u=G(y.submitted_at);break;default:p=_[Q]||"",u=y[Q]||""}return M==="asc"?p>u?1:p<u?-1:0:p<u?1:p>u?-1:0}),t(2,V=v)}function X(v){Q===v?t(5,M=M==="asc"?"desc":"asc"):(t(4,Q=v),t(5,M="asc")),R()}function le(v){z.has(v)?z.delete(v):z.add(v),t(6,z=new Set(z))}function ye(){F?z.clear():V.forEach(v=>z.add(v.id)),t(6,z=new Set(z)),t(10,F=!F)}async function ce(v,_){try{const{error:y}=await it.from("competition_entries").update({is_paid:_,payment_date:_?new Date().toISOString():null}).eq("id",v);if(y)throw y;const p=j.findIndex(u=>u.id===v);p!==-1&&(t(8,j[p].is_paid=_,j),t(8,j[p].payment_date=_?new Date().toISOString():null,j),R())}catch(y){console.error("Error updating payment status:",y),alert("Failed to update payment status")}}function te(){const v=z.size>0?V.filter(p=>z.has(p.id)):V;if(v.length===0){alert("No entries selected for printing");return}const _=window.open("","_blank"),y=v.flatMap(p=>{var C,b,N,A;const u=`
      <div class="label">
        <div class="label-header">
          <strong>${(g==null?void 0:g.name)||"Competition"}</strong>
        </div>
        <div class="entry-number">
          Entry #: <span>${p.entry_number}</span>
        </div>
        <div class="beer-style">
          Style: <span>${((C=p.bjcp_category)==null?void 0:C.category_number)||""}${((b=p.bjcp_category)==null?void 0:b.subcategory_letter)||""}</span> - ${((N=p.bjcp_category)==null?void 0:N.category_name)||""}
          ${(A=p.bjcp_category)!=null&&A.subcategory_name?`<br><small>${p.bjcp_category.subcategory_name}</small>`:""}
          ${p.beer_notes?`<br><small>Special: ${p.beer_notes}</small>`:""}
        </div>
        ${p.notes?`
          <div class="notes">
            Notes: ${p.notes}
          </div>
        `:""}
      </div>
    `;return[u,u,u]}).join("");_.document.write(`
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
        ${y}
      </div>
    </body>
    </html>
  `),_.document.close(),_.focus(),setTimeout(()=>{_.print(),_.close()},250)}function x(){at("/officers/manage-competitions")}function he(){t(7,r=!1),at("/officers/manage-competitions")}function se(){const v=z.size>0?V.filter(N=>z.has(N.id)):V;if(v.length===0){alert("No entries to export");return}const p=[["Entry Number","Member Name","Beer Name","Category Number","Category Name","Subcategory Name","Paid","Submitted Date"].join(","),...v.map(N=>{var A,fe,_e,G,H;return[N.entry_number||"",`"${((A=N.members)==null?void 0:A.name)||""}"`,`"${N.beer_name||""}"`,`${((fe=N.bjcp_category)==null?void 0:fe.category_number)||""}${((_e=N.bjcp_category)==null?void 0:_e.subcategory_letter)||""}`,`"${((G=N.bjcp_category)==null?void 0:G.category_name)||""}"`,`"${((H=N.bjcp_category)==null?void 0:H.subcategory_name)||""}"`,N.is_paid?"Yes":"No",Ke(N.submitted_at)].join(",")})].join(`
`),u=new Blob([p],{type:"text/csv"}),C=window.URL.createObjectURL(u),b=document.createElement("a");b.href=C,b.download=`${(g==null?void 0:g.name)||"competition"}_entries_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(b),b.click(),document.body.removeChild(b),window.URL.revokeObjectURL(C)}function ae(){const v=z.size>0?V.filter(p=>z.has(p.id)):V;if(v.length===0){alert("No entries to print judging sheets for");return}const _=window.open("","_blank"),y=ie(v);_.document.write(y),_.document.close(),_.onload=()=>{_.print(),_.close()}}function ie(v){const _=(g==null?void 0:g.name)||"Competition",y=new Date().toLocaleDateString();return`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Judging Sheet - ${_}</title>
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
            <div class="competition-title">${_} - Judging Sheet</div>
            <div>Date: ${y}</div>
          </div>
          
          <div class="judge-info">
            <strong>Judge Name:</strong> <span class="judge-line"></span>
            <strong style="margin-left: 40px;">Signature:</strong> <span class="judge-line"></span>
          </div>
          
          <div class="entries-section">
            ${v.map(p=>{var u,C,b,N;return`
              <div class="entry-item">
                <div class="entry-header">
                  <div class="entry-number">Entry #${p.entry_number}</div>
                  <div class="beer-style">
                    ${((u=p.bjcp_category)==null?void 0:u.category_number)||""}${((C=p.bjcp_category)==null?void 0:C.subcategory_letter)||""} - 
                    ${((b=p.bjcp_category)==null?void 0:b.category_name)||"Unknown Category"}${(N=p.bjcp_category)!=null&&N.subcategory_name?` - ${p.bjcp_category.subcategory_name}`:""}
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
    `}function ne(){J=this.value,t(3,J)}const me=()=>X("entry_number"),de=()=>X("member_name"),ue=()=>X("beer_name"),be=()=>X("category"),W=()=>X("paid"),$=()=>X("submitted_at"),I=v=>le(v.id),q=v=>ce(v.id,!v.is_paid),K=v=>le(v.id),Y=v=>ce(v.id,!v.is_paid);return s.$$.update=()=>{s.$$.dirty[0]&4194304&&i&&(i.role==="competition_director"?(t(0,h=!0),t(7,r=!1)):(t(0,h=!1),t(7,r=!0))),s.$$.dirty[0]&2097152&&t(20,a=n.params.id),s.$$.dirty[0]&1048579&&h&&a&&!g&&O(),s.$$.dirty[0]&56&&R(),s.$$.dirty[0]&68&&t(10,F=z.size===V.length&&V.length>0)},[h,g,V,J,Q,M,z,r,j,L,F,X,le,ye,ce,te,x,he,se,ae,a,n,i,ne,me,de,ue,be,W,$,I,q,K,Y]}class as extends Ht{constructor(e){super(),Ut(this,e,Kt,Qt,zt,{},null,[-1,-1])}}export{as as component};
