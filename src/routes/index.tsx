import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import Dashboard from '@/pages/Dashboard';
import Income from '@/pages/Income';
import Expenses from '@/pages/Expenses';
import Transactions from '@/pages/Transactions';
import NetWorth from '@/pages/NetWorth';
import ImportCenter from '@/pages/ImportCenter';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'income',
        element: <Income />,
      },
      {
        path: 'expenses',
        element: <Expenses />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'net-worth',
        element: <NetWorth />,
      },
      {
        path: 'import',
        element: <ImportCenter />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'help',
        element: <Help />,
      },
    ],
  },
]);
