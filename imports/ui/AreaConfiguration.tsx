import React, { useState } from 'react';
import classNames from 'classnames';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MaskedInput from 'react-text-mask';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet'
import { Area } from '../api/areas';
import * as suncalc from 'suncalc';
import { Meteor } from 'meteor/meteor';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'block',
            flexWrap: 'wrap',
        },
        input: {
            marginTop: theme.spacing(1),
        },
        textField: {
            marginTop: theme.spacing(1),
            // marginLeft: theme.spacing(1),
            // marginRight: theme.spacing(1),
        },
        farOff: {
            marginTop: theme.spacing(5),
        },
        menu: {
            width: 200,
        },
        warning: {
            padding: theme.spacing(1),
            backgroundColor: 'yellow',
            marginTop: theme.spacing(3),
            marginBottom: -1 * theme.spacing(4),
        }
    }),
);

function TimeMaskInput(props) {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
            {...other}
            ref={(ref: any) => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={[/[0-2]/, /\d/, ':', /[0-5]/, /\d/]}
        />
    );
}

function TimeMaskedTextField(props) {
    return (
        <TextField
            id={props.name}
            error={!!props.value && !/^([0-1][0-9]|2[0-4]):([0-5][0-9])$/.test(props.value)}
            placeholder="00:00"
            {...props}
            InputProps={{
                inputComponent: TimeMaskInput as any,
            }}
        />
    )
}

const AreaConfiguration = (props) => {
    const classes = useStyles({});

    let area: Area = props.area;

    let sunTimes = suncalc.getTimes(new Date(), area.latitude, area.longitude);

    let [timeOn, setTimeOn] = useState(area.schedule.timeOn);
    let [timeOff, setTimeOff] = useState(area.schedule.timeOff);
    let [outageOn, setOutageOn] = useState(area.schedule.outageOn);
    let [outageOff, setOutageOff] = useState(area.schedule.outageOff);

    let [startMode, setStartMode] = useState(timeOn === 'auto' ? 'auto' : 'manual');
    let [endMode, setEndMode] = useState(timeOff === 'auto' ? 'auto' : 'manual');

    let hasChanged = area.schedule.timeOn !== timeOn ||
        area.schedule.timeOff != timeOff ||
        area.schedule.outageOn !== outageOn ||
        area.schedule.outageOff !== outageOff ||
        startMode !== (area.schedule.timeOn === 'auto' ? 'auto' : 'manual') ||
        endMode !== (area.schedule.timeOff === 'auto' ? 'auto' : 'manual');

    function onSubmit(ev: Event) {
        ev.preventDefault();

        const schedule = {
            timeOn: startMode === 'auto' ? startMode : timeOn,
            timeOff: endMode === 'auto' ? endMode : timeOff,
            outageOn,
            outageOff,
        };

        Meteor.call('areas.updateSchedule', area._id, schedule);
    }

    return (
        <form autoComplete="off" className={classes.container} onSubmit={onSubmit}>
            <Typography variant="h6">Auto Konfiguration</Typography>
            <FormControl fullWidth className={classes.input}>
                <InputLabel htmlFor="startMode">Start</InputLabel>
                <Select value={startMode} inputProps={{ name: 'startMode', id: 'startMode' }} onChange={ev => setStartMode(ev.target.value)}>
                    <MenuItem value="auto">Sonnenuntergang</MenuItem>
                    <MenuItem value="manual">Manuel</MenuItem>
                </Select>
            </FormControl>

            {startMode === 'manual' ? (<TimeMaskedTextField
                fullWidth
                name="timeOn"
                label="Startzeit"
                className={classes.textField}
                value={timeOn}
                onChange={ev => setTimeOn(ev.target.value)}
            />) : ''}

            <TimeMaskedTextField
                fullWidth
                name="outageOn"
                label="Start Pause"
                className={classNames(classes.textField, classes.farOff)}
                value={outageOn}
                onChange={ev => setOutageOn(ev.target.value)}
            />

            <TimeMaskedTextField
                fullWidth
                name="outageOff"
                label="Ende Pause"
                className={classes.textField}
                value={outageOff}
                onChange={ev => setOutageOff(ev.target.value)}
            />

            <FormControl fullWidth className={classNames(classes.textField, classes.farOff)}>
                <InputLabel htmlFor="endMode">Ende</InputLabel>
                <Select value={endMode} inputProps={{ name: 'endMode', id: 'endMode' }} onChange={ev => setEndMode(ev.target.value)}>
                    <MenuItem value="auto">Sonnenaufgang</MenuItem>
                    <MenuItem value="manual">Manuel</MenuItem>
                </Select>
            </FormControl>

            {endMode === 'manual' ? (<TimeMaskedTextField
                fullWidth
                name="timeOff"
                label="Endzeit"
                className={classes.textField}
                value={timeOff}
                onChange={ev => setTimeOff(ev.target.value)}
            />) : ''}

            {props.error ? <Typography className={classes.warning} variant="body2">{props.error}</Typography> : ''}

            <Typography align="right">
                <Button disabled={!hasChanged} type="submit" variant="outlined" color="secondary" className={classes.farOff}>Senden</Button>
            </Typography>

            <Map center={[area.latitude, area.longitude]} zoom={13} style={{ width: '100%', height: 200, marginTop: 8 }}>
                <TileLayer size=""
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/*https://github.com/PaulLeCam/react-leaflet/issues/453*/}
                <Marker position={[area.latitude, area.longitude]}>

                    <Popup>
                        {props.devices.length} Geräte in diesem Bereich
                    </Popup>
                </Marker>

                {props.devices
                    .filter(device => device.latitude && device.longitude)
                    .map(device => <Marker key={device._id} position={[device.latitude, device.longitude]}>
                        <Popup>
                            <h3>{device.title || device.name}</h3>
                            {device.name} - {device._id}
                        </Popup>
                    </Marker>)}
            </Map>

            <Typography variant="body2" color="textSecondary">
                Latitude: {area.latitude}<br />
                Longitude: {area.longitude}<br />
                Sonnenuntergang: {(new Date(sunTimes.sunsetStart)).toLocaleTimeString()}<br />
                Sonnenaufgang: {(new Date(sunTimes.sunriseEnd)).toLocaleTimeString()}
            </Typography>

        </form>
    )
}

export default AreaConfiguration;