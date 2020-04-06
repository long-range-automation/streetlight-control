import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Paper, TextField, Typography, Button } from '@material-ui/core';
import { useParams, Redirect } from 'react-router-dom';
import { DeviceCollection, Device } from '../api/devices';
import { Meteor } from 'meteor/meteor';

const useStyles = makeStyles(theme => ({
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(3),
        marginTop: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
}));

function Form({ device, onSubmit, processing }) {
    let [title, setTitle] = useState(device.title || '');
    let [description, setDescription] = useState(device.description || '');
    let [relayNames, setRelayNames] = useState(device.relayNames || []);

    return <form onSubmit={(ev) => onSubmit(ev, { title, description, relayNames })}>
        <TextField disabled={processing} fullWidth margin="normal" label="Title" value={title} onChange={ev => setTitle(ev.target.value)} />

        <TextField disabled={processing} fullWidth margin="normal" label="Description" multiline rows="4" value={description} onChange={ev => setDescription(ev.target.value)} />

        {relayNames.map((name, index) => {
            return <TextField disabled={processing} key={index} fullWidth margin="normal" label={`Relay ${index + 1}`} value={name} onChange={ev => {
                let names = [...relayNames];
                names[index] = ev.target.value;

                setRelayNames(names);
            }} />
        })}

        <Typography align="right">
            <Button disabled={processing} type="submit" variant="outlined" color="primary">Speichern</Button>
        </Typography>
    </form>;
}

function EditDevice(props: { _id: string, device: Device }) {
    const classes = useStyles({});

    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);

    if (!props.device) {
        console.log('Waiting')
        return <p>Waiting...</p>;
    }

    function onSubmit(ev, document) {
        ev.preventDefault();

        setProcessing(true);

        Meteor.call('devices.update', props._id, document, (err) => {
            if (err) console.warn('Error while updating device', err);

            setDone(true);
        });
    }

    console.log('device.areaId', props.device.areaId);

    return (
        done ? <Redirect to={`/panel/area/${props.device.areaId}`} /> :
            <Container maxWidth="md" className={classes.container}>
                <Grid container spacing={3}>
                    <Grid item md={8} xs={12}>
                        <Paper className={classes.paper}>
                            <Form device={props.device} onSubmit={onSubmit} processing={processing} />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
    )
}

const EditDeviceTracker = withTracker(({ _id }) => {
    console.log('device', _id, DeviceCollection.findOne({ _id }));

    return {
        device: DeviceCollection.findOne({ _id }),
    }
})(EditDevice);

export default function () {
    const { deviceId } = useParams();

    console.log('params', useParams());

    return <EditDeviceTracker _id={deviceId} />;
}