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
        <div className="">
          <Outlet />
        </div>
      </main>
       <div className="border-t border-[#092e4650] bg-white text-[#092e46] px-4 py-2 flex items-center justify-center">
        
        <p className="text-sm text-[#092e46] mb-0">
         Copyright © {new Date().getFullYear()} . All Rights Reserved.
         
         Rapid Collaborate
       
        </p>

      </div> 
    </div>
  );
}
