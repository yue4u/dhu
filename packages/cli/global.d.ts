export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DIGICAM_ID: string;
      DIGICAM_PASSWORD: string;
    }
  }
}
