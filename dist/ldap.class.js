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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapDomain = void 0;
const events_1 = require("events");
const Ldap = __importStar(require("ldapjs"));
const ldap_interface_1 = require("./ldap.interface");
class LdapDomain extends events_1.EventEmitter {
    constructor(options, logger) {
        var _a;
        super();
        this.options = options;
        this.logger = logger;
        this.GUIDtoString = (objectGUID) => (objectGUID &&
            Buffer.from(objectGUID, 'base64')
                .toString('hex')
                .replace(/^(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)$/, '$4$3$2$1-$6$5-$8$7-$10$9-$16$15$14$13$12$11')
                .toUpperCase()) ||
            '';
        this.dateFromString = (string) => {
            const b = string.match(/\d\d/g);
            return (b &&
                new Date(Date.UTC(Number.parseInt(b[0] + b[1], 10), Number.parseInt(b[2], 10) - 1, Number.parseInt(b[3], 10), Number.parseInt(b[4], 10), Number.parseInt(b[5], 10), Number.parseInt(b[6], 10))));
        };
        this.adminBind = async ({ loggerContext, }) => this.adminBound ? true : this.onConnectAdmin({ loggerContext });
        this.domainName = options.name;
        this.hideSynchronization = (_a = options.hideSynchronization) !== null && _a !== void 0 ? _a : false;
        this.clientOpts = {
            url: options.url,
            tlsOptions: options.tlsOptions,
            socketPath: options.socketPath,
            log: options.log,
            timeout: options.timeout || 5000,
            connectTimeout: options.connectTimeout || 5000,
            idleTimeout: options.idleTimeout || 5000,
            reconnect: options.reconnect || true,
            strictDN: options.strictDN,
            queueSize: options.queueSize || 200,
            queueTimeout: options.queueTimeout || 5000,
            queueDisable: options.queueDisable || false,
        };
        this.bindDN = options.bindDN;
        this.bindCredentials = options.bindCredentials;
        this.adminClient = Ldap.createClient(this.clientOpts);
        this.adminBound = false;
        this.userClient = Ldap.createClient(this.clientOpts);
        this.adminClient.on('connectError', this.handleConnectError.bind(this));
        this.userClient.on('connectError', this.handleConnectError.bind(this));
        this.adminClient.on('error', this.handleErrorAdmin.bind(this));
        this.userClient.on('error', this.handleErrorUser.bind(this));
        if (options.reconnect) {
            this.once('installReconnectListener', () => {
                this.logger.debug({
                    message: `${options.name}: install reconnect listener`,
                    context: LdapDomain.name,
                    function: 'constructor',
                });
                this.adminClient.on('connect', () => this.onConnectAdmin({}));
            });
        }
        this.adminClient.on('connectTimeout', this.handleErrorAdmin.bind(this));
        this.userClient.on('connectTimeout', this.handleErrorUser.bind(this));
        if (options.groupSearchBase && options.groupSearchFilter) {
            if (typeof options.groupSearchFilter === 'string') {
                const { groupSearchFilter } = options;
                options.groupSearchFilter = (user) => {
                    var _a, _b;
                    return groupSearchFilter
                        .replace(/{{dn}}/g, ((_b = (_a = (options.groupDnProperty &&
                        user[options.groupDnProperty])) === null || _a === void 0 ? void 0 : _a.replace(/\(/, '\\(')) === null || _b === void 0 ? void 0 : _b.replace(/\)/, '\\)')) || 'undefined')
                        .replace(/{{username}}/g, user.sAMAccountName);
                };
            }
            this.getGroups = this.findGroups;
        }
        else {
            this.getGroups = async () => [];
        }
    }
    handleErrorAdmin(error) {
        if (`${error.code}` !== 'ECONNRESET') {
            this.logger.error({
                message: `${this.domainName}: admin emitted error: [${error.code}]`,
                error,
                context: LdapDomain.name,
                function: 'handleErrorAdmin',
            });
        }
        this.adminBound = false;
    }
    handleErrorUser(error) {
        if (`${error.code}` !== 'ECONNRESET') {
            this.logger.error({
                message: `${this.domainName}: user emitted error: [${error.code}]`,
                error,
                context: LdapDomain.name,
                function: 'handleErrorUser',
            });
        }
    }
    handleConnectError(error) {
        this.logger.error({
            message: `${this.domainName}: emitted error: [${error.code}]`,
            error,
            context: LdapDomain.name,
            function: 'handleConnectError',
        });
    }
    async onConnectAdmin({ loggerContext, }) {
        if (typeof this.bindDN === 'undefined' || this.bindDN === null) {
            this.adminBound = false;
            throw new Error(`${this.domainName}: bindDN is undefined`);
        }
        return new Promise((resolve, reject) => this.adminClient.bind(this.bindDN, this.bindCredentials, (error) => {
            if (error) {
                this.logger.error(Object.assign({ message: `${this.domainName}: bind error: ${error.toString()}`, error, context: LdapDomain.name, function: 'onConnectAdmin' }, loggerContext));
                this.adminBound = false;
                return reject(error);
            }
            this.adminBound = true;
            if (this.options.reconnect) {
                this.emit('installReconnectListener');
            }
            return resolve(true);
        }));
    }
    async search({ searchBase, options, loggerContext, }) {
        return this.adminBind({ loggerContext }).then(() => new Promise((resolve, reject) => this.adminClient.search(searchBase, options, (searchError, searchResult) => {
            if (searchError !== null) {
                return reject(searchError);
            }
            if (typeof searchResult !== 'object') {
                return reject(new Error(`The LDAP server has empty search: ${searchBase}, options=${JSON.stringify(options)}`));
            }
            const items = [];
            searchResult.on('searchEntry', (entry) => {
                const object = Object.keys(entry.object).reduce((accumulator, key) => {
                    let k = key;
                    if (key.endsWith(';binary')) {
                        k = key.replace(/;binary$/, '');
                    }
                    switch (k) {
                        case 'objectGUID':
                            return Object.assign(Object.assign({}, accumulator), { objectGUID: this.GUIDtoString(entry.object[key]) });
                        case 'dn':
                            return Object.assign(Object.assign({}, accumulator), { dn: entry.object[key].toLowerCase() });
                        case 'sAMAccountName':
                            return Object.assign(Object.assign({}, accumulator), { sAMAccountName: entry.object[key].toLowerCase() });
                        case 'whenCreated':
                        case 'whenChanged':
                            return Object.assign(Object.assign({}, accumulator), { [k]: this.dateFromString(entry.object[key]) });
                        default:
                    }
                    return Object.assign(Object.assign({}, accumulator), { [k]: entry.object[key] });
                }, {});
                items.push(Object.assign(Object.assign({}, object), { loginDomain: this.domainName }));
            });
            searchResult.on('error', (error) => {
                reject(error);
            });
            searchResult.on('end', (result) => {
                if (result.status !== 0) {
                    return reject(new Error(`non-zero status from LDAP search: ${result.status}`));
                }
                return resolve(items);
            });
            return undefined;
        })));
    }
    sanitizeInput(input) {
        return input
            .replace(/\*/g, '\\2a')
            .replace(/\(/g, '\\28')
            .replace(/\)/g, '\\29')
            .replace(/\\/g, '\\5c')
            .replace(/\0/g, '\\00')
            .replace(/\//g, '\\2f');
    }
    async findUser({ username, loggerContext, }) {
        if (!username) {
            throw new Error('empty username');
        }
        const searchFilter = this.options.searchFilter.replace(/{{username}}/g, this.sanitizeInput(username));
        const options = {
            filter: searchFilter,
            scope: this.options.searchScope,
            attributes: ldap_interface_1.ldapADattributes,
            timeLimit: this.options.timeLimit || 10,
            sizeLimit: this.options.sizeLimit || 0,
            paged: false,
        };
        if (this.options.searchAttributes) {
            options.attributes = this.options.searchAttributes;
        }
        return this.search({
            searchBase: this.options.searchBase,
            options,
            loggerContext,
        })
            .then((result) => new Promise((resolve, reject) => {
            if (!result) {
                return reject(new Ldap.NoSuchObjectError());
            }
            switch (result.length) {
                case 0:
                    return reject(new Ldap.NoSuchObjectError());
                case 1:
                    return resolve(result[0]);
                default:
                    return reject(new Error(`unexpected number of matches (${result.length}) for "${username}" username`));
            }
        }))
            .catch((error) => {
            this.logger.error(Object.assign({ message: `${this.domainName}: user search error: ${error.toString()}`, error, context: LdapDomain.name, function: 'findUser' }, loggerContext));
            throw error;
        });
    }
    async findGroups({ user, loggerContext, }) {
        if (!user) {
            throw new Error('no user');
        }
        const searchFilter = typeof this.options.groupSearchFilter === 'function'
            ? this.options.groupSearchFilter(user)
            : undefined;
        const options = {
            filter: searchFilter,
            scope: this.options.groupSearchScope,
            timeLimit: this.options.timeLimit || 10,
            sizeLimit: this.options.sizeLimit || 0,
            paged: false,
        };
        if (this.options.groupSearchAttributes) {
            options.attributes = this.options.groupSearchAttributes;
        }
        else {
            options.attributes = ldap_interface_1.ldapADattributes;
        }
        return this.search({
            searchBase: this.options.groupSearchBase || this.options.searchBase,
            options,
            loggerContext,
        }).catch((error) => {
            this.logger.error(Object.assign({ message: `${this.domainName}: group search error: ${error.toString()}`, error, context: LdapDomain.name, function: 'findGroups' }, loggerContext));
            return [];
        });
    }
    async searchByUsername({ username, loggerContext, }) {
        return this.findUser({ username, loggerContext }).catch((error) => {
            this.logger.error(Object.assign({ message: `${this.domainName}: Search by Username error: ${error.toString()}`, error, context: LdapDomain.name, function: 'searchByUsername' }, loggerContext));
            throw error;
        });
    }
    async searchByDN({ dn, loggerContext, }) {
        const options = {
            scope: this.options.searchScope,
            attributes: ['*'],
            timeLimit: this.options.timeLimit || 10,
            sizeLimit: this.options.sizeLimit || 0,
            paged: false,
        };
        if (this.options.searchAttributes) {
            options.attributes = this.options.searchAttributes;
        }
        return this.search({ searchBase: dn, options, loggerContext })
            .then((result) => new Promise((resolve, reject) => {
            if (!result) {
                return reject(new Error('No result from search'));
            }
            switch (result.length) {
                case 0:
                    return reject(new Ldap.NoSuchObjectError());
                case 1:
                    return resolve(result[0]);
                default:
                    return reject(new Error(`unexpected number of matches (${result.length}) for "${dn}" user DN`));
            }
        }))
            .catch((error) => {
            if (error instanceof Ldap.NoSuchObjectError) {
                throw error;
            }
            else {
                this.logger.error(Object.assign({ message: `${this.domainName}: Search by DN error: ${error.toString()}`, error, context: LdapDomain.name, function: 'searchByDN' }, loggerContext));
                throw error;
            }
        });
    }
    async synchronization({ loggerContext, }) {
        if (this.hideSynchronization) {
            return {};
        }
        const options = {
            filter: this.options.searchFilterAllUsers,
            scope: this.options.searchScopeAllUsers,
            attributes: ldap_interface_1.ldapADattributes,
            timeLimit: this.options.timeLimit || 10,
            sizeLimit: this.options.sizeLimit || 0,
            paged: true,
        };
        if (this.options.searchAttributesAllUsers) {
            options.attributes = this.options.searchAttributesAllUsers;
        }
        return this.search({
            searchBase: this.options.searchBase,
            options,
            loggerContext,
        })
            .then(async (sync) => {
            if (sync) {
                const usersWithGroups = await Promise.all(sync.map(async (user) => (Object.assign(Object.assign({}, user), { groups: await this.getGroups({
                        user: user,
                        loggerContext,
                    }) }))));
                return {
                    [this.domainName]: usersWithGroups,
                };
            }
            this.logger.error(Object.assign({ message: `${this.domainName}: Synchronize unknown error`, error: 'Unknown', context: LdapDomain.name, function: 'synchronization' }, loggerContext));
            return {
                [this.domainName]: new Error(`${this.domainName}: Synchronize unknown error`),
            };
        })
            .catch((error) => {
            this.logger.error(Object.assign({ message: `${this.domainName}: Synchronize error: ${error.toString()}`, error, context: LdapDomain.name, function: 'synchronization' }, loggerContext));
            return { [this.domainName]: error };
        });
    }
    async synchronizationGroups({ loggerContext, }) {
        const options = {
            filter: this.options.searchFilterAllGroups,
            scope: this.options.groupSearchScope,
            attributes: ldap_interface_1.ldapADattributes,
            timeLimit: this.options.timeLimit || 10,
            sizeLimit: this.options.sizeLimit || 0,
            paged: true,
        };
        if (this.options.groupSearchAttributes) {
            options.attributes = this.options.groupSearchAttributes;
        }
        return this.search({
            searchBase: this.options.searchBase,
            options,
            loggerContext,
        })
            .then((sync) => {
            if (sync) {
                return { [this.domainName]: sync };
            }
            this.logger.error(Object.assign({ message: `${this.domainName}: Synchronization groups: unknown error`, error: 'Unknown', context: LdapDomain.name, function: 'synchronizationGroups' }, loggerContext));
            return {
                [this.domainName]: new Error(`${this.domainName}: Synchronization groups: unknown error`),
            };
        })
            .catch((error) => {
            this.logger.error(Object.assign({ message: `${this.domainName}: Synchronization groups: ${error.toString()}`, error, context: LdapDomain.name, function: 'synchronizationGroups' }, loggerContext));
            return { [this.domainName]: error };
        });
    }
    async modify({ dn, data, username, password, loggerContext, }) {
        return this.adminBind({ loggerContext }).then(() => new Promise((resolve, reject) => {
            if (password) {
                this.userClient.bind(dn, password, (error) => {
                    data.forEach((d, i, a) => {
                        if (d.modification.type === 'thumbnailPhoto' ||
                            d.modification.type === 'jpegPhoto') {
                            a[i].modification.vals = '...skipped...';
                        }
                    });
                    if (error) {
                        this.logger.error(Object.assign({ message: `${this.domainName}: bind error: ${error.toString()}`, error, context: LdapDomain.name, function: 'modify' }, loggerContext));
                        return reject(error);
                    }
                    return this.userClient.modify(dn, data, async (searchError) => {
                        if (searchError) {
                            this.logger.error(Object.assign({ message: `${this.domainName}: Modify error "${dn}": ${searchError.toString()}`, error: searchError, context: LdapDomain.name, function: 'modify' }, loggerContext));
                            reject(searchError);
                        }
                        this.logger.debug(Object.assign({ message: `${this.domainName}: Modify success "${dn}"`, context: LdapDomain.name, function: 'modify' }, loggerContext));
                        resolve(true);
                    });
                });
            }
            else {
                this.adminClient.modify(dn, data, async (searchError) => {
                    data.forEach((d, i, a) => {
                        if (d.modification.type ===
                            'thumbnailPhoto' ||
                            d.modification.type === 'jpegPhoto') {
                            a[i].modification.vals =
                                '...skipped...';
                        }
                    });
                    if (searchError) {
                        this.logger.error(Object.assign({ message: `${this.domainName}: Modify error "${dn}": ${searchError.toString()}`, error: searchError, context: LdapDomain.name, function: 'modify' }, loggerContext));
                        reject(searchError);
                        return;
                    }
                    this.logger.debug(Object.assign({ message: `${this.domainName}: Modify success "${dn}": ${JSON.stringify(data)}`, context: LdapDomain.name, function: 'modify' }, loggerContext));
                    resolve(true);
                });
            }
        }));
    }
    async authenticate({ username, password, loggerContext, }) {
        if (!password) {
            this.logger.error(Object.assign({ message: `${this.domainName}: No password given`, error: 'No password given', context: LdapDomain.name, function: 'authenticate' }, loggerContext));
            throw new Error(`${this.domainName}: No password given`);
        }
        try {
            const foundUser = await this.findUser({
                username,
                loggerContext,
            }).catch((error) => {
                this.logger.error(Object.assign({ message: `${this.domainName}: Not found user: "${username}"`, error, context: LdapDomain.name, function: 'authenticate' }, loggerContext));
                throw error;
            });
            if (!foundUser) {
                this.logger.error(Object.assign({ message: `${this.domainName}: Not found user: "${username}"`, error: 'Not found user', context: LdapDomain.name, function: 'authenticate' }, loggerContext));
                throw new Error(`Not found user: "${username}"`);
            }
            return new Promise((resolve, reject) => {
                this.userClient.bind(foundUser[this.options.bindProperty || 'dn'], password, async (bindError) => {
                    if (bindError) {
                        this.logger.error(Object.assign({ message: `${this.domainName}: bind error: ${bindError.toString()}`, error: bindError, context: LdapDomain.name, function: 'authenticate' }, loggerContext));
                        return reject(bindError);
                    }
                    try {
                        foundUser.groups = await this.getGroups({
                            user: foundUser,
                            loggerContext,
                        });
                        return resolve(foundUser);
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error
                            ? error.toString()
                            : JSON.stringify(error);
                        this.logger.error(Object.assign({ message: `${this.domainName}: Authenticate error: ${errorMessage}`, error, context: LdapDomain.name, function: 'authenticate' }, loggerContext));
                        return reject(error);
                    }
                });
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.toString()
                : JSON.stringify(error);
            this.logger.error(Object.assign({ message: `${this.domainName}: LDAP auth error: ${errorMessage}`, error, context: LdapDomain.name, function: 'authenticate' }, loggerContext));
            throw error;
        }
    }
    async trustedDomain({ searchBase, loggerContext, }) {
        const options = {
            filter: '(&(objectClass=trustedDomain))',
            scope: this.options.searchScope,
            attributes: ldap_interface_1.ldapADattributes,
            timeLimit: this.options.timeLimit || 10,
            sizeLimit: this.options.sizeLimit || 0,
            paged: false,
        };
        const trustedDomain = await this.search({
            searchBase,
            options,
            loggerContext,
        });
        return trustedDomain;
    }
    async add({ entry, loggerContext, }) {
        return this.adminBind({ loggerContext }).then(() => new Promise((resolve, reject) => {
            if (!this.options.newObject) {
                throw new Error('ADD operation not available');
            }
            const dn = `uid=${this.sanitizeInput(entry.uid)},${this.sanitizeInput(this.options.newObject)}`;
            this.adminClient.add(dn, entry, (error) => {
                if (error) {
                    return reject(error);
                }
                return resolve(this.searchByDN({ dn, loggerContext }));
            });
        }));
    }
    async close() {
        return new Promise((resolve) => {
            this.adminClient.unbind(() => {
                this.logger.debug({
                    message: `${this.domainName}: adminClient: close`,
                    context: LdapDomain.name,
                    function: 'close',
                });
                this.userClient.unbind(() => {
                    this.logger.debug({
                        message: `${this.domainName}: userClient: close`,
                        context: LdapDomain.name,
                        function: 'close',
                    });
                    resolve(true);
                });
            });
        });
    }
}
exports.LdapDomain = LdapDomain;
//# sourceMappingURL=ldap.class.js.map