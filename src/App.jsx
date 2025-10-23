import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { publicRoutes, privateRoutes } from './routes/routes.jsx';
import { LoadingSpinner } from './components/atoms/LoadingSpinner/LoadingSpinner';

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Private Routes */}
          {privateRoutes.map(({ path, element, children }) => (
            <Route key={path} path={path} element={element}>
              {children?.map(({ path: childPath, element: childElement }) => (
                <Route key={childPath} path={childPath} element={childElement} />
              ))}
            </Route>
          ))}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
