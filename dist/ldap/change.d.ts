import { BerWriter, BerReader } from 'asn1';
import { Attribute } from './attribute';
export declare class Change {
    private _modification;
    private _operation?;
    get operation(): 'add' | 'delete' | 'replace';
    set operation(value: 'add' | 'delete' | 'replace');
    get modification(): Attribute | Record<string, any>;
    set modification(value: Attribute | Record<string, any>);
    constructor(options?: Record<string, any>);
    isChange: (change: Change | Record<string, any>) => boolean;
    compare: (a: Change | Record<string, any>, b: Change | Record<string, any>) => number;
    apply: (change: Record<string, any> | undefined, object: Record<string, any>, scalar: any) => any;
    parse: (ber?: BerReader | undefined) => boolean;
    toBer: (ber?: BerWriter | undefined) => BerWriter;
    json: () => Record<string, any>;
}
