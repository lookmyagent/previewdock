import type { AdapterRegistration, FileDescriptor, PreviewAdapter } from './types';
export declare class AdapterRegistry {
    private readonly registrations;
    private readonly loadedAdapters;
    register(registration: AdapterRegistration): () => void;
    unregister(id: string): void;
    list(): AdapterRegistration[];
    private matches;
    resolve(file: FileDescriptor): Promise<PreviewAdapter | undefined>;
}
