import { appConfig } from "config/app.config";
import useAuth from "hooks/useAuth";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { isLoggedIn, users } = useAuth();

  useEffect(() => {
    const socketConnection = io(appConfig.socketUrl, {
      withCredentials: true,
    });
    setSocket(socketConnection);

    socketConnection.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected: ", socketConnection.id);
    });

    socketConnection.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnect: ");
    });

    return () => {
      socketConnection.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && socket && isConnected && users?.id) {
      const domain = appConfig.getCookie(appConfig.domainName);
      const token = appConfig.getCookie(appConfig.tokenName);
      if (domain) {
        const roomName = `${domain}-org-${users?.id}-property-${users?.defaultPropertyId}`;
        joinRoom(roomName, token);
      }
    }
  }, [isLoggedIn, socket, users, isConnected]);

  const connectSocket = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  const disconnectSocket = () => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  };

  const joinRoom = (room: string, token: string) => {
    if (socket && isConnected) {
      socket.emit("join-room", { room, token });
      console.log(`Joining room: ${room}`);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, connectSocket, disconnectSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

export const useSocket = (): SocketContextProps => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
