// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {

	namespace App {
			  interface Window {
				particlesJS;
				}
		// interface Error {}
		  interface Locals {
			  user: {
				id: string
				username: string
				role: string
				email: string
				status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
				assignedOrganizations: {
					organizationId: string;
					name: string;
					salesStage: string;
					}[];
				} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
