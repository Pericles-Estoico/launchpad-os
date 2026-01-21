const useRemoteDb = import.meta.env.VITE_USE_REMOTE_DB === 'true';
const forceLocalDb = import.meta.env.VITE_USE_LOCAL_DB === 'true';
const localOverride =
  typeof window !== 'undefined' &&
  (localStorage.getItem('lp_force_local') === 'true' ||
    new URLSearchParams(window.location.search).get('local') === '1');

export const isLocalMode =
  localOverride ||
  forceLocalDb ||
  (!useRemoteDb &&
    (import.meta.env.VITE_USE_LOCAL_DB !== 'false' ||
      !import.meta.env.VITE_SUPABASE_URL ||
      !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY));

export const LOCAL_STORAGE_KEYS = {
  profile: 'lp_local_profile',
  workspaceId: 'lp_local_workspace_id',
} as const;

export type LocalProfile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};

export const getLocalProfile = (): LocalProfile | null => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.profile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
};

export const setLocalProfile = (profile: LocalProfile) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(profile));
};

export const getLocalWorkspaceId = (): string | null =>
  localStorage.getItem(LOCAL_STORAGE_KEYS.workspaceId);

export const setLocalWorkspaceId = (workspaceId: string) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.workspaceId, workspaceId);
};

export const clearLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.profile);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.workspaceId);
};
