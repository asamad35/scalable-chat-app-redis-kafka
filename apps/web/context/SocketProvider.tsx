"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}
interface ISocketContextProps {
  sendMessage: (message: string) => void;
  messages: string[];
}
const socketContext = React.createContext<ISocketContextProps | null>(null);

export const useSocket = () => {
  const state = React.useContext(socketContext);
  if (!state) {
    throw new Error("State is undefined");
  }
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage: ISocketContextProps["sendMessage"] = useCallback(
    (message) => {
      console.log("send message", message);
      if (socket) socket.emit("event:message", { message });
    },
    [socket]
  );

  const onMessageRecieved = useCallback((mssg: string) => {
    console.log("recieved mssg", mssg);
    const { message } = JSON.parse(mssg) as { message: string };
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageRecieved);
    setSocket(_socket);
    return () => {
      _socket.disconnect();
      setSocket(undefined);
      _socket.off("message", onMessageRecieved);
    };
  }, []);

  return (
    <socketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </socketContext.Provider>
  );
};
