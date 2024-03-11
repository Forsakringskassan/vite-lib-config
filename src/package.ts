/**
 * @internal
 */
export interface Package {
    /** package name */
    name: string;
    /** path to package.json */
    pkgPath: string;
    /** path to src-folder */
    srcPath: string;
}
