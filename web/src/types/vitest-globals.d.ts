/* eslint-disable */
// Ambient declarations for test globals to avoid TS errors before dev deps are installed
declare const describe: (name: string, fn: (...args: any[]) => any) => void;
declare const it: (name: string, fn: (...args: any[]) => any) => void;
declare const test: (name: string, fn: (...args: any[]) => any) => void;
declare const expect: any;
declare const beforeAll: (fn: (...args: any[]) => any) => void;
declare const afterAll: (fn: (...args: any[]) => any) => void;
declare const beforeEach: (fn: (...args: any[]) => any) => void;
declare const afterEach: (fn: (...args: any[]) => any) => void;
declare const vi: any;

export {};
