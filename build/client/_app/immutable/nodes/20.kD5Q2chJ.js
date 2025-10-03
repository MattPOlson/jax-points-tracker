import{s as Ot,d as o,i as L,g as z,G as Ge,j as $,k as kt,C as qt,D as Jt,n as Ke,b as a,x as Ae,q as _,c as f,e as m,E as Ie,h as d,a as R,K as zt,f as C,t as j,F as $t,r as ft,M as Et}from"../chunks/DpwROyu6.js";import{S as Ft,i as Yt,t as Pe,a as Se,c as dt,d as Re,m as Me,b as Oe,e as qe,g as ut}from"../chunks/BHIxbS5H.js";import{e as at}from"../chunks/CurIhP_1.js";import{g as ot}from"../chunks/BPUUyVED.js";import{p as Zt}from"../chunks/9YNtkGAc.js";import{u as Wt}from"../chunks/CN8V5uJw.js";import{s as ct}from"../chunks/CCM_4jRA.js";import{H as Gt}from"../chunks/D4n3Zs5P.js";import{C as Kt}from"../chunks/XUMP8LP7.js";import{L as Qt}from"../chunks/BWGxyfTN.js";import{E as Xt}from"../chunks/CZ9EVN-i.js";import{B as it}from"../chunks/28GNhQ-J.js";function wt(s,e,t){const n=s.slice();return n[37]=e[t],n}function Ct(s,e,t){const n=s.slice();return n[37]=e[t],n}function jt(s){let e,t,n,l="🔒 Access Restricted",i,r,y="Only Competition Directors can access competition entries. This restriction helps maintain the integrity of competitions by ensuring that brewer information remains confidential until after judging is complete.",w,B,k="If you need access to this page, please contact an administrator to have your role updated to Competition Director.",P,U,G="Return to Competitions",M,I;return{c(){e=d("div"),t=d("div"),n=d("h2"),n.textContent=l,i=$(),r=d("p"),r.textContent=y,w=$(),B=d("p"),B.textContent=k,P=$(),U=d("button"),U.textContent=G,this.h()},l(Y){e=f(Y,"DIV",{class:!0});var O=m(e);t=f(O,"DIV",{class:!0});var q=m(t);n=f(q,"H2",{class:!0,"data-svelte-h":!0}),Ie(n)!=="svelte-1vimua2"&&(n.textContent=l),i=z(q),r=f(q,"P",{class:!0,"data-svelte-h":!0}),Ie(r)!=="svelte-1urfdgx"&&(r.textContent=y),w=z(q),B=f(q,"P",{class:!0,"data-svelte-h":!0}),Ie(B)!=="svelte-17raeg3"&&(B.textContent=k),P=z(q),U=f(q,"BUTTON",{class:!0,"data-svelte-h":!0}),Ie(U)!=="svelte-16lagpj"&&(U.textContent=G),q.forEach(o),O.forEach(o),this.h()},h(){_(n,"class","svelte-1in0g4z"),_(r,"class","svelte-1in0g4z"),_(B,"class","svelte-1in0g4z"),_(U,"class","modal-button svelte-1in0g4z"),_(t,"class","modal svelte-1in0g4z"),_(e,"class","modal-overlay svelte-1in0g4z")},m(Y,O){L(Y,e,O),a(e,t),a(t,n),a(t,i),a(t,r),a(t,w),a(t,B),a(t,P),a(t,U),M||(I=Ae(U,"click",s[17]),M=!0)},p:Ke,d(Y){Y&&o(e),M=!1,I()}}}function Dt(s){let e,t;return e=new Kt({props:{size:"xl",$$slots:{default:[dl]},$$scope:{ctx:s}}}),{c(){qe(e.$$.fragment)},l(n){Oe(e.$$.fragment,n)},m(n,l){Me(e,n,l),t=!0},p(n,l){const i={};l[0]&1918|l[1]&2048&&(i.$$scope={dirty:l,ctx:n}),e.$set(i)},i(n){t||(Se(e.$$.fragment,n),t=!0)},o(n){Pe(e.$$.fragment,n),t=!1},d(n){Re(e,n)}}}function xt(s){let e,t,n=s[1].name+"",l,i,r,y,w,B="Total Entries",k,P,U=s[8].length+"",G,M,I,Y,O="Paid Entries",q,X,ne=s[8].filter(Rt).length+"",ke,fe,te,x,ye="Entry Fee",le,ie,re,ae=(s[1].entry_fee||0)+"",ge,de,ue,ve,W="Total Fees",J,A,F,K=s[8].filter(Mt).length*(s[1].entry_fee||0)+"",Z,g,u,h,p,c,E,v,S,V,ee,_e,Q,H,D,se,ze,pe,Ee,be,me=s[6].size>0&&St(s);E=new it({props:{variant:"primary",disabled:s[2].length===0,$$slots:{default:[tl]},$$scope:{ctx:s}}}),E.$on("click",s[15]),S=new it({props:{variant:"success",disabled:s[2].length===0,$$slots:{default:[ll]},$$scope:{ctx:s}}}),S.$on("click",s[18]),ee=new it({props:{variant:"info",disabled:s[2].length===0,$$slots:{default:[sl]},$$scope:{ctx:s}}}),ee.$on("click",s[19]),Q=new it({props:{variant:"secondary",$$slots:{default:[nl]},$$scope:{ctx:s}}}),Q.$on("click",s[16]);const je=[il,al],N=[];function Ne(b,T){return b[2].length===0?0:1}return D=Ne(s),se=N[D]=je[D](s),{c(){e=d("div"),t=d("h2"),l=j(n),i=$(),r=d("div"),y=d("div"),w=d("span"),w.textContent=B,k=$(),P=d("span"),G=j(U),M=$(),I=d("div"),Y=d("span"),Y.textContent=O,q=$(),X=d("span"),ke=j(ne),fe=$(),te=d("div"),x=d("span"),x.textContent=ye,le=$(),ie=d("span"),re=j("$"),ge=j(ae),de=$(),ue=d("div"),ve=d("span"),ve.textContent=W,J=$(),A=d("span"),F=j("$"),Z=j(K),g=$(),u=d("div"),h=d("input"),p=$(),me&&me.c(),c=$(),qe(E.$$.fragment),v=$(),qe(S.$$.fragment),V=$(),qe(ee.$$.fragment),_e=$(),qe(Q.$$.fragment),H=$(),se.c(),ze=Ge(),this.h()},l(b){e=f(b,"DIV",{class:!0});var T=m(e);t=f(T,"H2",{class:!0});var we=m(t);l=C(we,n),we.forEach(o),i=z(T),r=f(T,"DIV",{class:!0});var he=m(r);y=f(he,"DIV",{class:!0});var Te=m(y);w=f(Te,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(w)!=="svelte-1ly6mm6"&&(w.textContent=B),k=z(Te),P=f(Te,"SPAN",{class:!0});var Le=m(P);G=C(Le,U),Le.forEach(o),Te.forEach(o),M=z(he),I=f(he,"DIV",{class:!0});var De=m(I);Y=f(De,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(Y)!=="svelte-1e7gzoe"&&(Y.textContent=O),q=z(De),X=f(De,"SPAN",{class:!0});var $e=m(X);ke=C($e,ne),$e.forEach(o),De.forEach(o),fe=z(he),te=f(he,"DIV",{class:!0});var oe=m(te);x=f(oe,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(x)!=="svelte-1dw3q0"&&(x.textContent=ye),le=z(oe),ie=f(oe,"SPAN",{class:!0});var Ue=m(ie);re=C(Ue,"$"),ge=C(Ue,ae),Ue.forEach(o),oe.forEach(o),de=z(he),ue=f(he,"DIV",{class:!0});var Ve=m(ue);ve=f(Ve,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(ve)!=="svelte-1k6mrzd"&&(ve.textContent=W),J=z(Ve),A=f(Ve,"SPAN",{class:!0});var He=m(A);F=C(He,"$"),Z=C(He,K),He.forEach(o),Ve.forEach(o),he.forEach(o),T.forEach(o),g=z(b),u=f(b,"DIV",{class:!0});var Ce=m(u);h=f(Ce,"INPUT",{type:!0,class:!0,placeholder:!0}),p=z(Ce),me&&me.l(Ce),c=z(Ce),Oe(E.$$.fragment,Ce),v=z(Ce),Oe(S.$$.fragment,Ce),V=z(Ce),Oe(ee.$$.fragment,Ce),_e=z(Ce),Oe(Q.$$.fragment,Ce),Ce.forEach(o),H=z(b),se.l(b),ze=Ge(),this.h()},h(){_(t,"class","svelte-1in0g4z"),_(w,"class","info-label svelte-1in0g4z"),_(P,"class","info-value svelte-1in0g4z"),_(y,"class","info-item svelte-1in0g4z"),_(Y,"class","info-label svelte-1in0g4z"),_(X,"class","info-value svelte-1in0g4z"),_(I,"class","info-item svelte-1in0g4z"),_(x,"class","info-label svelte-1in0g4z"),_(ie,"class","info-value svelte-1in0g4z"),_(te,"class","info-item svelte-1in0g4z"),_(ve,"class","info-label svelte-1in0g4z"),_(A,"class","info-value svelte-1in0g4z"),_(ue,"class","info-item svelte-1in0g4z"),_(r,"class","info-grid svelte-1in0g4z"),_(e,"class","competition-info svelte-1in0g4z"),_(h,"type","text"),_(h,"class","search-input svelte-1in0g4z"),_(h,"placeholder","Search entries..."),_(u,"class","controls svelte-1in0g4z")},m(b,T){L(b,e,T),a(e,t),a(t,l),a(e,i),a(e,r),a(r,y),a(y,w),a(y,k),a(y,P),a(P,G),a(r,M),a(r,I),a(I,Y),a(I,q),a(I,X),a(X,ke),a(r,fe),a(r,te),a(te,x),a(te,le),a(te,ie),a(ie,re),a(ie,ge),a(r,de),a(r,ue),a(ue,ve),a(ue,J),a(ue,A),a(A,F),a(A,Z),L(b,g,T),L(b,u,T),a(u,h),zt(h,s[3]),a(u,p),me&&me.m(u,null),a(u,c),Me(E,u,null),a(u,v),Me(S,u,null),a(u,V),Me(ee,u,null),a(u,_e),Me(Q,u,null),L(b,H,T),N[D].m(b,T),L(b,ze,T),pe=!0,Ee||(be=Ae(h,"input",s[23]),Ee=!0)},p(b,T){(!pe||T[0]&2)&&n!==(n=b[1].name+"")&&R(l,n),(!pe||T[0]&256)&&U!==(U=b[8].length+"")&&R(G,U),(!pe||T[0]&256)&&ne!==(ne=b[8].filter(Rt).length+"")&&R(ke,ne),(!pe||T[0]&2)&&ae!==(ae=(b[1].entry_fee||0)+"")&&R(ge,ae),(!pe||T[0]&258)&&K!==(K=b[8].filter(Mt).length*(b[1].entry_fee||0)+"")&&R(Z,K),T[0]&8&&h.value!==b[3]&&zt(h,b[3]),b[6].size>0?me?me.p(b,T):(me=St(b),me.c(),me.m(u,c)):me&&(me.d(1),me=null);const we={};T[0]&4&&(we.disabled=b[2].length===0),T[0]&64|T[1]&2048&&(we.$$scope={dirty:T,ctx:b}),E.$set(we);const he={};T[0]&4&&(he.disabled=b[2].length===0),T[0]&64|T[1]&2048&&(he.$$scope={dirty:T,ctx:b}),S.$set(he);const Te={};T[0]&4&&(Te.disabled=b[2].length===0),T[0]&64|T[1]&2048&&(Te.$$scope={dirty:T,ctx:b}),ee.$set(Te);const Le={};T[1]&2048&&(Le.$$scope={dirty:T,ctx:b}),Q.$set(Le);let De=D;D=Ne(b),D===De?N[D].p(b,T):(ut(),Pe(N[De],1,1,()=>{N[De]=null}),dt(),se=N[D],se?se.p(b,T):(se=N[D]=je[D](b),se.c()),Se(se,1),se.m(ze.parentNode,ze))},i(b){pe||(Se(E.$$.fragment,b),Se(S.$$.fragment,b),Se(ee.$$.fragment,b),Se(Q.$$.fragment,b),Se(se),pe=!0)},o(b){Pe(E.$$.fragment,b),Pe(S.$$.fragment,b),Pe(ee.$$.fragment,b),Pe(Q.$$.fragment,b),Pe(se),pe=!1},d(b){b&&(o(e),o(g),o(u),o(H),o(ze)),me&&me.d(),Re(E),Re(S),Re(ee),Re(Q),N[D].d(b),Ee=!1,be()}}}function el(s){let e,t;return e=new Qt({props:{message:"Loading entries..."}}),{c(){qe(e.$$.fragment)},l(n){Oe(e.$$.fragment,n)},m(n,l){Me(e,n,l),t=!0},p:Ke,i(n){t||(Se(e.$$.fragment,n),t=!0)},o(n){Pe(e.$$.fragment,n),t=!1},d(n){Re(e,n)}}}function St(s){let e,t=s[6].size+"",n,l;return{c(){e=d("span"),n=j(t),l=j(" selected"),this.h()},l(i){e=f(i,"SPAN",{class:!0});var r=m(e);n=C(r,t),l=C(r," selected"),r.forEach(o),this.h()},h(){_(e,"class","selected-count svelte-1in0g4z")},m(i,r){L(i,e,r),a(e,n),a(e,l)},p(i,r){r[0]&64&&t!==(t=i[6].size+"")&&R(n,t)},d(i){i&&o(e)}}}function tl(s){let e,t=s[6].size>0?`(${s[6].size})`:"(All)",n;return{c(){e=j("🖨️ Print Labels "),n=j(t)},l(l){e=C(l,"🖨️ Print Labels "),n=C(l,t)},m(l,i){L(l,e,i),L(l,n,i)},p(l,i){i[0]&64&&t!==(t=l[6].size>0?`(${l[6].size})`:"(All)")&&R(n,t)},d(l){l&&(o(e),o(n))}}}function ll(s){let e,t=s[6].size>0?`(${s[6].size})`:"(All)",n;return{c(){e=j("📊 Export CSV "),n=j(t)},l(l){e=C(l,"📊 Export CSV "),n=C(l,t)},m(l,i){L(l,e,i),L(l,n,i)},p(l,i){i[0]&64&&t!==(t=l[6].size>0?`(${l[6].size})`:"(All)")&&R(n,t)},d(l){l&&(o(e),o(n))}}}function sl(s){let e,t=s[6].size>0?`(${s[6].size})`:"(All)",n;return{c(){e=j("📝 Print Judging Sheets "),n=j(t)},l(l){e=C(l,"📝 Print Judging Sheets "),n=C(l,t)},m(l,i){L(l,e,i),L(l,n,i)},p(l,i){i[0]&64&&t!==(t=l[6].size>0?`(${l[6].size})`:"(All)")&&R(n,t)},d(l){l&&(o(e),o(n))}}}function nl(s){let e;return{c(){e=j("← Back")},l(t){e=C(t,"← Back")},m(t,n){L(t,e,n)},d(t){t&&o(e)}}}function al(s){let e,t,n,l,i,r,y,w,B,k,P,U,G,M,I,Y,O,q,X,ne,ke="Style",fe,te,x,ye,le,ie,re,ae,ge,de,ue,ve,W=s[4]==="entry_number"&&Nt(s),J=s[4]==="member_name"&&Pt(s),A=s[4]==="beer_name"&&Tt(s),F=s[4]==="category"&&At(s),K=s[4]==="paid"&&It(s),Z=s[4]==="submitted_at"&&Vt(s),g=at(s[2]),u=[];for(let c=0;c<g.length;c+=1)u[c]=Ht(Ct(s,g,c));let h=at(s[2]),p=[];for(let c=0;c<h.length;c+=1)p[c]=Ut(wt(s,h,c));return{c(){e=d("div"),t=d("table"),n=d("thead"),l=d("tr"),i=d("th"),r=d("input"),y=$(),w=d("th"),B=j(`Entry #
                `),W&&W.c(),k=$(),P=d("th"),U=j(`Member
                `),J&&J.c(),G=$(),M=d("th"),I=j(`Beer Name
                `),A&&A.c(),Y=$(),O=d("th"),q=j(`Category
                `),F&&F.c(),X=$(),ne=d("th"),ne.textContent=ke,fe=$(),te=d("th"),x=j(`Paid
                `),K&&K.c(),ye=$(),le=d("th"),ie=j(`Submitted
                `),Z&&Z.c(),re=$(),ae=d("tbody");for(let c=0;c<u.length;c+=1)u[c].c();ge=$(),de=d("div");for(let c=0;c<p.length;c+=1)p[c].c();this.h()},l(c){e=f(c,"DIV",{class:!0});var E=m(e);t=f(E,"TABLE",{class:!0});var v=m(t);n=f(v,"THEAD",{});var S=m(n);l=f(S,"TR",{class:!0});var V=m(l);i=f(V,"TH",{class:!0});var ee=m(i);r=f(ee,"INPUT",{type:!0}),ee.forEach(o),y=z(V),w=f(V,"TH",{class:!0});var _e=m(w);B=C(_e,`Entry #
                `),W&&W.l(_e),_e.forEach(o),k=z(V),P=f(V,"TH",{class:!0});var Q=m(P);U=C(Q,`Member
                `),J&&J.l(Q),Q.forEach(o),G=z(V),M=f(V,"TH",{class:!0});var H=m(M);I=C(H,`Beer Name
                `),A&&A.l(H),H.forEach(o),Y=z(V),O=f(V,"TH",{class:!0});var D=m(O);q=C(D,`Category
                `),F&&F.l(D),D.forEach(o),X=z(V),ne=f(V,"TH",{class:!0,"data-svelte-h":!0}),Ie(ne)!=="svelte-1cj4qqf"&&(ne.textContent=ke),fe=z(V),te=f(V,"TH",{class:!0});var se=m(te);x=C(se,`Paid
                `),K&&K.l(se),se.forEach(o),ye=z(V),le=f(V,"TH",{class:!0});var ze=m(le);ie=C(ze,`Submitted
                `),Z&&Z.l(ze),ze.forEach(o),V.forEach(o),S.forEach(o),re=z(v),ae=f(v,"TBODY",{});var pe=m(ae);for(let be=0;be<u.length;be+=1)u[be].l(pe);pe.forEach(o),v.forEach(o),E.forEach(o),ge=z(c),de=f(c,"DIV",{class:!0});var Ee=m(de);for(let be=0;be<p.length;be+=1)p[be].l(Ee);Ee.forEach(o),this.h()},h(){_(r,"type","checkbox"),r.checked=s[10],_(i,"class","checkbox-cell svelte-1in0g4z"),_(w,"class","svelte-1in0g4z"),_(P,"class","svelte-1in0g4z"),_(M,"class","svelte-1in0g4z"),_(O,"class","svelte-1in0g4z"),_(ne,"class","svelte-1in0g4z"),_(te,"class","svelte-1in0g4z"),_(le,"class","svelte-1in0g4z"),_(l,"class","svelte-1in0g4z"),_(t,"class","svelte-1in0g4z"),_(e,"class","entries-table svelte-1in0g4z"),_(de,"class","entries-cards svelte-1in0g4z")},m(c,E){L(c,e,E),a(e,t),a(t,n),a(n,l),a(l,i),a(i,r),a(l,y),a(l,w),a(w,B),W&&W.m(w,null),a(l,k),a(l,P),a(P,U),J&&J.m(P,null),a(l,G),a(l,M),a(M,I),A&&A.m(M,null),a(l,Y),a(l,O),a(O,q),F&&F.m(O,null),a(l,X),a(l,ne),a(l,fe),a(l,te),a(te,x),K&&K.m(te,null),a(l,ye),a(l,le),a(le,ie),Z&&Z.m(le,null),a(t,re),a(t,ae);for(let v=0;v<u.length;v+=1)u[v]&&u[v].m(ae,null);L(c,ge,E),L(c,de,E);for(let v=0;v<p.length;v+=1)p[v]&&p[v].m(de,null);ue||(ve=[Ae(r,"change",s[13]),Ae(w,"click",s[24]),Ae(P,"click",s[25]),Ae(M,"click",s[26]),Ae(O,"click",s[27]),Ae(te,"click",s[28]),Ae(le,"click",s[29])],ue=!0)},p(c,E){if(E[0]&1024&&(r.checked=c[10]),c[4]==="entry_number"?W?W.p(c,E):(W=Nt(c),W.c(),W.m(w,null)):W&&(W.d(1),W=null),c[4]==="member_name"?J?J.p(c,E):(J=Pt(c),J.c(),J.m(P,null)):J&&(J.d(1),J=null),c[4]==="beer_name"?A?A.p(c,E):(A=Tt(c),A.c(),A.m(M,null)):A&&(A.d(1),A=null),c[4]==="category"?F?F.p(c,E):(F=At(c),F.c(),F.m(O,null)):F&&(F.d(1),F=null),c[4]==="paid"?K?K.p(c,E):(K=It(c),K.c(),K.m(te,null)):K&&(K.d(1),K=null),c[4]==="submitted_at"?Z?Z.p(c,E):(Z=Vt(c),Z.c(),Z.m(le,null)):Z&&(Z.d(1),Z=null),E[0]&20548){g=at(c[2]);let v;for(v=0;v<g.length;v+=1){const S=Ct(c,g,v);u[v]?u[v].p(S,E):(u[v]=Ht(S),u[v].c(),u[v].m(ae,null))}for(;v<u.length;v+=1)u[v].d(1);u.length=g.length}if(E[0]&20548){h=at(c[2]);let v;for(v=0;v<h.length;v+=1){const S=wt(c,h,v);p[v]?p[v].p(S,E):(p[v]=Ut(S),p[v].c(),p[v].m(de,null))}for(;v<p.length;v+=1)p[v].d(1);p.length=h.length}},i:Ke,o:Ke,d(c){c&&(o(e),o(ge),o(de)),W&&W.d(),J&&J.d(),A&&A.d(),F&&F.d(),K&&K.d(),Z&&Z.d(),$t(u,c),$t(p,c),ue=!1,ft(ve)}}}function il(s){let e,t;return e=new Xt({props:{icon:"📋",title:"No entries found",message:s[3]?"Try adjusting your search":"No entries have been submitted yet"}}),{c(){qe(e.$$.fragment)},l(n){Oe(e.$$.fragment,n)},m(n,l){Me(e,n,l),t=!0},p(n,l){const i={};l[0]&8&&(i.message=n[3]?"Try adjusting your search":"No entries have been submitted yet"),e.$set(i)},i(n){t||(Se(e.$$.fragment,n),t=!0)},o(n){Pe(e.$$.fragment,n),t=!1},d(n){Re(e,n)}}}function Nt(s){let e,t=s[5]==="asc"?"↑":"↓",n;return{c(){e=d("span"),n=j(t),this.h()},l(l){e=f(l,"SPAN",{class:!0});var i=m(e);n=C(i,t),i.forEach(o),this.h()},h(){_(e,"class","sort-indicator svelte-1in0g4z")},m(l,i){L(l,e,i),a(e,n)},p(l,i){i[0]&32&&t!==(t=l[5]==="asc"?"↑":"↓")&&R(n,t)},d(l){l&&o(e)}}}function Pt(s){let e,t=s[5]==="asc"?"↑":"↓",n;return{c(){e=d("span"),n=j(t),this.h()},l(l){e=f(l,"SPAN",{class:!0});var i=m(e);n=C(i,t),i.forEach(o),this.h()},h(){_(e,"class","sort-indicator svelte-1in0g4z")},m(l,i){L(l,e,i),a(e,n)},p(l,i){i[0]&32&&t!==(t=l[5]==="asc"?"↑":"↓")&&R(n,t)},d(l){l&&o(e)}}}function Tt(s){let e,t=s[5]==="asc"?"↑":"↓",n;return{c(){e=d("span"),n=j(t),this.h()},l(l){e=f(l,"SPAN",{class:!0});var i=m(e);n=C(i,t),i.forEach(o),this.h()},h(){_(e,"class","sort-indicator svelte-1in0g4z")},m(l,i){L(l,e,i),a(e,n)},p(l,i){i[0]&32&&t!==(t=l[5]==="asc"?"↑":"↓")&&R(n,t)},d(l){l&&o(e)}}}function At(s){let e,t=s[5]==="asc"?"↑":"↓",n;return{c(){e=d("span"),n=j(t),this.h()},l(l){e=f(l,"SPAN",{class:!0});var i=m(e);n=C(i,t),i.forEach(o),this.h()},h(){_(e,"class","sort-indicator svelte-1in0g4z")},m(l,i){L(l,e,i),a(e,n)},p(l,i){i[0]&32&&t!==(t=l[5]==="asc"?"↑":"↓")&&R(n,t)},d(l){l&&o(e)}}}function It(s){let e,t=s[5]==="asc"?"↑":"↓",n;return{c(){e=d("span"),n=j(t),this.h()},l(l){e=f(l,"SPAN",{class:!0});var i=m(e);n=C(i,t),i.forEach(o),this.h()},h(){_(e,"class","sort-indicator svelte-1in0g4z")},m(l,i){L(l,e,i),a(e,n)},p(l,i){i[0]&32&&t!==(t=l[5]==="asc"?"↑":"↓")&&R(n,t)},d(l){l&&o(e)}}}function Vt(s){let e,t=s[5]==="asc"?"↑":"↓",n;return{c(){e=d("span"),n=j(t),this.h()},l(l){e=f(l,"SPAN",{class:!0});var i=m(e);n=C(i,t),i.forEach(o),this.h()},h(){_(e,"class","sort-indicator svelte-1in0g4z")},m(l,i){L(l,e,i),a(e,n)},p(l,i){i[0]&32&&t!==(t=l[5]==="asc"?"↑":"↓")&&R(n,t)},d(l){l&&o(e)}}}function rl(s){let e;return{c(){e=j("-")},l(t){e=C(t,"-")},m(t,n){L(t,e,n)},p:Ke,d(t){t&&o(e)}}}function ol(s){let e=s[37].bjcp_category.category_number+"",t,n,l=s[37].bjcp_category.category_name+"",i;return{c(){t=j(e),n=$(),i=j(l)},l(r){t=C(r,e),n=z(r),i=C(r,l)},m(r,y){L(r,t,y),L(r,n,y),L(r,i,y)},p(r,y){y[0]&4&&e!==(e=r[37].bjcp_category.category_number+"")&&R(t,e),y[0]&4&&l!==(l=r[37].bjcp_category.category_name+"")&&R(i,l)},d(r){r&&(o(t),o(n),o(i))}}}function Lt(s){let e,t,n=s[37].bjcp_category.subcategory_name+"",l;return{c(){e=d("br"),t=d("small"),l=j(n)},l(i){e=f(i,"BR",{}),t=f(i,"SMALL",{});var r=m(t);l=C(r,n),r.forEach(o)},m(i,r){L(i,e,r),L(i,t,r),a(t,l)},p(i,r){r[0]&4&&n!==(n=i[37].bjcp_category.subcategory_name+"")&&R(l,n)},d(i){i&&(o(e),o(t))}}}function Ht(s){var ze,pe,Ee,be,me;let e,t,n,l,i,r,y,w=s[37].entry_number+"",B,k,P,U,G=((ze=s[37].members)==null?void 0:ze.name)+"",M,I,Y,O=((pe=s[37].members)==null?void 0:pe.email)+"",q,X,ne,ke=(s[37].beer_name||"-")+"",fe,te,x,ye,le,ie,re=(((Ee=s[37].bjcp_category)==null?void 0:Ee.category_number)||"")+"",ae,ge=(((be=s[37].bjcp_category)==null?void 0:be.subcategory_letter)||"")+"",de,ue,ve,W,J,A,F,K,Z,g=s[37].is_paid?"Paid":"Unpaid",u,h,p,c=xe(s[37].submitted_at)+"",E,v,S,V;function ee(){return s[30](s[37])}function _e(je,N){return je[37].bjcp_category?ol:rl}let Q=_e(s),H=Q(s),D=((me=s[37].bjcp_category)==null?void 0:me.subcategory_name)&&Lt(s);function se(){return s[31](s[37])}return{c(){e=d("tr"),t=d("td"),n=d("input"),i=$(),r=d("td"),y=d("span"),B=j(w),k=$(),P=d("td"),U=d("div"),M=j(G),I=$(),Y=d("small"),q=j(O),X=$(),ne=d("td"),fe=j(ke),te=$(),x=d("td"),H.c(),ye=$(),le=d("td"),ie=d("span"),ae=j(re),de=j(ge),ue=$(),D&&D.c(),ve=$(),W=d("td"),J=d("div"),A=d("div"),K=$(),Z=d("span"),u=j(g),h=$(),p=d("td"),E=j(c),v=$(),this.h()},l(je){e=f(je,"TR",{class:!0});var N=m(e);t=f(N,"TD",{class:!0});var Ne=m(t);n=f(Ne,"INPUT",{type:!0}),Ne.forEach(o),i=z(N),r=f(N,"TD",{class:!0});var b=m(r);y=f(b,"SPAN",{class:!0});var T=m(y);B=C(T,w),T.forEach(o),b.forEach(o),k=z(N),P=f(N,"TD",{class:!0});var we=m(P);U=f(we,"DIV",{});var he=m(U);M=C(he,G),he.forEach(o),I=z(we),Y=f(we,"SMALL",{});var Te=m(Y);q=C(Te,O),Te.forEach(o),we.forEach(o),X=z(N),ne=f(N,"TD",{class:!0});var Le=m(ne);fe=C(Le,ke),Le.forEach(o),te=z(N),x=f(N,"TD",{class:!0});var De=m(x);H.l(De),De.forEach(o),ye=z(N),le=f(N,"TD",{class:!0});var $e=m(le);ie=f($e,"SPAN",{class:!0});var oe=m(ie);ae=C(oe,re),de=C(oe,ge),oe.forEach(o),ue=z($e),D&&D.l($e),$e.forEach(o),ve=z(N),W=f(N,"TD",{class:!0});var Ue=m(W);J=f(Ue,"DIV",{class:!0});var Ve=m(J);A=f(Ve,"DIV",{class:!0}),m(A).forEach(o),K=z(Ve),Z=f(Ve,"SPAN",{});var He=m(Z);u=C(He,g),He.forEach(o),Ve.forEach(o),Ue.forEach(o),h=z(N),p=f(N,"TD",{class:!0});var Ce=m(p);E=C(Ce,c),Ce.forEach(o),v=z(N),N.forEach(o),this.h()},h(){_(n,"type","checkbox"),n.checked=l=s[6].has(s[37].id),_(t,"class","checkbox-cell svelte-1in0g4z"),_(y,"class","entry-number svelte-1in0g4z"),_(r,"class","svelte-1in0g4z"),_(P,"class","svelte-1in0g4z"),_(ne,"class","svelte-1in0g4z"),_(x,"class","svelte-1in0g4z"),_(ie,"class","category-badge svelte-1in0g4z"),_(le,"class","svelte-1in0g4z"),_(A,"class",F="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-1in0g4z"),_(J,"class","payment-toggle svelte-1in0g4z"),_(W,"class","svelte-1in0g4z"),_(p,"class","svelte-1in0g4z"),_(e,"class","svelte-1in0g4z")},m(je,N){L(je,e,N),a(e,t),a(t,n),a(e,i),a(e,r),a(r,y),a(y,B),a(e,k),a(e,P),a(P,U),a(U,M),a(P,I),a(P,Y),a(Y,q),a(e,X),a(e,ne),a(ne,fe),a(e,te),a(e,x),H.m(x,null),a(e,ye),a(e,le),a(le,ie),a(ie,ae),a(ie,de),a(le,ue),D&&D.m(le,null),a(e,ve),a(e,W),a(W,J),a(J,A),a(J,K),a(J,Z),a(Z,u),a(e,h),a(e,p),a(p,E),a(e,v),S||(V=[Ae(n,"change",ee),Ae(A,"click",se)],S=!0)},p(je,N){var Ne,b,T,we,he;s=je,N[0]&68&&l!==(l=s[6].has(s[37].id))&&(n.checked=l),N[0]&4&&w!==(w=s[37].entry_number+"")&&R(B,w),N[0]&4&&G!==(G=((Ne=s[37].members)==null?void 0:Ne.name)+"")&&R(M,G),N[0]&4&&O!==(O=((b=s[37].members)==null?void 0:b.email)+"")&&R(q,O),N[0]&4&&ke!==(ke=(s[37].beer_name||"-")+"")&&R(fe,ke),Q===(Q=_e(s))&&H?H.p(s,N):(H.d(1),H=Q(s),H&&(H.c(),H.m(x,null))),N[0]&4&&re!==(re=(((T=s[37].bjcp_category)==null?void 0:T.category_number)||"")+"")&&R(ae,re),N[0]&4&&ge!==(ge=(((we=s[37].bjcp_category)==null?void 0:we.subcategory_letter)||"")+"")&&R(de,ge),(he=s[37].bjcp_category)!=null&&he.subcategory_name?D?D.p(s,N):(D=Lt(s),D.c(),D.m(le,null)):D&&(D.d(1),D=null),N[0]&4&&F!==(F="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-1in0g4z")&&_(A,"class",F),N[0]&4&&g!==(g=s[37].is_paid?"Paid":"Unpaid")&&R(u,g),N[0]&4&&c!==(c=xe(s[37].submitted_at)+"")&&R(E,c)},d(je){je&&o(e),H.d(),D&&D.d(),S=!1,ft(V)}}}function cl(s){let e;return{c(){e=j("-")},l(t){e=C(t,"-")},m(t,n){L(t,e,n)},p:Ke,d(t){t&&o(e)}}}function fl(s){let e=s[37].bjcp_category.category_number+"",t,n,l=s[37].bjcp_category.category_name+"",i;return{c(){t=j(e),n=$(),i=j(l)},l(r){t=C(r,e),n=z(r),i=C(r,l)},m(r,y){L(r,t,y),L(r,n,y),L(r,i,y)},p(r,y){y[0]&4&&e!==(e=r[37].bjcp_category.category_number+"")&&R(t,e),y[0]&4&&l!==(l=r[37].bjcp_category.category_name+"")&&R(i,l)},d(r){r&&(o(t),o(n),o(i))}}}function Bt(s){let e,t,n=s[37].bjcp_category.subcategory_name+"",l;return{c(){e=d("br"),t=d("small"),l=j(n),this.h()},l(i){e=f(i,"BR",{}),t=f(i,"SMALL",{style:!0});var r=m(t);l=C(r,n),r.forEach(o),this.h()},h(){Et(t,"color","#666"),Et(t,"font-size","0.8rem")},m(i,r){L(i,e,r),L(i,t,r),a(t,l)},p(i,r){r[0]&4&&n!==(n=i[37].bjcp_category.subcategory_name+"")&&R(l,n)},d(i){i&&(o(e),o(t))}}}function Ut(s){var Ve,He,Ce,_t,pt;let e,t,n,l,i,r=s[37].entry_number+"",y,w,B,k=(s[37].beer_name||"No name provided")+"",P,U,G,M,I,Y,O,q,X,ne="Category",ke,fe,te,x,ye,le="Style",ie,re,ae,ge=(((Ve=s[37].bjcp_category)==null?void 0:Ve.category_number)||"")+"",de,ue=(((He=s[37].bjcp_category)==null?void 0:He.subcategory_letter)||"")+"",ve,W,J,A,F,K="Submitted",Z,g,u=xe(s[37].submitted_at)+"",h,p,c,E,v="Brewer Information",S,V,ee=((Ce=s[37].members)==null?void 0:Ce.name)+"",_e,Q,H,D=((_t=s[37].members)==null?void 0:_t.email)+"",se,ze,pe,Ee,be,me,je,N,Ne=s[37].is_paid?"Paid":"Unpaid",b,T,we,he;function Te(){return s[32](s[37])}function Le(Be,ce){return Be[37].bjcp_category?fl:cl}let De=Le(s),$e=De(s),oe=((pt=s[37].bjcp_category)==null?void 0:pt.subcategory_name)&&Bt(s);function Ue(){return s[33](s[37])}return{c(){e=d("div"),t=d("div"),n=d("div"),l=d("h4"),i=j("#"),y=j(r),w=$(),B=d("div"),P=j(k),U=$(),G=d("div"),M=d("input"),Y=$(),O=d("div"),q=d("div"),X=d("span"),X.textContent=ne,ke=$(),fe=d("div"),$e.c(),te=$(),x=d("div"),ye=d("span"),ye.textContent=le,ie=$(),re=d("div"),ae=d("span"),de=j(ge),ve=j(ue),W=$(),oe&&oe.c(),J=$(),A=d("div"),F=d("span"),F.textContent=K,Z=$(),g=d("span"),h=j(u),p=$(),c=d("div"),E=d("h5"),E.textContent=v,S=$(),V=d("div"),_e=j(ee),Q=$(),H=d("div"),se=j(D),ze=$(),pe=d("div"),Ee=d("div"),be=d("div"),je=$(),N=d("span"),b=j(Ne),T=$(),this.h()},l(Be){e=f(Be,"DIV",{class:!0});var ce=m(e);t=f(ce,"DIV",{class:!0});var Je=m(t);n=f(Je,"DIV",{class:!0});var Fe=m(n);l=f(Fe,"H4",{class:!0});var Ye=m(l);i=C(Ye,"#"),y=C(Ye,r),Ye.forEach(o),w=z(Fe),B=f(Fe,"DIV",{class:!0});var Qe=m(B);P=C(Qe,k),Qe.forEach(o),Fe.forEach(o),U=z(Je),G=f(Je,"DIV",{class:!0});var Xe=m(G);M=f(Xe,"INPUT",{type:!0}),Xe.forEach(o),Je.forEach(o),Y=z(ce),O=f(ce,"DIV",{class:!0});var Ze=m(O);q=f(Ze,"DIV",{class:!0});var et=m(q);X=f(et,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(X)!=="svelte-13uauhn"&&(X.textContent=ne),ke=z(et),fe=f(et,"DIV",{class:!0});var mt=m(fe);$e.l(mt),mt.forEach(o),et.forEach(o),te=z(Ze),x=f(Ze,"DIV",{class:!0});var tt=m(x);ye=f(tt,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(ye)!=="svelte-3grn8s"&&(ye.textContent=le),ie=z(tt),re=f(tt,"DIV",{class:!0});var lt=m(re);ae=f(lt,"SPAN",{class:!0});var rt=m(ae);de=C(rt,ge),ve=C(rt,ue),rt.forEach(o),W=z(lt),oe&&oe.l(lt),lt.forEach(o),tt.forEach(o),J=z(Ze),A=f(Ze,"DIV",{class:!0});var st=m(A);F=f(st,"SPAN",{class:!0,"data-svelte-h":!0}),Ie(F)!=="svelte-baos0g"&&(F.textContent=K),Z=z(st),g=f(st,"SPAN",{class:!0});var gt=m(g);h=C(gt,u),gt.forEach(o),st.forEach(o),Ze.forEach(o),p=z(ce),c=f(ce,"DIV",{class:!0});var We=m(c);E=f(We,"H5",{class:!0,"data-svelte-h":!0}),Ie(E)!=="svelte-6h9wyx"&&(E.textContent=v),S=z(We),V=f(We,"DIV",{class:!0});var vt=m(V);_e=C(vt,ee),vt.forEach(o),Q=z(We),H=f(We,"DIV",{class:!0});var bt=m(H);se=C(bt,D),bt.forEach(o),We.forEach(o),ze=z(ce),pe=f(ce,"DIV",{class:!0});var ht=m(pe);Ee=f(ht,"DIV",{class:!0});var nt=m(Ee);be=f(nt,"DIV",{class:!0}),m(be).forEach(o),je=z(nt),N=f(nt,"SPAN",{});var yt=m(N);b=C(yt,Ne),yt.forEach(o),nt.forEach(o),ht.forEach(o),T=z(ce),ce.forEach(o),this.h()},h(){_(l,"class","svelte-1in0g4z"),_(B,"class","beer-name svelte-1in0g4z"),_(n,"class","entry-info svelte-1in0g4z"),_(M,"type","checkbox"),M.checked=I=s[6].has(s[37].id),_(G,"class","entry-actions svelte-1in0g4z"),_(t,"class","entry-header svelte-1in0g4z"),_(X,"class","label svelte-1in0g4z"),_(fe,"class","value svelte-1in0g4z"),_(q,"class","detail-group svelte-1in0g4z"),_(ye,"class","label svelte-1in0g4z"),_(ae,"class","category-mobile svelte-1in0g4z"),_(re,"class","value svelte-1in0g4z"),_(x,"class","detail-group svelte-1in0g4z"),_(F,"class","label svelte-1in0g4z"),_(g,"class","value svelte-1in0g4z"),_(A,"class","detail-group svelte-1in0g4z"),_(O,"class","entry-details svelte-1in0g4z"),_(E,"class","svelte-1in0g4z"),_(V,"class","name svelte-1in0g4z"),_(H,"class","email svelte-1in0g4z"),_(c,"class","member-info svelte-1in0g4z"),_(be,"class",me="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-1in0g4z"),_(Ee,"class","payment-toggle svelte-1in0g4z"),_(pe,"class","payment-status-mobile svelte-1in0g4z"),_(e,"class","entry-card svelte-1in0g4z")},m(Be,ce){L(Be,e,ce),a(e,t),a(t,n),a(n,l),a(l,i),a(l,y),a(n,w),a(n,B),a(B,P),a(t,U),a(t,G),a(G,M),a(e,Y),a(e,O),a(O,q),a(q,X),a(q,ke),a(q,fe),$e.m(fe,null),a(O,te),a(O,x),a(x,ye),a(x,ie),a(x,re),a(re,ae),a(ae,de),a(ae,ve),a(re,W),oe&&oe.m(re,null),a(O,J),a(O,A),a(A,F),a(A,Z),a(A,g),a(g,h),a(e,p),a(e,c),a(c,E),a(c,S),a(c,V),a(V,_e),a(c,Q),a(c,H),a(H,se),a(e,ze),a(e,pe),a(pe,Ee),a(Ee,be),a(Ee,je),a(Ee,N),a(N,b),a(e,T),we||(he=[Ae(M,"change",Te),Ae(be,"click",Ue)],we=!0)},p(Be,ce){var Je,Fe,Ye,Qe,Xe;s=Be,ce[0]&4&&r!==(r=s[37].entry_number+"")&&R(y,r),ce[0]&4&&k!==(k=(s[37].beer_name||"No name provided")+"")&&R(P,k),ce[0]&68&&I!==(I=s[6].has(s[37].id))&&(M.checked=I),De===(De=Le(s))&&$e?$e.p(s,ce):($e.d(1),$e=De(s),$e&&($e.c(),$e.m(fe,null))),ce[0]&4&&ge!==(ge=(((Je=s[37].bjcp_category)==null?void 0:Je.category_number)||"")+"")&&R(de,ge),ce[0]&4&&ue!==(ue=(((Fe=s[37].bjcp_category)==null?void 0:Fe.subcategory_letter)||"")+"")&&R(ve,ue),(Ye=s[37].bjcp_category)!=null&&Ye.subcategory_name?oe?oe.p(s,ce):(oe=Bt(s),oe.c(),oe.m(re,null)):oe&&(oe.d(1),oe=null),ce[0]&4&&u!==(u=xe(s[37].submitted_at)+"")&&R(h,u),ce[0]&4&&ee!==(ee=((Qe=s[37].members)==null?void 0:Qe.name)+"")&&R(_e,ee),ce[0]&4&&D!==(D=((Xe=s[37].members)==null?void 0:Xe.email)+"")&&R(se,D),ce[0]&4&&me!==(me="toggle-switch "+(s[37].is_paid?"active":"")+" svelte-1in0g4z")&&_(be,"class",me),ce[0]&4&&Ne!==(Ne=s[37].is_paid?"Paid":"Unpaid")&&R(b,Ne)},d(Be){Be&&o(e),$e.d(),oe&&oe.d(),we=!1,ft(he)}}}function dl(s){let e,t,n,l,i,r;e=new Gt({props:{title:"Competition Entries",subtitle:"Manage entries and print labels",icon:"📋",center:!0}});const y=[el,xt],w=[];function B(k,P){return k[9]?0:k[1]?1:-1}return~(n=B(s))&&(l=w[n]=y[n](s)),{c(){qe(e.$$.fragment),t=$(),l&&l.c(),i=Ge()},l(k){Oe(e.$$.fragment,k),t=z(k),l&&l.l(k),i=Ge()},m(k,P){Me(e,k,P),L(k,t,P),~n&&w[n].m(k,P),L(k,i,P),r=!0},p(k,P){let U=n;n=B(k),n===U?~n&&w[n].p(k,P):(l&&(ut(),Pe(w[U],1,1,()=>{w[U]=null}),dt()),~n?(l=w[n],l?l.p(k,P):(l=w[n]=y[n](k),l.c()),Se(l,1),l.m(i.parentNode,i)):l=null)},i(k){r||(Se(e.$$.fragment,k),Se(l),r=!0)},o(k){Pe(e.$$.fragment,k),Pe(l),r=!1},d(k){k&&(o(t),o(i)),Re(e,k),~n&&w[n].d(k)}}}function ul(s){let e,t,n,l=s[7]&&jt(s),i=s[0]&&Dt(s);return{c(){l&&l.c(),e=$(),i&&i.c(),t=Ge()},l(r){l&&l.l(r),e=z(r),i&&i.l(r),t=Ge()},m(r,y){l&&l.m(r,y),L(r,e,y),i&&i.m(r,y),L(r,t,y),n=!0},p(r,y){r[7]?l?l.p(r,y):(l=jt(r),l.c(),l.m(e.parentNode,e)):l&&(l.d(1),l=null),r[0]?i?(i.p(r,y),y[0]&1&&Se(i,1)):(i=Dt(r),i.c(),Se(i,1),i.m(t.parentNode,t)):i&&(ut(),Pe(i,1,1,()=>{i=null}),dt())},i(r){n||(Se(i),n=!0)},o(r){Pe(i),n=!1},d(r){r&&(o(e),o(t)),l&&l.d(r),i&&i.d(r)}}}function xe(s){if(!s||s===null||s===void 0)return"No date";try{const e=String(s).trim();let t=e;if(e.includes(" ")&&!e.includes("T")){if(t=e.replace(" ","T"),t.includes(".")){const[l,i]=t.split("."),r=i.substring(0,3);t=`${l}.${r}`}!t.includes("+")&&!t.includes("Z")&&(t+="Z")}const n=new Date(t);return isNaN(n.getTime())?(console.warn("Invalid date after parsing:",e,"->",t),"Invalid Date"):n.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return console.warn("Error formatting date:",s,e),"Invalid Date"}}const Rt=s=>s.is_paid,Mt=s=>s.is_paid;function _l(s,e,t){let n,l,i;kt(s,Zt,g=>t(21,l=g)),kt(s,Wt,g=>t(22,i=g));let r=!1,y=!1,w=null,B=[],k=[],P=!0,U="",G="entry_number",M="asc",I=new Set,Y=!1;qt(()=>{}),Jt(()=>{});async function O(){t(9,P=!0);try{const{data:g,error:u}=await ct.from("competitions").select("*").eq("id",n).single();if(u)throw u;t(1,w=g);const{data:h,error:p}=await ct.from("competition_entries").select(`
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
        `).eq("competition_id",n).order("entry_number");if(p)throw p;t(8,B=h||[]),q()}catch(g){console.error("Error loading data:",g),alert("Failed to load competition entries"),ot("/officers/manage-competitions")}finally{t(9,P=!1)}}function q(){let g=[...B];if(U.trim()){const u=U.toLowerCase();g=g.filter(h=>{var p,c,E,v,S,V,ee,_e,Q,H,D,se;return((p=h.entry_number)==null?void 0:p.toLowerCase().includes(u))||((c=h.beer_name)==null?void 0:c.toLowerCase().includes(u))||((v=(E=h.members)==null?void 0:E.name)==null?void 0:v.toLowerCase().includes(u))||((V=(S=h.members)==null?void 0:S.email)==null?void 0:V.toLowerCase().includes(u))||((_e=(ee=h.bjcp_category)==null?void 0:ee.category_name)==null?void 0:_e.toLowerCase().includes(u))||`${(Q=h.bjcp_category)==null?void 0:Q.category_number}${(H=h.bjcp_category)==null?void 0:H.subcategory_letter}`.toLowerCase().includes(u)||((D=h.special_ingredients)==null?void 0:D.toLowerCase().includes(u))||((se=h.notes)==null?void 0:se.toLowerCase().includes(u))})}g.sort((u,h)=>{var E,v,S,V,ee,_e;let p,c;switch(G){case"entry_number":p=u.entry_number||"",c=h.entry_number||"";break;case"member_name":p=((E=u.members)==null?void 0:E.name)||"",c=((v=h.members)==null?void 0:v.name)||"";break;case"beer_name":p=u.beer_name||"",c=h.beer_name||"";break;case"category":p=`${((S=u.bjcp_category)==null?void 0:S.category_number)||""}${((V=u.bjcp_category)==null?void 0:V.subcategory_letter)||""}`,c=`${((ee=h.bjcp_category)==null?void 0:ee.category_number)||""}${((_e=h.bjcp_category)==null?void 0:_e.subcategory_letter)||""}`;break;case"paid":p=u.is_paid?1:0,c=h.is_paid?1:0;break;case"submitted_at":const Q=H=>{if(!H)return new Date(0);let D=H;if(H.includes(" ")&&!H.includes("T")){if(D=H.replace(" ","T"),D.includes(".")){const[se,ze]=D.split("."),pe=ze.substring(0,3);D=`${se}.${pe}`}!D.includes("+")&&!D.includes("Z")&&(D+="Z")}return new Date(D)};p=Q(u.submitted_at),c=Q(h.submitted_at);break;default:p=u[G]||"",c=h[G]||""}return M==="asc"?p>c?1:p<c?-1:0:p<c?1:p>c?-1:0}),t(2,k=g)}function X(g){G===g?t(5,M=M==="asc"?"desc":"asc"):(t(4,G=g),t(5,M="asc")),q()}function ne(g){I.has(g)?I.delete(g):I.add(g),t(6,I=new Set(I))}function ke(){Y?I.clear():k.forEach(g=>I.add(g.id)),t(6,I=new Set(I)),t(10,Y=!Y)}async function fe(g,u){try{const{error:h}=await ct.from("competition_entries").update({is_paid:u,payment_date:u?new Date().toISOString():null}).eq("id",g);if(h)throw h;const p=B.findIndex(c=>c.id===g);p!==-1&&(t(8,B[p].is_paid=u,B),t(8,B[p].payment_date=u?new Date().toISOString():null,B),q())}catch(h){console.error("Error updating payment status:",h),alert("Failed to update payment status")}}function te(){const g=I.size>0?k.filter(p=>I.has(p.id)):k;if(g.length===0){alert("No entries selected for printing");return}const u=window.open("","_blank"),h=g.flatMap(p=>{var E,v,S,V;const c=`
      <div class="label">
        <div class="label-header">
          <strong>${(w==null?void 0:w.name)||"Competition"}</strong>
        </div>
        <div class="entry-number">
          Entry #: <span>${p.entry_number}</span>
        </div>
        <div class="beer-style">
          Style: <span>${((E=p.bjcp_category)==null?void 0:E.category_number)||""}${((v=p.bjcp_category)==null?void 0:v.subcategory_letter)||""}</span> - ${((S=p.bjcp_category)==null?void 0:S.category_name)||""}
          ${(V=p.bjcp_category)!=null&&V.subcategory_name?`<br><small>${p.bjcp_category.subcategory_name}</small>`:""}
          ${p.beer_notes?`<br><small>Special: ${p.beer_notes}</small>`:""}
        </div>
        ${p.notes?`
          <div class="notes">
            Notes: ${p.notes}
          </div>
        `:""}
      </div>
    `;return[c,c,c]}).join("");u.document.write(`
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
        ${h}
      </div>
    </body>
    </html>
  `),u.document.close(),u.focus(),setTimeout(()=>{u.print(),u.close()},250)}function x(){ot("/officers/manage-competitions")}function ye(){t(7,r=!1),ot("/officers/manage-competitions")}function le(){const g=I.size>0?k.filter(S=>I.has(S.id)):k;if(g.length===0){alert("No entries to export");return}const p=[["Entry Number","Member Name","Beer Name","Category Number","Category Name","Subcategory Name","Paid","Submitted Date"].join(","),...g.map(S=>{var V,ee,_e,Q,H;return[S.entry_number||"",`"${((V=S.members)==null?void 0:V.name)||""}"`,`"${S.beer_name||""}"`,`${((ee=S.bjcp_category)==null?void 0:ee.category_number)||""}${((_e=S.bjcp_category)==null?void 0:_e.subcategory_letter)||""}`,`"${((Q=S.bjcp_category)==null?void 0:Q.category_name)||""}"`,`"${((H=S.bjcp_category)==null?void 0:H.subcategory_name)||""}"`,S.is_paid?"Yes":"No",xe(S.submitted_at)].join(",")})].join(`
`),c=new Blob([p],{type:"text/csv"}),E=window.URL.createObjectURL(c),v=document.createElement("a");v.href=E,v.download=`${(w==null?void 0:w.name)||"competition"}_entries_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(v),v.click(),document.body.removeChild(v),window.URL.revokeObjectURL(E)}function ie(){const g=I.size>0?k.filter(p=>I.has(p.id)):k;if(g.length===0){alert("No entries to print judging sheets for");return}const u=window.open("","_blank"),h=re(g);u.document.write(h),u.document.close(),u.onload=()=>{u.print(),u.close()}}function re(g){const u=(w==null?void 0:w.name)||"Competition",h=new Date().toLocaleDateString();return`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Judging Sheet - ${u}</title>
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
            <div class="competition-title">${u} - Judging Sheet</div>
            <div>Date: ${h}</div>
          </div>
          
          <div class="judge-info">
            <strong>Judge Name:</strong> <span class="judge-line"></span>
            <strong style="margin-left: 40px;">Signature:</strong> <span class="judge-line"></span>
          </div>
          
          <div class="entries-section">
            ${g.map(p=>{var c,E,v,S;return`
              <div class="entry-item">
                <div class="entry-header">
                  <div class="entry-number">Entry #${p.entry_number}</div>
                  <div class="beer-style">
                    ${((c=p.bjcp_category)==null?void 0:c.category_number)||""}${((E=p.bjcp_category)==null?void 0:E.subcategory_letter)||""} - 
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
    `}function ae(){U=this.value,t(3,U)}const ge=()=>X("entry_number"),de=()=>X("member_name"),ue=()=>X("beer_name"),ve=()=>X("category"),W=()=>X("paid"),J=()=>X("submitted_at"),A=g=>ne(g.id),F=g=>fe(g.id,!g.is_paid),K=g=>ne(g.id),Z=g=>fe(g.id,!g.is_paid);return s.$$.update=()=>{s.$$.dirty[0]&4194304&&i&&(i.role==="competition_director"?(t(0,y=!0),t(7,r=!1)):(t(0,y=!1),t(7,r=!0))),s.$$.dirty[0]&2097152&&t(20,n=l.params.id),s.$$.dirty[0]&1048579&&y&&n&&!w&&O(),s.$$.dirty[0]&56&&q(),s.$$.dirty[0]&68&&t(10,Y=I.size===k.length&&k.length>0)},[y,w,k,U,G,M,I,r,B,P,Y,X,ne,ke,fe,te,x,ye,le,ie,n,l,i,ae,ge,de,ue,ve,W,J,A,F,K,Z]}class Cl extends Ft{constructor(e){super(),Yt(this,e,_l,ul,Ot,{},null,[-1,-1])}}export{Cl as component};
