declare module "signature_pad" {
  export default class SignaturePad {
    constructor(canvas: HTMLCanvasElement, options?: SignaturePadOptions);
    clear(): void;
    fromDataURL(dataUrl: string): void;
    toDataURL(type?: string): string;
    isEmpty(): boolean;
    off(): void;
  }

  interface SignaturePadOptions {
    backgroundColor?: string;
    penColor?: string;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    throttle?: number;
    minDistance?: number;
    dotSize?: number;
    onBegin?: () => void;
    onEnd?: () => void;
  }
}
