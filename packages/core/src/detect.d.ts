import type { FileDescriptor } from './types';
export declare function detectMimeFromMagic(head: Uint8Array): string | undefined;
export declare function enrichDetection(file: FileDescriptor): FileDescriptor;
