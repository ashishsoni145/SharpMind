'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0F0F0F',
      color: '#FAFAFA',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
        Redirecting to SharpMind workspace...
      </h1>
      <p style={{ color: '#A2A2A2', fontSize: '14px', marginBottom: '16px' }}>
        If you are not redirected automatically within a few seconds:
      </p>
      <Link
        href="/app"
        style={{
          color: '#ffffff',
          backgroundColor: '#6F6F6F',
          padding: '10px 20px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        Click here to open SharpMind
      </Link>
    </div>
  );
}
