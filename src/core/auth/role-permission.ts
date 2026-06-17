import type { UserRole } from "../../types/auth.types";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Administrador: [
    "dashboard:view",

    "catalog:view",
    "catalog:create",
    "catalog:edit",
    "catalog:delete",

    "sales:view",
    "sales:create",

    "patients:view",
    "patients:create",
    "patients:edit",
    "patients:delete",

    "recipes:view",
    "recipes:create",
    "recipes:download",

    "sellers:view",
    "sellers:create",
    "sellers:edit",
    "sellers:delete",
  ],

  Vendedor: [
    "dashboard:view",

    "catalog:view",

    "sales:view",
    "sales:create",
  ],

  Veterinario: [
    "dashboard:view",

    "catalog:view",

    "sales:view",
    "sales:create",

    "patients:view",
    "patients:create",
    "patients:edit",

    "recipes:view",
    "recipes:create",
    "recipes:download",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
