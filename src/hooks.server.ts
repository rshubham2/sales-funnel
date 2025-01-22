// hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { db } from '$lib/database'

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session')

  // Protect admin routes
  if (event.url.pathname.startsWith('/admin')) {
    if (!session) {
      return new Response('Redirect', { status: 303, headers: { Location: '/login' }})
    }
    
    const user = await db.user.findUnique({
      where: { userAuthToken: session },
      select: { username: true, role: true },
    })

    if (!user || user.role.name !== 'ADMIN') {
      return new Response('Redirect', { status: 303, headers: { Location: '/' }})
    }
  }

  if (session) {
    const user = await db.user.findUnique({
      where: { userAuthToken: session },
      select: { username: true, role: true },
    })

    if (user) {
      event.locals.user = {
        username: user.username,
        role: user.role.name,
      }
    }
  }

  return await resolve(event)
}