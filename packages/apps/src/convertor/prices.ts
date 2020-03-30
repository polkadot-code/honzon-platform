import { DerivedPrice, DerivedRawPrice } from "api-deriver/src/types/price";
import FixedU128 from "../utils/fixed_u128";

export function rawPriceConvertor(origin: DerivedRawPrice) {
    // FIXME: need fix type parse 
    const _value = origin.value.toJSON() || {};
    return {
        asset: origin.asset,
        timestamp: new Date((_value as any).timestamp),
        price: (_value as any).value || '0'
    }
}

export function pricesConvertor (origin: DerivedPrice[]) {
    return origin.map(item => {
        // FIXME: need fix type parse 
        const _value = item.value.toJSON() || {};
        return {
            asset: item.asset,
            price: FixedU128.fromParts(typeof(_value) === 'string' ? _value : ((_value as any).value || '0'))
        }
    })
}