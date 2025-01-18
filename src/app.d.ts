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
				username: string
				role: string
			}
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
