import { createBrowserRouter } from 'react-router-dom';
import DrawingTest from './pages/CanvasPage';
import GameLayout from '@/layouts/GameLayout';
import RootLayout from '@/layouts/RootLayout';
import GameRoomPage from '@/pages/GameRoomPage';
import LobbyPage from '@/pages/LobbyPage';
import MainPage from '@/pages/MainPage';
import ResultPage from '@/pages/ResultPage';

export const router = createBrowserRouter(
  [
    {
      path: '/drawing-test',
      element: <DrawingTest />,
    },
    {
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <MainPage />,
        },
        {
          element: <GameLayout />,
          children: [
            {
              path: '/lobby/:roomId',
              element: <LobbyPage />,
            },
            {
              path: '/game/:roomId',
              element: <GameRoomPage />,
            },
            {
              path: '/game/:roomId/result',
              element: <ResultPage />,
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);
