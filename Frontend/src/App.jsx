import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/auth/login/loginPage";
import SignUp from "./pages/auth/signup/signup";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/notification";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/lodingSpinner";
function App() {
const {data: authUser, isLoading, error, isError} = useQuery({
  queryKey: ['authUser'],
  queryFn: async () => {
    try {
    const res = await fetch("/api/auth/me");
    
    const data = await res.json();
    if(data.error) return null;
    
    if(!res.ok)  throw new Error(data.error || "Something went wrong");
    console.log(`authinticated user`, data);

    return data;
  } catch (error) {
    console.error("Error fetching authinticated user:", error);
    throw new Error(error.message || "Something went wrong")
  }
  },
  retry: false,


})

if (isLoading) {
  return (
    <div className = "h-screen flex justify-center items-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
   




  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route path="/" element={authUser? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />

    </div>
  );
}

export default App;
