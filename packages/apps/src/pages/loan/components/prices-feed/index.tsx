import React, { memo } from 'react';
import { Typography, List, ListItem, Grid } from '@material-ui/core';
import { useTranslate } from '@honzon-platform/apps/hooks/i18n';
import Card from '@honzon-platform/apps/components/card';
import { formatPrice } from '@honzon-platform/apps/components/formatter';
import Skeleton from '@material-ui/lab/Skeleton';
import { BaseProps } from '@honzon-platform/apps/types/react-component/props';
import { useApi } from '@honzon-platform/hooks/useApi';
import { useCall } from '@honzon-platform/hooks/useCall';
import { currentPrices } from '@honzon-platform/api-deriver/price';
import { pricesConvertor } from '@honzon-platform/apps/convertor/prices';

const PricesFeed: React.FC<BaseProps> = memo(({ className, style }) => {
    const { t } = useTranslate();
    const api = useApi();
    const { data } = useCall<ReturnType<typeof pricesConvertor>>(
        currentPrices(api) as any,
        { formatter: pricesConvertor }
    );

    if (!data || !data.length) {
        return <Skeleton variant="rect" height={240} />;
    }

    return (
        <Card
            size="normal"
            elevation={1}
            header={<Typography variant="subtitle1">{t('Price Feed')}</Typography>}
            className={className}
            style={style}
        >
            <List disablePadding>
                {data.map(({ asset, price }) => (
                    <ListItem disableGutters key={`feed-prices-${asset}`}>
                        <Grid container justify="space-between">
                            <Typography variant="body2">{t('{{asset}} in USD', { asset })}</Typography>
                            <Typography variant="body2">{formatPrice(price)}</Typography>
                        </Grid>
                    </ListItem>
                ))}
            </List>
        </Card>
    );
});

export default PricesFeed;
