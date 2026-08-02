import { AdapterRegistry } from './registry';
import type { FileSource, OpenFileOptions, OpenResult, StatusListener } from './types';
export declare class ViewerEngine {
    readonly registry: AdapterRegistry;
    private controller?;
    private currentSession?;
    private readonly listeners;
    constructor(registry: AdapterRegistry);
    onStatus(listener: StatusListener): () => void;
    private emit;
    open(source: FileSource, options?: OpenFileOptions): Promise<OpenResult>;
    close(): Promise<void>;
}
