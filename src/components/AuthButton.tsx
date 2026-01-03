'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useMandaratStore } from '@/store/mandarat';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setUserId, migrateLocalToSupabase, loadFromSupabase } = useMandaratStore();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' && currentUser) {
        setUserId(currentUser.id);
        await migrateLocalToSupabase();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId, migrateLocalToSupabase, loadFromSupabase]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="w-9 h-9 sm:w-20 sm:h-9 bg-slate-100 rounded-lg animate-pulse" />
    );
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="
          inline-flex items-center justify-center
          w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2
          text-sm font-medium
          text-slate-600 bg-slate-100
          rounded-lg hover:bg-slate-200
          transition-colors
        "
        title="로그아웃"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span className="hidden sm:inline sm:ml-1.5">로그아웃</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push('/login')}
      className="
        inline-flex items-center justify-center
        w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2
        text-sm font-medium
        text-white bg-gradient-to-r from-emerald-500 to-teal-500
        rounded-lg hover:from-emerald-600 hover:to-teal-600
        shadow-md shadow-emerald-200
        transition-all
      "
      title="로그인"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
      <span className="hidden sm:inline sm:ml-1.5">로그인</span>
    </button>
  );
}
