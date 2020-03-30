import React from 'react';
import { Dialog, DialogContent, Button, DialogActions, Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import { useTranslate } from '@honzon-platform/apps/hooks/i18n';

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props { open: boolean }
export const NetWorkError: React.FC<Props> = ({ open }) => {
    const { t } = useTranslate();
    const handleRetry = () => {
        window.location.reload();
    };
    return (
        <Dialog open={open} TransitionComponent={Transition}>
            <DialogContent>
                {t('Connect To Endpoint Failed, Please Check Your NetWork Status!')}
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={handleRetry}>
                    Retry
                </Button>
            </DialogActions>
        </Dialog>
    );
};