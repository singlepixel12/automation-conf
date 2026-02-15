import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { AutomationsPage } from '@/pages/AutomationsPage';
import { ConfigDetailPage } from '@/pages/ConfigDetailPage';
import { SchedulingPage } from '@/pages/SchedulingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'automations', element: <AutomationsPage /> },
      { path: 'automations/:id', element: <ConfigDetailPage /> },
      { path: 'scheduling', element: <SchedulingPage /> },
    ],
  },
]);
