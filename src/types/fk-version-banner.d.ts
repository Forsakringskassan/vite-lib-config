declare module "fk-version-banner" {
    function fkVersionBanner(options?: {
        dependencies?: string[];
        git: boolean;
        pkg: boolean;
    }): string;
    export default fkVersionBanner;
}
