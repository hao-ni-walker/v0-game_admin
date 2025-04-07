'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';

export default function Providers({
  session,
  children
}: {
  session: any;
  children: React.ReactNode;
}) {
  return (
    <>
      <div>
        <SessionProvider session={session}>{children}</SessionProvider>
      </div>
    </>
  );
}
