import axios from "axios";
import Cookies from "js-cookie";
import { appConfig } from "config/app.config";

export type FrontendErrorType =
  | "API_ERROR"
  | "COMPONENT_ERROR"
  | "CONSOLE_ERROR"
  | "CONSOLE_WARNING";

export interface LogContext {
  url?: string;
  method?: string;
  status?: number;
  component?: string;
  action?: string;
  [key: string]: any;
}
export interface UserPayload {
  sub: string; // user ID
  user_name: string;
  tenant: string;
  role: string;
}

/**
 * Decode JWT payload from cookie
 */
export const getUserFromJwt = (
  cookieName: string = "auth_token"
): UserPayload | null => {
  try {
    const token = Cookies.get(cookieName);
    if (!token) return null;

    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    // Base64 decode with URL safe chars
    const decoded = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (err) {
    console.warn("Failed to decode JWT", err);
    return null;
  }
};

/**
 * Logs frontend errors to backend
 * Differentiates between API and component errors
 */
export const logFrontendError = async (
  message: string,
  context: LogContext = {},
  type: FrontendErrorType = "COMPONENT_ERROR"
): Promise<void> => {
  try {
    const user = getUserFromJwt(appConfig.tokenName);
    // Build context based on type
    const logContext = {
      url: type === "API_ERROR" ? context.url : undefined,
      method: type === "API_ERROR" ? context.method : undefined,
      status: type === "API_ERROR" ? context.status : undefined,
      component: type === "COMPONENT_ERROR" ? context.component : undefined,
      action: type === "COMPONENT_ERROR" ? context.action : undefined,
      environment: process.env.NODE_ENV || "development",
      userAgent: navigator.userAgent,
      userId: user?.sub || null,
      tenant: user?.tenant || null,
      additional: context.additional || {},
      type,
    };

    const payload = {
      id: `LC-${Date.now()}`,
      message,
      context: logContext,
      timestamp: new Date().toISOString(),
    };
    const token = Cookies.get(appConfig.tokenName);
    await axios.post(
      `${appConfig.serviceNotifyApiUrl}/msg/front-end/error`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
  } catch (err) {
    console.warn("[FrontendErrorLogger] Failed to send error log:", err);
  }
};

export function setupConsoleInterceptors() {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  /**
   * Common handler for both error and warn logs
   */
  async function handleConsoleMessage(
    type: "error" | "warn",
    args: any[]
  ): Promise<void> {
    const [message, ...rest] = args;

    // Always log to the console (preserve default behavior)
    if (type === "error") {
      originalConsoleError.apply(console, args);
    } else {
      originalConsoleWarn.apply(console, args);
    }

    // Filter out irrelevant logs (optional)
    if (typeof message !== "string") return;

    // Example: Handle specific React warnings like duplicate keys
    const isReactDuplicateKeyWarning = message.includes(
      "Encountered two children with the same key"
    );

    // You can add other warning/error pattern checks here
    if (isReactDuplicateKeyWarning || type === "error") {
      const componentStack =
        rest.find((arg) => typeof arg === "string" && arg.includes("at ")) ||
        "Unknown Component";

      try {
        await logFrontendError(
          message,
          {
            url: window.location.href,
            method: "RENDER",
            params: null,
            data: null,
            additional: {
              consoleType: type,
              componentStack,
            },
          },
          type === "error" ? "CONSOLE_ERROR" : "CONSOLE_WARNING"
        );
      } catch (apiErr) {
        // Fail silently but log locally
        originalConsoleError("[ConsoleInterceptor] Logging failed:", apiErr);
      }
    }
  }

  // Override console methods
  console.error = (...args: any[]) => {
    void handleConsoleMessage("error", args);
  };

  console.warn = (...args: any[]) => {
    void handleConsoleMessage("warn", args);
  };
}
