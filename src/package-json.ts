/**
 * @internal
 */
export interface PackageJson {
    name: string;
    version: string;
    scripts?: Partial<Record<string, string>>;
    exports?: Record<string, unknown>;
    dependencies?: Partial<Record<string, string>>;
    devDependencies?: Partial<Record<string, string>>;
    peerDependencies?: Partial<Record<string, string>>;
    externalDependencies?: string[];
}
