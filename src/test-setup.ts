import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow({ url: "http://localhost:3000" });

globalThis.window = window as any;
globalThis.document = window.document as any;
globalThis.navigator = window.navigator as any;
globalThis.HTMLElement = window.HTMLElement as any;
globalThis.HTMLButtonElement = window.HTMLButtonElement as any;
globalThis.HTMLCanvasElement = window.HTMLCanvasElement as any;

if (window.HTMLCanvasElement) {
  (window.HTMLCanvasElement.prototype as any).getContext = function () {
    return {
      clearRect: () => {},
      fillRect: () => {},
      fillText: () => {},
      measureText: (text: string) => ({ width: (text || "").length * 10 }),
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      scale: () => {},
    };
  };

  (window.HTMLCanvasElement.prototype as any).toDataURL = function () {
    return "data:image/png;base64,mockRetinaSignaturePngData";
  };
}

globalThis.Response = Response;
globalThis.Request = Request;
globalThis.Headers = Headers;
