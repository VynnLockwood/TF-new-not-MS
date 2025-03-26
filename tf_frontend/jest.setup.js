// Mock TextEncoder globally to prevent errors in Jest's jsdom environment
global.TextEncoder = class {
    encode(str) {
      return new Uint8Array(str.split('').map((char) => char.charCodeAt(0)));
    }
  };
  
  // Mock TextDecoder if needed
  global.TextDecoder = class {
    decode(array) {
      return String.fromCharCode(...array);
    }
  };
  