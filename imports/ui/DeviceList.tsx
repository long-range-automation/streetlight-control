import React from 'react';
import Device from './Device';
import { Paper, Typography } from '@material-ui/core';

const DeviceList = ({ devices }) => {
    return (
        <div>
            {devices.length === 0 && <Typography variant="body2">Noch keine Geräte vorhanden.</Typography>}
            {devices.map(device => (
                <Device key={device._id} device={device} />
            ))}
        </div>
    )
}

export default DeviceList;