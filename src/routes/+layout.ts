// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  return {
    user: data.user
  };
};