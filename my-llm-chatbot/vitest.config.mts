import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

// Le binding Workers AI de wrangler.jsonc n'existe qu'à distance : le charger ici
// forcerait `vitest` à ouvrir une session Cloudflare authentifiée. Les tests ciblent
// les routes qui n'en dépendent pas, on déclare donc l'environnement à la main.
export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				miniflare: {
					compatibilityDate: "2026-03-10",
					compatibilityFlags: ["nodejs_compat"],
				},
			},
		},
	},
});
