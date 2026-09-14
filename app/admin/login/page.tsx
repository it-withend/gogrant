'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? 'Не удалось войти');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Сеть недоступна, попробуй ещё раз');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2.5">
        <Lock size={18} strokeWidth={1.5} />
        <p className="label">Приватная аналитика</p>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Вход в /admin</h1>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="password" className="label">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-2 border-ink bg-paper px-4 py-2.5 text-sm outline-none focus-visible:outline-2"
          />
        </div>

        {error && <p className="text-sm text-seal">{error}</p>}

        <button type="submit" disabled={loading || !password} className="btn w-full justify-center disabled:opacity-40">
          {loading ? 'Проверяю…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
