// src/App.jsx
import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { publicRoutes, privateRoutes } from "./routes/routes.jsx";
import { LoadingSpinner } from "./components/atoms/LoadingSpinner/LoadingSpinner";
import { ToastContainer } from "react-toastify"; // <-- IMPORT TOAST

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
                <Route
                  key={childPath}
                  path={childPath}
                  element={childElement}
                />
              ))}
            </Route>
          ))}
        </Routes>
      </Suspense>
      {/* ADD TOAST CONTAINER */}
      <ToastContainer
        position="top-right"
        autoClose={2000} // Close after 2 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}
