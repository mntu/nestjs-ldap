//#region Imports NPM
import { DynamicModule, Module, Provider, Type, Global } from '@nestjs/common';
//#endregion
//#region Imports Local
import { LdapService } from './ldap.service';
import {
    LDAP_OPTIONS,
    LdapModuleOptions,
    LdapModuleAsyncOptions,
    LdapOptionsFactory,
    LdapDomainsConfig,
    ldapADattributes,
    Scope,
} from './ldap.interface';
//#endregion

@Global()
@Module({
    imports: [],
    providers: [LdapService],
    exports: [LdapService],
})
export class LdapModule {
    static createDomainConfig(config: {
        name: string,
        url: string,
        bindDN: string,
        bindCredentials: string,
        baseDN: string,
        tlsOptions?: Object | undefined,
    }): LdapDomainsConfig {
        return {
            name: config.name,
            url: config.url,
            bindDN: config.bindDN,
            bindCredentials: config.bindCredentials,
            searchBase: config.baseDN,
            newObject: config.baseDN,
            searchFilter:
                '(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))',
            searchScope: 'sub' as Scope,
            groupSearchBase: config.baseDN,
            groupSearchFilter:
                '(&(objectClass=group)(member={{dn}}))',
            groupSearchScope: 'sub' as Scope,
            groupDnProperty: 'dn',
            hideSynchronization: false,
            searchFilterAllUsers:
                '(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))',
            searchFilterAllGroups: 'objectClass=group',
            searchScopeAllUsers: 'sub' as Scope,
            reconnect: true,
            groupSearchAttributes: ldapADattributes,
            searchAttributes: ldapADattributes,
            searchAttributesAllUsers: ldapADattributes,
            tlsOptions: config.tlsOptions,
        };
    }

    static register(options: LdapModuleOptions): DynamicModule {
        return {
            module: LdapModule,
            providers: [
                { provide: LDAP_OPTIONS, useValue: options || {} },
                LdapService,
            ],
        };
    }

    static registerAsync(options: LdapModuleAsyncOptions): DynamicModule {
        return {
            module: LdapModule,
            imports: options.imports || [],
            providers: this.createAsyncProviders(options),
        };
    }

    private static createAsyncProviders(
        options: LdapModuleAsyncOptions,
    ): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }

        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass as Type<LdapOptionsFactory>,
                useClass: options.useClass as Type<LdapOptionsFactory>,
            },
        ];
    }

    private static createAsyncOptionsProvider(
        options: LdapModuleAsyncOptions,
    ): Provider {
        if (options.useFactory) {
            return {
                provide: LDAP_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }

        return {
            provide: LDAP_OPTIONS,
            useFactory: async (optionsFactory: LdapOptionsFactory) =>
                optionsFactory.createLdapOptions(),
            inject: [
                (options.useExisting as Type<LdapOptionsFactory>) ||
                    (options.useClass as Type<LdapOptionsFactory>),
            ],
        };
    }
}
