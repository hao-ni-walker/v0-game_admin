'use client';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { KBarComponent } from './kbar-provider';

export default function Providers({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <KBarComponent>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </KBarComponent>
  );
}
