import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow({ url: "http://localhost:3000" });

globalThis.window = window as any;
globalThis.document = window.document as any;
globalThis.navigator = window.navigator as any;
globalThis.HTMLElement = window.HTMLElement as any;
globalThis.HTMLButtonElement = window.HTMLButtonElement as any;
globalThis.Response = Response;
globalThis.Request = Request;
globalThis.Headers = Headers;
