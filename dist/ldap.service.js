"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LdapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = __importDefault(require("cache-manager"));
const cache_manager_ioredis_1 = __importDefault(require("cache-manager-ioredis"));
const url_1 = require("url");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ldap_interface_1 = require("./ldap.interface");
const ldap_class_1 = require("./ldap.class");
const Ldap = __importStar(require("ldapjs"));
const LDAP_PASSWORD_NULL = '2058e76c5f3d68e12d7eec7e334fece75b0552edc5348f85c7889404d9211a36';
let LdapService = LdapService_1 = class LdapService {
    constructor(options) {
        var _a, _b;
        this.options = options;
        this.logger = options.logger;
        if (options.cacheUrl || options.cache) {
            this.cacheTtl = options.cacheTtl || 600;
            this.cacheSalt = bcrypt_1.default.genSaltSync(6);
            if (options.cache) {
                this.cache = cache_manager_1.default.caching({
                    store: cache_manager_ioredis_1.default,
                    redisInstance: options.cache,
                    keyPrefix: 'LDAP:',
                    ttl: this.cacheTtl,
                });
            }
            else if (options.cacheUrl) {
                const redisArray = (0, url_1.parse)(options.cacheUrl);
                if (redisArray &&
                    (redisArray.protocol === 'redis:' ||
                        redisArray.protocol === 'rediss:')) {
                    let username;
                    let password;
                    const db = parseInt(((_a = redisArray.pathname) === null || _a === void 0 ? void 0 : _a.slice(1)) || '0', 10);
                    if (redisArray.auth) {
                        [username, password] = redisArray.auth.split(':');
                    }
                    this.cache = cache_manager_1.default.caching({
                        store: cache_manager_ioredis_1.default,
                        host: redisArray.hostname,
                        port: parseInt(redisArray.port || '6379', 10),
                        username,
                        password,
                        db,
                        keyPrefix: 'LDAP:',
                        ttl: this.cacheTtl,
                    });
                }
            }
            if ((_b = this.cache) === null || _b === void 0 ? void 0 : _b.store) {
                this.logger.debug({
                    message: 'Redis connection: success',
                    context: LdapService_1.name,
                    function: 'constructor',
                });
            }
            else {
                this.logger.error({
                    message: 'Redis connection: some error',
                    context: LdapService_1.name,
                    function: 'constructor',
                });
            }
        }
        else {
            this.cacheSalt = '';
            this.cacheTtl = 0;
        }
        this.ldapDomains = this.options.domains.map((opts) => new ldap_class_1.LdapDomain(opts, this.logger));
    }
    async searchByUsername({ username, domain, cache = true, loggerContext, }) {
        const cachedID = `user:${domain}:${username}`;
        if (cache && this.cache) {
            const cached = await this.cache.get(cachedID);
            if (cached && cached.user && cached.user.sAMAccountName) {
                this.logger.debug(Object.assign({ message: `From cache: ${cached.user.sAMAccountName}`, context: LdapService_1.name, function: 'searchByUsername' }, loggerContext));
                return cached.user;
            }
        }
        const domainLdap = this.ldapDomains.find((value) => value.domainName === domain);
        if (!domainLdap) {
            this.logger.debug(Object.assign({ message: `Domain does not exist: ${domain}`, context: LdapService_1.name, function: 'searchByUsername' }, loggerContext));
            throw new Error(`Domain does not exist: ${domain}`);
        }
        return domainLdap
            .searchByUsername({ username, loggerContext })
            .then((user) => {
            if (user && this.cache) {
                this.logger.debug(Object.assign({ message: `To cache from domain ${domain}: ${user.dn}`, context: LdapService_1.name, function: 'searchByUsername' }, loggerContext));
                this.cache.set(`dn:${domain}:${user.dn}`, { user, password: LDAP_PASSWORD_NULL }, { ttl: this.cacheTtl });
                if (user.sAMAccountName) {
                    this.logger.debug(Object.assign({ message: `To cache from domain ${domain}: ${user.sAMAccountName}`, context: LdapService_1.name, function: 'searchByUsername' }, loggerContext));
                    this.cache.set(`user:${domain}:${user.sAMAccountName}`, { user, password: LDAP_PASSWORD_NULL }, { ttl: this.cacheTtl });
                }
            }
            return user;
        });
    }
    async searchByDN({ dn, domain, cache = true, loggerContext, }) {
        if (!domain || !dn) {
            throw new Error(`Arguments domain=${domain}, userByDN=${dn}`);
        }
        const cachedID = `dn:${domain}:${dn}`;
        if (cache && this.cache) {
            const cached = await this.cache.get(cachedID);
            if (cached === null || cached === void 0 ? void 0 : cached.user.dn) {
                this.logger.debug(Object.assign({ message: `From cache: ${cached.user.dn}`, context: LdapService_1.name, function: 'searchByDN' }, loggerContext));
                return cached.user;
            }
        }
        const domainLdap = this.ldapDomains.find((value) => value.domainName === domain);
        if (!domainLdap) {
            this.logger.debug(Object.assign({ message: `Domain does not exist: ${domain}`, context: LdapService_1.name, function: 'searchByDN' }, loggerContext));
            throw new Error(`Domain does not exist: ${domain}`);
        }
        return domainLdap.searchByDN({ dn, loggerContext }).then((user) => {
            if (user && this.cache) {
                this.logger.debug(Object.assign({ message: `To cache, domain "${domain}": ${user.dn}`, context: LdapService_1.name, function: 'searchByDN' }, loggerContext));
                this.cache.set(cachedID, { user, password: LDAP_PASSWORD_NULL }, { ttl: this.cacheTtl });
                if (user.sAMAccountName) {
                    this.logger.debug(Object.assign({ message: `To cache, domain "${domain}": ${user.sAMAccountName}`, context: LdapService_1.name, function: 'searchByDN' }, loggerContext));
                    this.cache.set(`user:${domain}:${user.sAMAccountName}`, { user, password: LDAP_PASSWORD_NULL }, { ttl: this.cacheTtl });
                }
            }
            return user;
        }).catch((error) => {
            if (error instanceof Ldap.NoSuchObjectError) {
                return null;
            }
            else {
                throw error;
            }
        });
    }
    async synchronization({ loggerContext, }) {
        return Promise.all(this.ldapDomains
            .filter((domain) => !domain.hideSynchronization)
            .map(async (domain) => domain.synchronization({ loggerContext }))).then((promise) => promise.reduce((accumulator, domain) => (Object.assign(Object.assign({}, accumulator), domain)), {}));
    }
    async synchronizationGroups({ loggerContext, }) {
        return Promise.all(this.ldapDomains
            .filter((domain) => !domain.hideSynchronization)
            .map(async (domain) => domain.synchronizationGroups({ loggerContext }))).then((promise) => promise.reduce((accumulator, domain) => (Object.assign(Object.assign({}, accumulator), domain)), {}));
    }
    async modify({ dn, data, domain, username, password, loggerContext, }) {
        const domainLdap = this.ldapDomains.find((value) => value.domainName === domain);
        if (!domainLdap) {
            this.logger.debug(Object.assign({ message: `Domain does not exist: ${domain}`, context: LdapService_1.name, function: 'modify' }, loggerContext));
            throw new Error(`Domain does not exist: ${domain}`);
        }
        return domainLdap.modify({
            dn,
            data,
            username,
            password,
            loggerContext,
        });
    }
    async authenticate({ username, password, domain, cache = true, loggerContext, }) {
        var _a;
        if (!password) {
            this.logger.error(Object.assign({ message: `${domain}: No password given`, error: `${domain}: No password given`, context: LdapService_1.name, function: 'authenticate' }, loggerContext));
            throw new Error('No password given');
        }
        const domainLdap = this.ldapDomains.find((value) => value.domainName === domain);
        if (!domainLdap) {
            this.logger.debug(Object.assign({ message: `Domain does not exist: ${domain}`, context: LdapService_1.name, function: 'authenticate' }, loggerContext));
            throw new Error(`Domain does not exist: ${domain}`);
        }
        const cachedID = `user:${domain}:${username}`;
        if (cache && this.cache) {
            const cached = await this.cache.get(cachedID);
            if (((_a = cached === null || cached === void 0 ? void 0 : cached.user) === null || _a === void 0 ? void 0 : _a.sAMAccountName) &&
                ((cached === null || cached === void 0 ? void 0 : cached.password) === LDAP_PASSWORD_NULL ||
                    bcrypt_1.default.compareSync(password, cached.password))) {
                this.logger.debug(Object.assign({ message: `From cache ${domain}: ${cached.user.sAMAccountName}`, context: LdapService_1.name, function: 'authenticate' }, loggerContext));
                (async () => {
                    try {
                        const user = await domainLdap.authenticate({
                            username,
                            password,
                            loggerContext,
                        });
                        if (JSON.stringify(user) !==
                            JSON.stringify(cached.user) &&
                            this.cache) {
                            this.logger.debug(Object.assign({ message: `To cache from domain ${domain}: ${user.sAMAccountName}`, context: LdapService_1.name, function: 'authenticate' }, loggerContext));
                            this.cache.set(`user:${domain}:${user.sAMAccountName}`, {
                                user,
                                password: bcrypt_1.default.hashSync(password, this.cacheSalt),
                            }, { ttl: this.cacheTtl });
                        }
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error
                            ? error.toString()
                            : JSON.stringify(error);
                        this.logger.error(Object.assign({ message: `LDAP auth error [${domain}]: ${errorMessage}`, error, context: LdapService_1.name, function: 'authenticate' }, loggerContext));
                    }
                })();
                return cached.user;
            }
        }
        return domainLdap
            .authenticate({
            username,
            password,
            loggerContext,
        })
            .then((user) => {
            if (this.cache) {
                this.logger.debug(Object.assign({ message: `To cache from domain ${domain}: ${user.sAMAccountName}`, context: LdapService_1.name, function: 'authenticate' }, loggerContext));
                this.cache.set(`user:${domain}:${user.sAMAccountName}`, {
                    user,
                    password: bcrypt_1.default.hashSync(password, this.cacheSalt),
                }, { ttl: this.cacheTtl });
            }
            return user;
        });
    }
    async trustedDomain({ searchBase, domain, loggerContext, }) {
        const trustedDomain = '';
        return trustedDomain;
    }
    async add({ entry, domain, loggerContext, }) {
        const domainLdap = this.ldapDomains.find((value) => value.domainName === domain);
        if (!domainLdap) {
            this.logger.debug(Object.assign({ message: `Domain does not exist: ${domain}`, context: LdapService_1.name, function: 'add' }, loggerContext));
            throw new Error(`Domain does not exist: ${domain}`);
        }
        return domainLdap.add({ entry, loggerContext });
    }
    async close() {
        const promiseDomain = this.ldapDomains.map(async (domain) => domain.close());
        return Promise.all(promiseDomain).then((values) => values || []);
    }
};
LdapService = LdapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ldap_interface_1.LDAP_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], LdapService);
exports.LdapService = LdapService;
//# sourceMappingURL=ldap.service.js.map