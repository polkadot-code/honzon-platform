import FixedU128 from './fixed_u128';

/**
 * requiredCollateralRatio = collateral * collateralPrice / debit * debitExchangeRate * stableCoinPrice
 */

const ZERO = FixedU128.fromNatural(0);

// convert debit to stable coin amount
export function debitToUSD(debit: FixedU128, debitExchangeRate: FixedU128, stableCoinPrice: FixedU128): FixedU128 {
    return debit.mul(debitExchangeRate).mul(stableCoinPrice);
}

// convert stable coin amount to debits
export function USDToDebit(
    stableValue: FixedU128,
    debitExchangeRate: FixedU128,
    stableCoinPrice: FixedU128,
): FixedU128 {
    if (stableCoinPrice.isZero() || debitExchangeRate.isZero()) {
        return ZERO;
    }
    return stableValue.div(stableCoinPrice).div(debitExchangeRate);
}

export function debitToStableCoin(debit: FixedU128, debitExchangeRate: FixedU128): FixedU128 {
    return debit.mul(debitExchangeRate);
}

export function stableCoinToDebit(amount: FixedU128, debitExchangeRate: FixedU128): FixedU128 {
    return amount.div(debitExchangeRate);
}

// convert collateral to stable coin amount
export function collateralToUSD(collateral: FixedU128, collateralPrice: FixedU128): FixedU128 {
    return collateral.mul(collateralPrice);
}

export function calcCollateralRatio(collateralAmount: FixedU128, debitAmount: FixedU128): FixedU128 {
    return collateralAmount.div(debitAmount);
}

const YEAR = 365 * 24 * 60 * 60; // second of one yera
export function calcStableFee(stableFee: FixedU128, blockTime: number): FixedU128 {
    return FixedU128.fromNatural((1 + stableFee.toNumber()) ** ((YEAR / blockTime) * 1000) - 1);
}

export function calcRequiredCollateral(
    debitAmount: FixedU128,
    requiredCollateralRatio: FixedU128,
    collateralPrice: FixedU128,
): FixedU128 {
    if (requiredCollateralRatio.isZero() || collateralPrice.isZero()) {
        return ZERO;
    }
    return debitAmount.mul(requiredCollateralRatio).div(collateralPrice);
}

export function calcCanGenerater(
    collateralAmount: FixedU128,
    debitAmount: FixedU128,
    requiredCollateralRatio: FixedU128,
    stableCoinPrice: FixedU128,
): FixedU128 {
    if (requiredCollateralRatio.isZero() || stableCoinPrice.isZero()) {
        return ZERO;
    }
    // sub 0.00001 to ensure generate success
    const result = collateralAmount
        .div(requiredCollateralRatio)
        .sub(debitAmount)
        .div(stableCoinPrice)
        .sub(FixedU128.fromNatural(0.00001));
    return result.isNaN() ? ZERO : result;
}

export function calcLiquidationPrice(
    collateral: FixedU128,
    debitAmount: FixedU128,
    liquidationRatio: FixedU128,
): FixedU128 {
    if (debitAmount.isZero()) {
        return ZERO;
    }
    return debitAmount.mul(liquidationRatio).div(collateral);
}

//TODO: need
const EXCHANGE_FEE = FixedU128.fromRational(1, 1000);

// (targetPool - targetPool * basePool / (basePool + baseAmount)) * (1 - EXCHANGE_FEE)
export function swapToTarget(baseAmount: FixedU128, targetPool: FixedU128, basePool: FixedU128): FixedU128 {
    if (targetPool.add(baseAmount).isZero()) {
        return ZERO;
    }

    const exchangeFee = FixedU128.fromNatural(1).sub(EXCHANGE_FEE);
    // calcault receive other amount
    const otherReceive = targetPool.sub(targetPool.mul(basePool).div(basePool.add(baseAmount)));
    return FixedU128.fromNatural(otherReceive.mul(exchangeFee).toNumber(8, 3));
}

// calc base
export function swapToBase(otherAmount: FixedU128, targetPool: FixedU128, basePool: FixedU128): FixedU128 {
    if (otherAmount.isZero()) {
        return ZERO;
    }
    // (targetPool * basePool / (targetPool - otherAmount) / (1 - EXCHANGE_FEE)) - basePool
    const exchangeFee = FixedU128.fromNatural(1).sub(EXCHANGE_FEE);
    return FixedU128.fromNatural(
        targetPool
            .mul(basePool)
            .div(targetPool.sub(otherAmount.div(exchangeFee)))
            .sub(basePool)
            .toNumber(8, 2),
    );
}
