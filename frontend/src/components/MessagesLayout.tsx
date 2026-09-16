import { Outlet} from "react-router-dom";
import { MessagesSidebar } from "./MessagesSidebar"; 

export function MessageLayout(){
    return(
        <div className="flex h-screen bg-white">
            <MessagesSidebar />
            <main className="flex-1 flex flex-col h-full">
                <Outlet />  
            </main>
        </div>
    );
}