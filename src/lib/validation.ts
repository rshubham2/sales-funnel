// src/lib/validation.ts
export function validateUser(data: any): boolean {
  return !!(
    data &&
    typeof data.username === 'string' &&
    typeof data.email === 'string' &&
    typeof data.roleId === 'number'
  );
}

export function validateRole(data: any): boolean {
  return !!(
    data &&
    typeof data.id === 'number' &&
    typeof data.name === 'string'
  );
}