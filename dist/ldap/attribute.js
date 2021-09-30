"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
const asn1_1 = require("asn1");
const protocol_1 = require("./protocol");
class Attribute {
    constructor(options = { type: '' }) {
        this.bufferEncoding = (type) => /;binary$/.test(type) ? 'base64' : 'utf8';
        this.addValue = (val) => {
            var _a, _b;
            if (Buffer.isBuffer(val)) {
                (_a = this._vals) === null || _a === void 0 ? void 0 : _a.push(val);
            }
            else {
                (_b = this._vals) === null || _b === void 0 ? void 0 : _b.push(Buffer.from(val, this.bufferEncoding(this.type)));
            }
        };
        this.parse = (ber) => {
            var _a;
            if (!ber) {
                throw new TypeError('ldapjs Attribute parse: ber is undefined');
            }
            ber.readSequence();
            this.type = ber.readString();
            if (ber.peek() === protocol_1.Protocol.LBER_SET) {
                if (ber.readSequence(protocol_1.Protocol.LBER_SET)) {
                    const end = ber.offset + ber.length;
                    while (ber.offset < end)
                        (_a = this._vals) === null || _a === void 0 ? void 0 : _a.push(ber.readString(asn1_1.Ber.OctetString, true));
                }
            }
            return true;
        };
        this.toString = () => JSON.stringify(this.json);
        this.toBer = (ber) => {
            var _a;
            if (!ber) {
                throw new TypeError('ldapjs Attribute toBer: ber is undefined');
            }
            ber.startSequence();
            ber.writeString(this.type);
            ber.startSequence(protocol_1.Protocol.LBER_SET);
            if ((_a = this._vals) === null || _a === void 0 ? void 0 : _a.length) {
                this._vals.forEach((b) => {
                    ber.writeByte(asn1_1.Ber.OctetString);
                    ber.writeLength(b.length);
                    for (let i = 0; i < b.length; i += 1)
                        ber.writeByte(b[i]);
                });
            }
            else {
                ber.writeStringArray([]);
            }
            ber.endSequence();
            ber.endSequence();
            return ber;
        };
        if (options.type && typeof options.type !== 'string') {
            throw new TypeError('options.type must be a string');
        }
        this.type = options.type || '';
        if (options.vals !== undefined && options.vals !== null) {
            this.vals = options.vals;
        }
    }
    get vals() {
        var _a;
        return (_a = this._vals) === null || _a === void 0 ? void 0 : _a.map((v) => v.toString(this.bufferEncoding(this.type)));
    }
    set vals(vals) {
        this._vals = [];
        if (Array.isArray(vals)) {
            vals.forEach((v) => {
                this.addValue(v);
            });
        }
        else {
            this.addValue(vals);
        }
    }
    get buffers() {
        return this._vals || {};
    }
    get json() {
        return {
            type: this.type,
            vals: this.vals,
        };
    }
}
exports.Attribute = Attribute;
Attribute.isAttribute = (attr) => {
    if (attr instanceof Attribute) {
        return true;
    }
    if (typeof attr.toBer === 'function' &&
        typeof attr.type === 'string' &&
        Array.isArray(attr.vals) &&
        attr.vals.filter((item) => typeof item === 'string' || Buffer.isBuffer(item)).length === attr.vals.length) {
        return true;
    }
    return false;
};
Attribute.compare = (a, b) => {
    if (!Attribute.isAttribute(a) || !Attribute.isAttribute(b)) {
        throw new TypeError('can only compare Attributes');
    }
    if (a.type < b.type)
        return -1;
    if (a.type > b.type)
        return 1;
    if (a.vals.length < b.vals.length)
        return -1;
    if (a.vals.length > b.vals.length)
        return 1;
    for (let i = 0; i < a.vals.length; i += 1) {
        if (a.vals[i] < b.vals[i])
            return -1;
        if (a.vals[i] > b.vals[i])
            return 1;
    }
    return 0;
};
//# sourceMappingURL=attribute.js.map