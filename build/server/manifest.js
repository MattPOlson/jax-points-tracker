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
		client: {start:"_app/immutable/entry/start.CpkYQOt4.js",app:"_app/immutable/entry/app.BY1FOsJC.js",imports:["_app/immutable/entry/start.CpkYQOt4.js","_app/immutable/chunks/Dye7roNo.js","_app/immutable/chunks/hctCtYiR.js","_app/immutable/chunks/CqQ9cAWI.js","_app/immutable/entry/app.BY1FOsJC.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/hctCtYiR.js","_app/immutable/chunks/Cq-BpkVh.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CIxqjMFb.js')),
			__memo(() => import('./chunks/1-B9TBvp8H.js')),
			__memo(() => import('./chunks/2-B_PbEXL2.js')),
			__memo(() => import('./chunks/3-D6XVv1O7.js')),
			__memo(() => import('./chunks/4-Dad4fqrB.js')),
			__memo(() => import('./chunks/5-atSnVVJn.js')),
			__memo(() => import('./chunks/6-CV-O2rQy.js')),
			__memo(() => import('./chunks/7-7fxL2M4f.js')),
			__memo(() => import('./chunks/8-BU7CeHXp.js')),
			__memo(() => import('./chunks/9-k6CdhR-M.js')),
			__memo(() => import('./chunks/10-Cfn6AcVk.js')),
			__memo(() => import('./chunks/11-DKfz7tLx.js')),
			__memo(() => import('./chunks/12-CkK4xqEm.js')),
			__memo(() => import('./chunks/13-B_mRV40f.js')),
			__memo(() => import('./chunks/14-DlHi9uwD.js')),
			__memo(() => import('./chunks/15-CGtJ4qwM.js')),
			__memo(() => import('./chunks/16-Drv9V9LU.js')),
			__memo(() => import('./chunks/17-CDrXCmEh.js')),
			__memo(() => import('./chunks/18-CPyFHZBU.js')),
			__memo(() => import('./chunks/19-CbUwRZHG.js')),
			__memo(() => import('./chunks/20-DqDzxk-n.js')),
			__memo(() => import('./chunks/21-w8RfFah4.js')),
			__memo(() => import('./chunks/22-wEDaLJYG.js')),
			__memo(() => import('./chunks/23-soB_-26e.js')),
			__memo(() => import('./chunks/24-BJ3inmiB.js')),
			__memo(() => import('./chunks/25-BAhKb8hB.js')),
			__memo(() => import('./chunks/26-BDRje70U.js')),
			__memo(() => import('./chunks/27-CC1hxrtv.js')),
			__memo(() => import('./chunks/28-RwRYCd8q.js'))
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
				id: "/competitions/my-entries/scoresheet/[entryId]",
				pattern: /^\/competitions\/my-entries\/scoresheet\/([^/]+?)\/?$/,
				params: [{"name":"entryId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/competitions/results",
				pattern: /^\/competitions\/results\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/competitions/submit-entry",
				pattern: /^\/competitions\/submit-entry\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/judge",
				pattern: /^\/judge\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/judge/competition/[id]",
				pattern: /^\/judge\/competition\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/judge/competition/[id]/rankings",
				pattern: /^\/judge\/competition\/([^/]+?)\/rankings\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/judge/competition/[id]/scoresheet",
				pattern: /^\/judge\/competition\/([^/]+?)\/scoresheet\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/leaderboard",
				pattern: /^\/leaderboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/my-submissions",
				pattern: /^\/my-submissions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/officers",
				pattern: /^\/officers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/officers/approvals",
				pattern: /^\/officers\/approvals\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions",
				pattern: /^\/officers\/manage-competitions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/create",
				pattern: /^\/officers\/manage-competitions\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/edit/[id]",
				pattern: /^\/officers\/manage-competitions\/edit\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/entries/[id]",
				pattern: /^\/officers\/manage-competitions\/entries\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/judges/[id]",
				pattern: /^\/officers\/manage-competitions\/judges\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/judging-dashboard/[id]",
				pattern: /^\/officers\/manage-competitions\/judging-dashboard\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/officers/manage-competitions/results/[id]",
				pattern: /^\/officers\/manage-competitions\/results\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/officers/members",
				pattern: /^\/officers\/members\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/officers/reports",
				pattern: /^\/officers\/reports\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/officers/view-all",
				pattern: /^\/officers\/view-all\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/submit",
				pattern: /^\/submit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
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
