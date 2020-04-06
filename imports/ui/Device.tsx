import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ErrorIcon from '@material-ui/icons/Error';
import Relay from './Relay';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import { Device as IDevice, DeviceCollection } from '../api/devices';
import Moment from 'react-moment';
import { TableFooter } from '@material-ui/core';
import Countdown from './Countdown';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

const MAX_NUMBER_OF_RELAYS = 4;

const Table = withStyles(theme => ({
    root: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
    },
}))(MuiTable);

const ExpansionPanelSummary = withStyles(theme => ({
    root: {
        //   backgroundColor: theme.palette.primary.light,
    },
}))(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        display: 'block'
    },
}))(MuiExpansionPanelDetails);

const Device = (props) => {
    let device: IDevice = props.device;

    if (!device) {
        return <p>Loading....</p>;
    }

    let [requestedRelayMode, setRequestedRelayMode] = useState(device.requestedRelayMode);
    let updateNeeded = device.relayMode !== device.requestedRelayMode || device.targetChecksum !== device.remoteChecksum;

    let offset: string;

    if (typeof device.timeOffset !== 'number') {
        offset = '?';
    } else if (device.timeOffset < 0) {
        offset = 'Gerät hat keine Zeit';
    } else {
        offset = device.timeOffset + ' Minuten';
    }

    let errors = [];

    if (device.timeOffset > 5) {
        errors.push('offset');
    }

    let secondsSinceLastContact = Math.round(((new Date()).getTime() - (new Date(device.lastSeen)).getTime()) / 1000);

    if (secondsSinceLastContact > (3 * 60 * device.nextWindowOffset)) {
        errors.push('silence');
    }

    function updateRelayMode(index, mode) {
        const clearMask = (Math.pow(2, (2 * MAX_NUMBER_OF_RELAYS)) - 1) ^ (3 << (2 * index));
        const relayModeCleared = requestedRelayMode & clearMask;
        const newRelayMode = relayModeCleared + (mode << (2 * index));

        setRequestedRelayMode(newRelayMode);
    }

    function submitRelayMode() {
        Meteor.call('devices.updateRequestedRelayMode', device._id, requestedRelayMode);
    }

    return (
        <ExpansionPanel defaultExpanded={true}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                {errors.length > 0 && <ErrorIcon style={{ marginRight: 5, color: 'red', position: 'relative', top: '3px' }} />}
                <Typography variant="h6">{device.title || device.name}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Typography variant="body1">{device.description}</Typography>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Zustand</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {device.relayNames.map((name, index) => (
                            <Relay
                                key={index}
                                name={name}
                                state={(device.relayState & (1 << index)) === (1 << index)}
                                mode={(requestedRelayMode >> (2 * index)) & 3}
                                isMaintenance={false}
                                onSwitch={mode => updateRelayMode(index, mode)} />
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell style={{ border: 0 }}>
                                <Link to={`/panel/device/${device._id}/edit`}>Bearbeiten</Link>
                            </TableCell>
                            <TableCell style={{ border: 0 }}>
                            </TableCell>
                            <TableCell style={{ border: 0 }} align="right">
                                <Button onClick={() => submitRelayMode()} disabled={device.requestedRelayMode === requestedRelayMode} variant="outlined" color="secondary" size="small">Senden</Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>

                <Typography variant="body2" color="textSecondary">
                    Letzte Aktivität: {device.lastSeen ? <Moment fromNow>{device.lastSeen}</Moment> : '?'}{errors.indexOf('silence') > -1 && <ErrorIcon style={{ marginLeft: 5, color: 'red', position: 'relative', top: '3px', width: '0.8em' }} />}<br />
                    Nächstes Empfangsfenster: {device.nextWindow ? <Countdown date={device.nextWindow}></Countdown> : '?'}<br />
                    Wartung: {device.isMaintenance ? 'Ja' : 'Nein'}<br />
                    GPS Signal: {device.hasGPSSignal ? 'Ja' : 'Nein'}<br />
                    Konfiguration:  {updateNeeded ? 'Überholt' : 'Aktuell'}<br />
                    Zeitverschiebung: {offset}{errors.indexOf('offset') > -1 && <ErrorIcon style={{ marginLeft: 5, color: 'red', position: 'relative', top: '3px', width: '0.8em' }} />}<br />
                    Geräte-Id: {device._id}<br />
                    Gerätename: {device.name}<br />
                    Koordinaten: {(device.longitude && device.latitude) ? <a href={`https://www.openstreetmap.org/?mlat=${device.latitude}&mlon=${device.longitude}#map=8/${device.latitude}/${device.longitude}`}>{device.latitude} {device.longitude}</a> : 'Unbekannt'}</Typography>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
}

export default Device;
