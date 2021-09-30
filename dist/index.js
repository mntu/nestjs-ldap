"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapService = exports.LdapModule = exports.Protocol = exports.Attribute = exports.Change = exports.OperationsError = exports.ProtocolError = exports.NoSuchAttributeError = exports.NoSuchObjectError = exports.EntryAlreadyExistsError = exports.InvalidCredentialsError = exports.InsufficientAccessRightsError = void 0;
var ldapjs_1 = require("ldapjs");
Object.defineProperty(exports, "InsufficientAccessRightsError", { enumerable: true, get: function () { return ldapjs_1.InsufficientAccessRightsError; } });
Object.defineProperty(exports, "InvalidCredentialsError", { enumerable: true, get: function () { return ldapjs_1.InvalidCredentialsError; } });
Object.defineProperty(exports, "EntryAlreadyExistsError", { enumerable: true, get: function () { return ldapjs_1.EntryAlreadyExistsError; } });
Object.defineProperty(exports, "NoSuchObjectError", { enumerable: true, get: function () { return ldapjs_1.NoSuchObjectError; } });
Object.defineProperty(exports, "NoSuchAttributeError", { enumerable: true, get: function () { return ldapjs_1.NoSuchAttributeError; } });
Object.defineProperty(exports, "ProtocolError", { enumerable: true, get: function () { return ldapjs_1.ProtocolError; } });
Object.defineProperty(exports, "OperationsError", { enumerable: true, get: function () { return ldapjs_1.OperationsError; } });
var change_1 = require("./ldap/change");
Object.defineProperty(exports, "Change", { enumerable: true, get: function () { return change_1.Change; } });
var attribute_1 = require("./ldap/attribute");
Object.defineProperty(exports, "Attribute", { enumerable: true, get: function () { return attribute_1.Attribute; } });
var protocol_1 = require("./ldap/protocol");
Object.defineProperty(exports, "Protocol", { enumerable: true, get: function () { return protocol_1.Protocol; } });
var ldap_module_1 = require("./ldap.module");
Object.defineProperty(exports, "LdapModule", { enumerable: true, get: function () { return ldap_module_1.LdapModule; } });
var ldap_service_1 = require("./ldap.service");
Object.defineProperty(exports, "LdapService", { enumerable: true, get: function () { return ldap_service_1.LdapService; } });
__exportStar(require("./ldap.interface"), exports);
//# sourceMappingURL=index.js.map