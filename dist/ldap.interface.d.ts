/// <reference types="node" />
import type { LoggerService } from '@nestjs/common';
import type { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import type { ClientOptions, SearchEntryObject } from 'ldapjs';
import type { Redis } from 'ioredis';
export declare const LDAP_SYNC = "LDAP_SYNC";
export declare const LDAP_OPTIONS = "LDAP_OPTIONS";
export declare type Scope = 'base' | 'one' | 'sub';
export interface LoggerContext {
    [key: string]: string | unknown | null;
}
export interface LdapAddEntry {
    uid: string;
    cn?: string;
    displayName?: string;
    name?: string;
    comment?: Record<string, string> | string;
    thumbnailPhoto?: Buffer;
    objectClass: string | string[];
    [p: string]: undefined | string | string[] | Record<string, string> | Buffer;
}
export interface LdapModifyEntry {
    uid: string;
    [p: string]: undefined | string | string[] | Record<string, string> | Buffer;
}
export interface LdapResponseObject extends Pick<SearchEntryObject, 'dn' | 'controls'> {
    loginDomain: string;
    distinguishedName: string;
    cn: string;
    description: string;
    displayName: string;
    name: string;
    objectCategory: string;
    objectClass: string[];
    objectGUID: string;
    sAMAccountName: string;
    sAMAccountType: string;
    whenChanged: Date;
    whenCreated: Date;
}
export declare type LdapResponseGroup = LdapResponseObject;
export interface LdapResponseUser extends LdapResponseObject {
    groups: LdapResponseGroup[];
    c: string;
    co: string;
    comment: string;
    company: string;
    countryCode: string;
    department: string;
    employeeID: string;
    employeeNumber: string;
    employeeType: string;
    givenName: string;
    flags: string;
    l: string;
    lockoutTime: string;
    mail: string;
    otherMailbox: string[];
    memberOf: string[];
    middleName: string;
    mobile: string;
    manager: string;
    otherTelephone: string[];
    postalCode: string;
    physicalDeliveryOfficeName: string;
    sn: string;
    st: string;
    streetAddress: string;
    telephoneNumber: string;
    facsimileTelephoneNumber: string;
    thumbnailPhoto: string;
    jpegPhoto: string[];
    carLicense: string;
    title: string;
    userAccountControl: string;
    wWWHomePage: string;
    userPrincipalName: string;
    badPasswordTime: Date;
    badPwdCount: number;
    logonCount: number;
    lastLogoff: Date;
    lastLogon: Date;
    lastLogonTimestamp: Date;
    pwdLastSet: Date;
    'msDS-cloudExtensionAttribute1'?: string;
    'msDS-cloudExtensionAttribute2'?: string;
    'msDS-cloudExtensionAttribute3'?: string;
    'msDS-cloudExtensionAttribute4'?: string;
    'msDS-cloudExtensionAttribute5'?: string;
    'msDS-cloudExtensionAttribute6'?: string;
    'msDS-cloudExtensionAttribute7'?: string;
    'msDS-cloudExtensionAttribute8'?: string;
    'msDS-cloudExtensionAttribute9'?: string;
    'msDS-cloudExtensionAttribute10'?: string;
    'msDS-cloudExtensionAttribute11'?: string;
    'msDS-cloudExtensionAttribute12'?: string;
    'msDS-cloudExtensionAttribute13'?: string;
    'msDS-cloudExtensionAttribute14'?: string;
    'msDS-cloudExtensionAttribute15'?: string;
    'msDS-cloudExtensionAttribute16'?: string;
    'msDS-cloudExtensionAttribute17'?: string;
    'msDS-cloudExtensionAttribute18'?: string;
    'msDS-cloudExtensionAttribute19'?: string;
    'msDS-cloudExtensionAttribute20'?: string;
}
interface GroupSearchFilterFunction {
    (user: LdapResponseUser): string;
}
export interface LdapDomainsConfig extends ClientOptions {
    name: string;
    bindDN: string;
    bindCredentials: string;
    bindProperty?: 'dn';
    searchBase: string;
    searchFilter: string;
    searchScope?: Scope;
    searchAttributes?: string[];
    hideSynchronization?: boolean;
    searchFilterAllUsers?: string;
    searchScopeAllUsers?: Scope;
    searchAttributesAllUsers?: string[];
    groupSearchBase?: string;
    groupSearchFilter?: string | GroupSearchFilterFunction;
    searchFilterAllGroups?: string;
    groupSearchScope?: Scope;
    groupSearchAttributes?: string[];
    groupDnProperty?: string;
    includeRaw?: boolean;
    timeLimit?: number;
    sizeLimit?: number;
    newObject?: string;
}
export interface LdapModuleOptions {
    domains: LdapDomainsConfig[];
    logger: LoggerService;
    cache?: Redis;
    cacheUrl?: string;
    cacheTtl?: number;
}
export interface LdapOptionsFactory {
    createLdapOptions(): Promise<LdapModuleOptions> | LdapModuleOptions;
}
export interface LdapModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<LdapOptionsFactory>;
    useClass?: Type<LdapOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<LdapModuleOptions> | LdapModuleOptions;
    inject?: any[];
}
export declare const ldapADattributes: string[];
export interface LDAPCache {
    user: LdapResponseUser;
    password: string;
}
export {};
