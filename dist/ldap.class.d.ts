/// <reference types="node" />
import { LoggerService } from '@nestjs/common';
import { EventEmitter } from 'events';
import type { LdapDomainsConfig, LoggerContext } from './ldap.interface';
import { LdapResponseGroup, LdapResponseUser, LdapAddEntry } from './ldap.interface';
import { Change } from './ldap/change';
export declare class LdapDomain extends EventEmitter {
    private readonly options;
    private readonly logger;
    domainName: string;
    hideSynchronization: boolean;
    private clientOpts;
    private bindDN;
    private bindCredentials;
    private adminClient;
    private adminBound;
    private userClient;
    private getGroups;
    constructor(options: LdapDomainsConfig, logger: LoggerService);
    GUIDtoString: (objectGUID: string) => string;
    dateFromString: (string: string) => Date | null;
    private handleErrorAdmin;
    private handleErrorUser;
    private handleConnectError;
    private onConnectAdmin;
    private adminBind;
    private search;
    private sanitizeInput;
    private findUser;
    private findGroups;
    searchByUsername({ username, loggerContext, }: {
        username: string;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser | undefined>;
    searchByDN({ dn, loggerContext, }: {
        dn: string;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser>;
    synchronization({ loggerContext, }: {
        loggerContext?: LoggerContext;
    }): Promise<Record<string, Error | LdapResponseUser[]>>;
    synchronizationGroups({ loggerContext, }: {
        loggerContext?: LoggerContext;
    }): Promise<Record<string, Error | LdapResponseGroup[]>>;
    modify({ dn, data, username, password, loggerContext, }: {
        dn: string;
        data: Change[];
        username?: string;
        password?: string;
        loggerContext?: LoggerContext;
    }): Promise<boolean>;
    authenticate({ username, password, loggerContext, }: {
        username: string;
        password: string;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser>;
    trustedDomain({ searchBase, loggerContext, }: {
        searchBase: string;
        loggerContext?: LoggerContext;
    }): Promise<any>;
    add({ entry, loggerContext, }: {
        entry: LdapAddEntry;
        loggerContext?: LoggerContext;
    }): Promise<LdapResponseUser>;
    close(): Promise<boolean>;
}
