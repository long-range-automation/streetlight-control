import React from 'react';
import Device from './Device';

const DeviceList = ({ devices }) => {
    return (
        <div>
            {devices.map(device => (
                <Device key={device._id} device={device} />
            ))}
        </div>
    )
}

export default DeviceList;