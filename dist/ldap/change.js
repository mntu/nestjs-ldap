"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Change = void 0;
const attribute_1 = require("./attribute");
class Change {
    constructor(options = { operation: 'add' }) {
        this.isChange = (change) => {
            if (!change || typeof change !== 'object') {
                return false;
            }
            if (change instanceof Change ||
                (typeof change.toBer === 'function' &&
                    change.modification !== undefined &&
                    change.operation !== undefined)) {
                return true;
            }
            return false;
        };
        this.compare = (a, b) => {
            if (!this.isChange(a) || !this.isChange(b)) {
                throw new TypeError('can only compare Changes');
            }
            if (a.operation < b.operation)
                return -1;
            if (a.operation > b.operation)
                return 1;
            return attribute_1.Attribute.compare(a.modification, b.modification);
        };
        this.apply = (change = {
            operation: 'add',
            modification: { type: '' },
        }, object, scalar) => {
            const { type } = change.modification;
            const { vals } = change.modification;
            let data = object[type];
            if (data !== undefined) {
                if (!Array.isArray(data)) {
                    data = [data];
                }
            }
            else {
                data = [];
            }
            switch (change.operation) {
                case 'replace':
                    if (vals.length === 0) {
                        delete object[type];
                        return object;
                    }
                    data = vals;
                    break;
                case 'add': {
                    const newValues = vals.filter((entry) => !data.includes(entry));
                    data = data.concat(newValues);
                    break;
                }
                case 'delete':
                    data = data.filter((entry) => !vals.includes(entry));
                    if (data.length === 0) {
                        delete object[type];
                        return object;
                    }
                    break;
                default:
                    break;
            }
            if (scalar && data.length === 1) {
                object[type] = data[0];
            }
            else {
                object[type] = data;
            }
            return object;
        };
        this.parse = (ber) => {
            if (!ber) {
                return false;
            }
            ber.readSequence();
            this._operation = ber.readEnumeration();
            this._modification = new attribute_1.Attribute();
            this._modification.parse(ber);
            return true;
        };
        this.toBer = (ber) => {
            var _a;
            if (!ber) {
                throw new TypeError('ldapjs Change toBer: ber is undefined');
            }
            ber.startSequence();
            ber.writeEnumeration(this._operation || 0x00);
            ber = (_a = this._modification) === null || _a === void 0 ? void 0 : _a.toBer(ber);
            ber.endSequence();
            return ber;
        };
        this.json = () => ({
            operation: this.operation,
            modification: this._modification ? this._modification.json : {},
        });
        this._modification = new attribute_1.Attribute();
        this.operation = options.operation || options.type || 'add';
        this.modification = options.modification || {};
    }
    get operation() {
        var _a;
        switch (this._operation) {
            case 0x00:
                return 'add';
            case 0x01:
                return 'delete';
            case 0x02:
                return 'replace';
            default:
                throw new Error(`0x${(_a = this._operation) === null || _a === void 0 ? void 0 : _a.toString(16)} is invalid`);
        }
    }
    set operation(value) {
        switch (value) {
            case 'add':
                this._operation = 0x00;
                break;
            case 'delete':
                this._operation = 0x01;
                break;
            case 'replace':
                this._operation = 0x02;
                break;
            default:
                throw new Error(`Invalid operation type: 0x${Number(value).toString(16)}`);
        }
    }
    get modification() {
        return this._modification;
    }
    set modification(value) {
        if (attribute_1.Attribute.isAttribute(value)) {
            this._modification = value;
            return;
        }
        if (Object.keys(value).length === 2 &&
            typeof value.type === 'string' &&
            Array.isArray(value.vals)) {
            this._modification = new attribute_1.Attribute({
                type: value.type,
                vals: value.vals,
            });
            return;
        }
        const keys = Object.keys(value);
        if (keys.length > 1) {
            throw new Error('Only one attribute per Change allowed');
        }
        else if (keys.length === 0) {
            return;
        }
        const k = keys[0];
        const _attribute = new attribute_1.Attribute({ type: k });
        if (Array.isArray(value[k])) {
            value[k].forEach((v) => {
                _attribute.addValue(v);
            });
        }
        else if (Buffer.isBuffer(value[k])) {
            _attribute.addValue(value[k]);
        }
        else if (value[k] !== undefined && value[k] !== null) {
            _attribute.addValue(value[k]);
        }
        this._modification = _attribute;
    }
}
exports.Change = Change;
//# sourceMappingURL=change.js.map