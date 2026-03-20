import { Outlet } from "react-router";
import { Sidebar } from "./components/Sidebar";

export function Layout() {
  return (
    <div className="flex h-screen w-full bg-[#f4f4f5] overflow-hidden text-slate-900 font-sans">
      <div className="flex w-full h-full max-w-full shadow-2xl mx-auto bg-white border-x border-slate-200/50 relative">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
}
