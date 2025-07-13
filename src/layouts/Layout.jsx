import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";


export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col w-full">
      <Header />
      <main
        className="flex-grow w-full overflow-y-auto"
        id="scroll-container"
      >
        <div className="container">
          <Outlet />
        </div>
      </main>
       <div className="border-t border-[#092e4650] bg-white text-[#092e46] px-4 py-3 flex items-center justify-center">
        
        <p className="text-sm text-[#092e46]">
          © {new Date().getFullYear()} Dummy. All Rights Reserved.
        </p>

      </div> 
    </div>
  );
}
