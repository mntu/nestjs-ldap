"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LdapModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapModule = void 0;
const common_1 = require("@nestjs/common");
const ldap_service_1 = require("./ldap.service");
const ldap_interface_1 = require("./ldap.interface");
let LdapModule = LdapModule_1 = class LdapModule {
    static createDomainConfig(config) {
        return {
            name: config.name,
            url: config.url,
            bindDN: config.bindDN,
            bindCredentials: config.bindCredentials,
            searchBase: config.baseDN,
            newObject: config.baseDN,
            searchFilter: '(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))',
            searchScope: 'sub',
            groupSearchBase: config.baseDN,
            groupSearchFilter: '(&(objectClass=group)(member={{dn}}))',
            groupSearchScope: 'sub',
            groupDnProperty: 'dn',
            hideSynchronization: false,
            searchFilterAllUsers: '(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))',
            searchFilterAllGroups: 'objectClass=group',
            searchScopeAllUsers: 'sub',
            reconnect: true,
            groupSearchAttributes: ldap_interface_1.ldapADattributes,
            searchAttributes: ldap_interface_1.ldapADattributes,
            searchAttributesAllUsers: ldap_interface_1.ldapADattributes,
            tlsOptions: config.tlsOptions,
        };
    }
    static register(options) {
        return {
            module: LdapModule_1,
            providers: [
                { provide: ldap_interface_1.LDAP_OPTIONS, useValue: options || {} },
                ldap_service_1.LdapService,
            ],
        };
    }
    static registerAsync(options) {
        return {
            module: LdapModule_1,
            imports: options.imports || [],
            providers: this.createAsyncProviders(options),
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: ldap_interface_1.LDAP_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: ldap_interface_1.LDAP_OPTIONS,
            useFactory: async (optionsFactory) => optionsFactory.createLdapOptions(),
            inject: [
                options.useExisting ||
                    options.useClass,
            ],
        };
    }
};
LdapModule = LdapModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        providers: [ldap_service_1.LdapService],
        exports: [ldap_service_1.LdapService],
    })
], LdapModule);
exports.LdapModule = LdapModule;
//# sourceMappingURL=ldap.module.js.map