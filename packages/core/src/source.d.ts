import type { FileDescriptor, FileSource, OpenFileOptions } from './types';
export declare function extensionFromName(name: string): string;
export declare function createFileDescriptor(source: FileSource, options: OpenFileOptions, signal: AbortSignal): Promise<FileDescriptor>;
