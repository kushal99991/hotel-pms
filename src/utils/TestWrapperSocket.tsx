import { SocketProvider } from "contexts/SocketContext";
import { ReactNode } from "react";

jest.mock("contexts/SocketContext", () => ({
  ...jest.requireActual("contexts/SocketContext"),
  useSocket: jest.fn(),
}));

export const TestWrapperSocket: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  if (SocketProvider) {
    return <SocketProvider>{children}</SocketProvider>;
  }
  return <>{children}</>;
};

export default TestWrapperSocket;
