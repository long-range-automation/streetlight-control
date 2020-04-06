import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import MuiToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

enum RelayMode { Off, On, Auto }

const ToggleButtonOff = withStyles(theme => ({
    root: {

    },
    selected: {
        backgroundColor: '#da5151c7 !important',
    },
}))(MuiToggleButton);

const ToggleButtonOn = withStyles(theme => ({
    root: {

    },
    selected: {
        backgroundColor: '#5dc551c7 !important',
    },
}))(MuiToggleButton);

const ToggleButtonAuto = withStyles(theme => ({
    root: {

    },
    selected: {
        backgroundColor: '#51c0dac7 !important',
    },
}))(MuiToggleButton);

const Relay = (props) => {
    let name: string = props.name;
    let mode: RelayMode = props.mode;
    let state: boolean = props.state;
    let isMaintenace: boolean = props.isMaintenance;

    return (
        <TableRow key={name}>
            <TableCell scope="row">
                {name}
            </TableCell>
            <TableCell>
                {state ? 'An ' : 'Aus '}
            </TableCell>
            <TableCell align="right">
                <ToggleButtonGroup size="small" value={mode} exclusive onChange={(ev, value) => props.onSwitch(value)}>
                    <ToggleButtonOff disabled={isMaintenace} value={RelayMode.Off}>
                        aus
                    </ToggleButtonOff>
                    <ToggleButtonAuto disabled={isMaintenace} value={RelayMode.Auto}>
                        auto
                    </ToggleButtonAuto>
                    <ToggleButtonOn disabled={isMaintenace} value={RelayMode.On}>
                        an
                    </ToggleButtonOn>
                </ToggleButtonGroup>
            </TableCell>
        </TableRow>
    )
}

export default Relay;