// src/routes/(auth)/register/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { db } from '$lib/database';
import type { Action, Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect user if already logged in
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
};

const register: Action = async ({ request }) => {
  const data = await request.formData();
  const username = data.get('username');
  const email = data.get('email');
  const password = data.get('password');

  // Validate input
  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !username ||
    !email ||
    !password
  ) {
    return fail(400, { 
      message: 'Invalid input. Please provide username, email, and password.' 
    });
  }
  
  try {
    // Check if user already exists by username or email
    const existingUser = await db.user.findFirst({ 
      where: { 
        OR: [
          { username },
          { email }
        ]
      } 
    });

    if (existingUser) {
      return fail(400, { 
        user: true,
        message: 'Username or email already exists. Please choose another.' 
      });
    }

    // Find or create default USER role
    let userRole = await db.roles.findFirst({
      where: { name: 'USER' }
    });

    // If no USER role exists, create it
    if (!userRole) {
      userRole = await db.roles.create({
        data: { 
          name: 'USER',
          id: 2 // Explicitly set the ID as it's an Int type
        }
      });
    }

    // Create new user
    await db.user.create({
      data: {
        username,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        userAuthToken: crypto.randomUUID(),
        roleId: userRole.id,
        status: 'ACTIVE'
      }
    });

    // Redirect to login page
    return {
      status: 200,
      message: 'Registration successful. Please log in.',
      redirect: '/login'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return fail(500, { 
     message: error instanceof Error 
        ? `Registration failed: ${error.message}` 
        : 'An unexpected error occurred during registration.'
    });
  }
};

export const actions: Actions = { register };