const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.cDQkvR4B.js",app:"_app/immutable/entry/app.DCnRwiLD.js",imports:["_app/immutable/entry/start.cDQkvR4B.js","_app/immutable/chunks/5KGppEzW.js","_app/immutable/chunks/DOvoZ9Ia.js","_app/immutable/chunks/NYkyKxQq.js","_app/immutable/entry/app.DCnRwiLD.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/DOvoZ9Ia.js","_app/immutable/chunks/DZMW2zPD.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-fyDpIQ4b.js')),
			__memo(() => import('./chunks/1-CMz_kUdH.js')),
			__memo(() => import('./chunks/2-DLa7yqLg.js')),
			__memo(() => import('./chunks/3-CP6gMETz.js')),
			__memo(() => import('./chunks/4-BSa2v6Qg.js')),
			__memo(() => import('./chunks/5-_43QQCiT.js')),
			__memo(() => import('./chunks/6-BeL0aurn.js')),
			__memo(() => import('./chunks/7-CotWPEqB.js')),
			__memo(() => import('./chunks/8-CwlauDK_.js')),
			__memo(() => import('./chunks/9-Gm8P4Qge.js')),
			__memo(() => import('./chunks/10-BPQ-ip_Z.js')),
			__memo(() => import('./chunks/11-C9DeF6-v.js')),
			__memo(() => import('./chunks/12-BycFPKqz.js')),
			__memo(() => import('./chunks/13-B-d1uXjj.js')),
			__memo(() => import('./chunks/14-DD-n_LYM.js')),
			__memo(() => import('./chunks/15-XhKBjbge.js')),
			__memo(() => import('./chunks/16-B90P1MG9.js')),
			__memo(() => import('./chunks/17-DE9D_MKi.js')),
			__memo(() => import('./chunks/18-CkGjy_gB.js')),
			__memo(() => import('./chunks/19-D5YW2JlW.js')),
			__memo(() => import('./chunks/20-mKlXT1Iq.js')),
			__memo(() => import('./chunks/21-BSzQhjqO.js')),
			__memo(() => import('./chunks/22-BrkjnrqF.js')),
			__memo(() => import('./chunks/23-Blx71-7Z.js')),
			__memo(() => import('./chunks/24-vlXauT6j.js')),
			__memo(() => import('./chunks/25-BUVLq0ao.js')),
			__memo(() => import('./chunks/26-WJDo9og-.js')),
			__memo(() => import('./chunks/27-ClzrIK45.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/competitions",
				pattern: /^\/competitions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/competitions/my-entries",
				pattern: /^\/competitions\/my-entries\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/competitions/results",
				pattern: /^\/competitions\/results\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/competitions/submit-entry",
				pattern: /^\/competitions\/submit-entry\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/judge",
				pattern: /^\/judge\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/judge/competition/[id]",
				pattern: /^\/judge\/competition\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/judge/competition/[id]/rankings",
				pattern: /^\/judge\/competition\/([^/]+?)\/rankings\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/judge/competition/[id]/scoresheet",
				pattern: /^\/judge\/competition\/([^/]+?)\/scoresheet\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/leaderboard",
				pattern: /^\/leaderboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/my-submissions",
				pattern: /^\/my-submissions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/officers",
				pattern: /^\/officers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/officers/approvals",
				pattern: /^\/officers\/approvals\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions",
				pattern: /^\/officers\/manage-competitions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/create",
				pattern: /^\/officers\/manage-competitions\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/edit/[id]",
				pattern: /^\/officers\/manage-competitions\/edit\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/entries/[id]",
				pattern: /^\/officers\/manage-competitions\/entries\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/judges/[id]",
				pattern: /^\/officers\/manage-competitions\/judges\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/judging-dashboard/[id]",
				pattern: /^\/officers\/manage-competitions\/judging-dashboard\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/results/[id]",
				pattern: /^\/officers\/manage-competitions\/results\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/officers/members",
				pattern: /^\/officers\/members\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/officers/reports",
				pattern: /^\/officers\/reports\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/officers/view-all",
				pattern: /^\/officers\/view-all\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/submit",
				pattern: /^\/submit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
