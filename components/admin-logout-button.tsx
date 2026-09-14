'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="btn-quiet">
      <LogOut size={15} strokeWidth={1.5} />
      Выйти
    </button>
  );
}
