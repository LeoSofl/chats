'use client';

import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/apollo';
import { ReactNode } from 'react';

export const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </QueryClientProvider>
  );
} 