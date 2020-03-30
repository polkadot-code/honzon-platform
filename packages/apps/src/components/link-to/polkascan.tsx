import React, { FC, ReactNode } from 'react';

interface Props {
    extrinsic?: string;
    children: ReactNode;
}
const POLKASCAN_PREFIX = 'https://polkascan.io/pre/acala-mandala';
export const LinkToPolkascan: FC<Props> = props => {
    let link = '';

    // transaction
    if (props.extrinsic) {
        link = `${POLKASCAN_PREFIX}/extrinsic/${props.extrinsic}`;
    }
    return (
        <a href={link} target="_blank" rel="noopener noreferrer">
            {props.children}
        </a>
    );
};
