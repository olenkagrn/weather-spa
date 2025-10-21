import "@testing-library/jest-dom";
import "whatwg-fetch";

if (typeof Request === "undefined") {
  global.Request = class MockRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  } as typeof Request;
}

if (typeof Response === "undefined") {
  global.Response = class MockResponse {
    ok: boolean;
    status: number;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
      this.status = init?.status || 200;
    }

    json() {
      return Promise.resolve({});
    }
  } as typeof Response;
}
