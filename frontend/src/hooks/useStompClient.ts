import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";


export function useStompClient(){

    const stompClientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    
    
    useEffect(()=>{
        const token = localStorage.getItem("token"); 
        
        const client = new Client({
            webSocketFactory: () => new SockJS(`http://${window.location.hostname}:8080/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}` 
            },

            debug: (str) => console.log("[STOMP Debug]:", str),

            reconnectDelay: 5000,

            onConnect: () => {
            console.log("Connected to WebSocket broker!");
            setIsConnected(true);
            },

            onDisconnect: () => {
            setIsConnected(false);
            },

            onStompError: (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            },
        })
        stompClientRef.current = client;
        

        client.activate();

        return ()=>{
            client.deactivate();
        };

    },[]);

    return {
        client: stompClientRef.current,
        isConnected
    };
}