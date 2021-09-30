import type { LdapModuleOptions, LdapResponseUser, LdapResponseGroup, LdapAddEntry, LoggerContext } from './ldap.interface';
import { Change } from './ldap/change';
import { LdapDomain } from './ldap.class';
export declare class LdapService {
    private readonly options;
    ldapDomains: LdapDomain[];
    private logger;
    private cache?;
    private cacheSalt;
    private cacheTtl;
    constructor(options: LdapModuleOptions);
    searchByUsername({ username, domain, cache, loggerContext, }: {
        username: string;
        domain: string;
        cache?: boolean;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser | undefined>;
    searchByDN({ dn, domain, cache, loggerContext, }: {
        dn: string;
        domain: string;
        cache?: boolean;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser | null | undefined>;
    synchronization({ loggerContext, }: {
        loggerContext?: LoggerContext;
    }): Promise<Record<string, Error | LdapResponseUser[]>>;
    synchronizationGroups({ loggerContext, }: {
        loggerContext?: LoggerContext;
    }): Promise<Record<string, Error | LdapResponseGroup[]>>;
    modify({ dn, data, domain, username, password, loggerContext, }: {
        dn: string;
        data: Change[];
        domain: string;
        username?: string;
        password?: string;
        loggerContext?: LoggerContext;
    }): Promise<boolean>;
    authenticate({ username, password, domain, cache, loggerContext, }: {
        username: string;
        password: string;
        domain: string;
        cache?: boolean;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser>;
    trustedDomain({ searchBase, domain, loggerContext, }: {
        searchBase: string;
        domain: string;
        loggerContext?: LoggerContext;
    }): Promise<any>;
    add({ entry, domain, loggerContext, }: {
        entry: LdapAddEntry;
        domain: string;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser>;
    close(): Promise<boolean[]>;
}
