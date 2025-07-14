// This is a Next.js React page (not API route)
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LinkTelegramPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Linking…');

  useEffect(() => {
    const telegramId = searchParams.get('telegramId');
    if (!telegramId) {
      setStatus('Missing telegramId.');
      return;
    }

    // Call your backend to link
    fetch(`/api/link-telegram?telegramId=${telegramId}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) setStatus(data.message);
        else setStatus('Something went wrong');
      })
      .catch(() => setStatus('Error linking'));
  }, [searchParams]);

  return (
    <main className="p-8 text-center">
      <h1 className="text-xl font-bold">{status}</h1>
    </main>
  );
}
