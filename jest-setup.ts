import "@testing-library/jest-dom";
import { expect, jest } from "@jest/globals";
import React from "react";
import { appConfig } from "config/app.config";

// Mock axios to prevent actual HTTP requests during tests

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

// be sure to keep up to date with src/config/app.config.ts
jest.mock("config/app.config", () => ({
  appConfig: {
    baseUrl: "base/url",
    mediaAPI: "media/api/url",
    mediaAPIKey: "media-api-key",
    mediaPath: "media/path",
    paymentsAPI: "payments/api/path",
    paymentsAPIKey: "payments-api-key",
    stripeKey: "stripe-key",
    appName: "PMS",
    pmsDir: "booking-engine",
    posDir: "pos",
    mapBoxToken: "mapbox-key",
    tokenName: "auth",
    dateApiTimeOfDayFormat: "HH:mm:ss",
    dateApiFormat: "YYYY-MM-DD",
    dateTimeApiFormat: "YYYY-MM-DDTHH:mm:ss",
    dateTimeWithTZFormat: "YYYY-MM-DDTHH:mm:ssZ",
    dateTimeOfDayFormat: "h:mm A",
    datePickerDateFormat: "MM/dd/yyyy",
    displayDateFormat: "MM/DD/YYYY",
    displayDateWithTimeFormat: "MM/DD/YYYY HH:mm",
    dateDayMonth: "ddd, MMM D",
    domainName: "domain",
    version: "local",
    socketUrl: "socket/url",
    s3ReportBucketName: "report-bucket-name",
    serviceSocketApiUrl: "socket/api/url",
    serviceNotifyApiUrl: "service/notify/api/url",

    setLocal: (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    getLocal: (key: string) => localStorage.getItem(key),

    setCookie: (key: string, value: string) => {
      return `set value for key: ${key} to ${value}`;
    },
    getCookie: (key: string) => key,

    getTenantFromUrl: () => "",

    getMediaKey: (oid, pk, suffix = "") => {
      let key = `${appConfig.getCookie("domain")}/media/${oid}/`;
      if (pk) key += `${pk}/`;
      return `${key}${suffix}`;
    },
  },
}));

jest.mock("axios", () => {
  const actualAxios = jest.requireActual("axios");
  return {
    __esModule: true,
    default: {
      ...(actualAxios as any),
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});

jest.mock("contexts/CommandPaletteContext", () => ({
  CommandPaletteProvider: ({ children }: { children: React.ReactNode }) => children,
  useCommandPalette: jest.fn(() => ({
    isOpen: false,
    openPalette: jest.fn(),
    closePalette: jest.fn(),
  })),
}));

jest.mock("react-dnd", () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => children,
  useDrag: () => [{ isDragging: false }, jest.fn()],
  useDrop: () => [{ isOver: false, canDrop: false }, jest.fn()],
}));

jest.mock("react-dnd-html5-backend", () => ({
  HTML5Backend: jest.fn(),
}));
jest.mock("react-input-mask", () => {
  const React = require("react");
  return ({ children, ...props }: T) => {
    if (typeof children === "function") {
      return children(props);
    }
    // fallback: just render a normal input
    return React.createElement("input", { ...props });
  };
});



// Silence console errors
console.error = jest.fn();

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ foo: "bar" }),
  } as unknown as Response)
) as jest.MockedFunction<typeof fetch>;

// Mock canvas.getContext to prevent jsdom crash
beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: (contextType: string) => {
      if (contextType === "2d") {
        return {
          fillRect: jest.fn(),
          clearRect: jest.fn(),
          getImageData: jest.fn(),
          putImageData: jest.fn(),
          createImageData: jest.fn(),
          setTransform: jest.fn(),
          drawImage: jest.fn(),
          save: jest.fn(),
          fillText: jest.fn(),
          restore: jest.fn(),
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          closePath: jest.fn(),
          stroke: jest.fn(),
          translate: jest.fn(),
          scale: jest.fn(),
          rotate: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
          measureText: jest.fn().mockReturnValue({ width: 0 }),
          transform: jest.fn(),
          rect: jest.fn(),
          clip: jest.fn(),
          canvas: document.createElement("canvas"),
          globalAlpha: 1,
          globalCompositeOperation: "source-over",
          isPointInPath: jest.fn(),
          isPointInStroke: jest.fn(),
          shadowBlur: 0,
          shadowColor: "#000",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          strokeStyle: "#000",
          fillStyle: "#000",
          lineCap: "butt",
          lineDashOffset: 0,
          lineJoin: "miter",
          lineWidth: 1,
          miterLimit: 10,
          setLineDash: jest.fn(),
          getLineDash: jest.fn(),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    },
  });
});

// Mock jsPDF and related modules
jest.mock("jspdf", () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      autoTable: jest.fn(),
      save: jest.fn(),
      text: jest.fn(),
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      addPage: jest.fn(),
    })),
  };
});
jest.mock("jspdf-autotable", () => {});
jest.mock("axios");

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
  (console.warn as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});
