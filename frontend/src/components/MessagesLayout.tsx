import { Outlet} from "react-router-dom";
import { MessagesSidebar } from "./MessagesSidebar"; 

export function MessageLayout(){
    return(
        <div className="flex h-full min-w-0 overflow-hidden bg-paper">
            <MessagesSidebar />
            <main className="flex h-full min-w-0 flex-1 flex-col">
                <Outlet />  
            </main>
        </div>
    );
}