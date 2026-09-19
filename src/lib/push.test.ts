import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  pushSupported,
  registerServiceWorker,
  enablePush,
  sendTestPush,
  isPushSubscribed,
  unsubscribePush,
  disablePush,
} from "./push";

describe("push notification helper", () => {
  let mockSubscription: any;
  let mockPushManager: any;
  let mockServiceWorker: any;
  let fetchSpy: any;

  beforeEach(() => {
    mockSubscription = {
      endpoint: "https://push.example.com/sub/123",
      toJSON: () => ({
        endpoint: "https://push.example.com/sub/123",
        keys: { p256dh: "key123", auth: "auth123" },
      }),
      unsubscribe: mock(async () => true),
    };

    mockPushManager = {
      getSubscription: mock(async () => mockSubscription),
      subscribe: mock(async () => mockSubscription),
    };

    mockServiceWorker = {
      register: mock(async () => ({ pushManager: mockPushManager })),
      ready: Promise.resolve({ pushManager: mockPushManager }),
      getRegistration: mock(async () => ({ pushManager: mockPushManager })),
    };

    (globalThis as any).window = {
      PushManager: function () {},
      location: { hostname: "localhost", port: "3000", protocol: "http:" },
    };

    (globalThis as any).navigator = {
      serviceWorker: mockServiceWorker,
    };

    (globalThis as any).Notification = {
      permission: "granted",
      requestPermission: mock(async () => "granted"),
    };

    fetchSpy = mock(async (url: string, opts: any) => {
      if (url.includes("/api/v1/push/vapid-public-key")) {
        return new Response(JSON.stringify({ public_key: "BHx1234567890abcdef" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    (globalThis as any).fetch = fetchSpy;
  });

  describe("pushSupported", () => {
    it("returns true when serviceWorker and PushManager are available", () => {
      expect(pushSupported()).toBe(true);
    });

    it("returns false when PushManager is not in window", () => {
      delete (globalThis as any).window.PushManager;
      expect(pushSupported()).toBe(false);
    });
  });

  describe("registerServiceWorker", () => {
    it("registers /sw.js", async () => {
      const reg = await registerServiceWorker();
      expect(mockServiceWorker.register).toHaveBeenCalledWith("/sw.js");
      expect(reg).toBeDefined();
    });
  });

  describe("isPushSubscribed", () => {
    it("returns true if subscription exists", async () => {
      const subscribed = await isPushSubscribed();
      expect(subscribed).toBe(true);
    });

    it("returns false if subscription is null", async () => {
      mockPushManager.getSubscription = mock(async () => null);
      const subscribed = await isPushSubscribed();
      expect(subscribed).toBe(false);
    });

    it("returns false if push is not supported", async () => {
      delete (globalThis as any).window.PushManager;
      const subscribed = await isPushSubscribed();
      expect(subscribed).toBe(false);
    });

    it("handles errors gracefully and returns false", async () => {
      mockPushManager.getSubscription = mock(async () => {
        throw new Error("Worker failed");
      });
      const subscribed = await isPushSubscribed();
      expect(subscribed).toBe(false);
    });

    it("returns false when service worker is not registered", async () => {
      mockServiceWorker.getRegistration = mock(async () => undefined);
      const subscribed = await isPushSubscribed();
      expect(subscribed).toBe(false);
    });
  });

  describe("unsubscribePush", () => {
    it("unsubscribes and notifies backend when subscribed", async () => {
      await unsubscribePush();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0];
      const calledOpts = fetchSpy.mock.calls[0][1];
      expect(calledUrl).toContain("/api/v1/push/unsubscribe");
      expect(calledOpts.method).toBe("POST");
      expect(JSON.parse(calledOpts.body)).toEqual({
        endpoint: "https://push.example.com/sub/123",
      });
    });

    it("does nothing when service worker is not registered", async () => {
      mockServiceWorker.getRegistration = mock(async () => undefined);

      await unsubscribePush();

      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("does nothing when subscription is null", async () => {
      mockPushManager.getSubscription = mock(async () => null);

      await unsubscribePush();

      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("does nothing if push is not supported", async () => {
      delete (globalThis as any).window.PushManager;

      await unsubscribePush();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("handles error during unsubscribe without throwing", async () => {
      mockSubscription.unsubscribe = mock(async () => {
        throw new Error("browser unsubscribe error");
      });
      (globalThis as any).fetch = mock(async () => {
        throw new Error("network error");
      });

      // Should not throw
      await expect(unsubscribePush()).resolves.toBeUndefined();
    });
  });

  describe("disablePush", () => {
    it("unsubscribes and calls backend unsubscribe endpoint", async () => {
      await disablePush();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0];
      const calledOpts = fetchSpy.mock.calls[0][1];
      expect(calledUrl).toContain("/api/v1/push/unsubscribe");
      expect(calledOpts.method).toBe("POST");
      expect(JSON.parse(calledOpts.body)).toEqual({
        endpoint: "https://push.example.com/sub/123",
      });
    });

    it("calls backend with empty endpoint if subscription was not found", async () => {
      mockPushManager.getSubscription = mock(async () => null);

      await disablePush();

      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0];
      const calledOpts = fetchSpy.mock.calls[0][1];
      expect(calledUrl).toContain("/api/v1/push/unsubscribe");
      expect(JSON.parse(calledOpts.body)).toEqual({
        endpoint: "",
      });
    });
  });

  describe("enablePush", () => {
    it("subscribes and posts subscription to backend", async () => {
      mockPushManager.getSubscription = mock(async () => null);

      const res = await enablePush();
      expect(res).toBe(true);
      expect(mockPushManager.subscribe).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
    });

    it("throws when push is not supported", async () => {
      delete (globalThis as any).window.PushManager;
      await expect(enablePush()).rejects.toThrow("Push notifications are not supported");
    });

    it("throws when notification permission is denied", async () => {
      (globalThis as any).Notification.requestPermission = mock(async () => "denied");
      await expect(enablePush()).rejects.toThrow("Notification permission was denied");
    });

    it("throws when server returns no public key", async () => {
      (globalThis as any).fetch = mock(
        async () =>
          new Response(JSON.stringify({ public_key: "" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
      );
      await expect(enablePush()).rejects.toThrow("Server has no VAPID key configured");
    });
  });

  describe("sendTestPush", () => {
    it("posts to test endpoint", async () => {
      await sendTestPush();
      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0];
      expect(calledUrl).toContain("/api/v1/push/test");
    });
  });
});
