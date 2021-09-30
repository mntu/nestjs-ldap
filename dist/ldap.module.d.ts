import { DynamicModule } from '@nestjs/common';
import { LdapModuleOptions, LdapModuleAsyncOptions, LdapDomainsConfig } from './ldap.interface';
export declare class LdapModule {
    static createDomainConfig(config: {
        name: string;
        url: string;
        bindDN: string;
        bindCredentials: string;
        baseDN: string;
        tlsOptions?: Object | undefined;
    }): LdapDomainsConfig;
    static register(options: LdapModuleOptions): DynamicModule;
    static registerAsync(options: LdapModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
