import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PrismaClient } from '@prisma/client';
import { redirect } from '@sveltejs/kit'

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id;

  // redirect user if not logged in
      if (!locals.user) {
        throw redirect(302, new URL('/login', 'http://localhost:5173').toString());
    }
    
      if (!locals.user) {
        throw redirect(302, new URL('/login', 'https://vc-tech.vercel.app/').toString());
    }

  if (!userId) {
    throw error(401, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw error(404, 'User not found');
  }

  return { user };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
    const userId = locals.user?.id;

    if (!userId) {
      throw error(401, 'Unauthorized');
    }

    const data = await request.formData();
    const profilePhoto = data.get('profilePhoto') as File | null;

    try {
      let image: string | undefined = undefined;

      if (profilePhoto && profilePhoto.size > 0) {
        // Validate file size and type
        if (profilePhoto.size > 5 * 1024 * 1024) { // 5MB limit
          return { success: false, error: 'Profile photo must be less than 5MB' };
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(profilePhoto.type)) {
          return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.' };
        }

        const arrayBuffer = await profilePhoto.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        image =` data:${profilePhoto.type};base64,${base64Image}`;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          image: image,
        },
        include: { role: true },
      });

      return { success: true, user: updatedUser };
    } catch (e) {
      console.error('Error updating user:', e);
      return { success: false, error: 'Failed to update profile' };
    }
  },
};