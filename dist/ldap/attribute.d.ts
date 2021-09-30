/// <reference types="node" />
import { BerWriter, BerReader } from 'asn1';
export declare class Attribute {
    _vals?: Record<string, any>;
    type: string;
    get vals(): string | Buffer;
    set vals(vals: string | Buffer);
    get buffers(): Record<any, any>;
    get json(): Record<string, any>;
    constructor(options?: Record<string, any>);
    bufferEncoding: (type: string) => 'base64' | 'utf8';
    addValue: (val: Buffer | string) => void;
    static isAttribute: (attr: Attribute | Record<string, unknown>) => attr is Attribute;
    static compare: (a: Attribute | Record<string, any>, b: Attribute | Record<string, any>) => number;
    parse: (ber?: BerReader | undefined) => boolean;
    toString: () => string;
    toBer: (ber?: BerWriter | undefined) => BerWriter;
}
