import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Water from "./pages/Water";
import WorkoutHistory from "./pages/WorkoutHistory";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutBuilder from "./pages/WorkoutBuilder";
import ShoppingList from "./pages/ShoppingList";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Chatbot from "./pages/Chatbot";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen transition-smooth">
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <>
                    <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/water" element={<Water />} />
                      <Route path="/workout-history" element={<WorkoutHistory />} />
                      <Route path="/exercises" element={<ExerciseLibrary />} />
                      <Route path="/workout-builder" element={<WorkoutBuilder />} />
                      <Route path="/shopping-list" element={<ShoppingList />} />
                      <Route path="/workout" element={<Workout />} />
                      <Route path="/diet" element={<Diet />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
