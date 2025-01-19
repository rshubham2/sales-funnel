// register/+page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import bcrypt from 'bcrypt'
import { db } from '$lib/database'
import type { Action, Actions, PageServerLoad } from './$types'

enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const load: PageServerLoad = async ({ locals }) => {
  // redirect user if logged in
  if (locals.user) {
    redirect(302, '/')
  }
}

const register: Action = async ({ request }) => {
  const data = await request.formData()
  const username = data.get('username')
  const email = data.get('email')
  const password = data.get('password')
  const confirmPassword = data.get('confirmPassword')

  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string' ||
    !username ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    return fail(400, { invalid: true })
  }

  if (password !== confirmPassword) {
    return fail(400, { passwordMismatch: true })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return fail(400, { invalidEmail: true })
  }

  const user = await db.user.findFirst({ 
    where: { 
      OR: [
        { username },
        { email }
      ]
    } 
  })

  if (user) {
    return fail(400, { 
      user: true,
      message: user.email === email ? 'Email already exists' : 'Username already exists'
    })
  }

  await db.user.create({
    data: {
      username,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      userAuthToken: crypto.randomUUID(),
      role: { connect: { name: Roles.USER } }
    },
  })

  throw redirect(303, '/login')
}
 


export const actions: Actions = { register }