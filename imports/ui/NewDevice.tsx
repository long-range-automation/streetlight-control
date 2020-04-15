import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Paper, TextField, Typography, Button } from '@material-ui/core';
import { useParams, Redirect } from 'react-router-dom';
import { DeviceCollection, DeviceDocument } from '../api/devices';
import Alert from '@material-ui/lab/Alert';
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

export default function NewDevice() {
    const classes = useStyles({});

    const { areaId } = useParams();

    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [relayNames, setRelayNames] = useState(['', '', '', '']);

    function onSubmit(ev: Event) {
        ev.preventDefault();

        setProcessing(true);

        let device = DeviceCollection.findOne(id);

        if (device) {
            setError('Device with this id already exists.');
            setProcessing(false);

            return;
        }

        const document = { _id: id, name, title, description, areaId, relayNames };

        Meteor.call('devices.insert', document, (err) => {
            if (err) console.warn('Error while updating device', err);

            setDone(true);
        });
    }

    return (
        done ? <Redirect to={`/panel/area/${areaId}`} /> :
            <Container maxWidth="md" className={classes.container}>
                <Grid container spacing={3}>
                    <Grid item md={8} xs={12}>
                        <Paper className={classes.paper}>
                            <form onSubmit={onSubmit}>
                                <TextField disabled={processing} fullWidth margin="normal" label="Id" value={id} onChange={ev => { setId(ev.target.value); setError('') }} required />

                                <TextField disabled={processing} fullWidth margin="normal" label="Device name" value={name} onChange={ev => setName(ev.target.value)} required />

                                <TextField disabled={processing} fullWidth margin="normal" label="Title" value={title} onChange={ev => setTitle(ev.target.value)} required />

                                <TextField disabled={processing} fullWidth margin="normal" label="Description" multiline rows="4" value={description} onChange={ev => setDescription(ev.target.value)} required />

                                {relayNames.map((name, index) => {
                                    return <TextField required disabled={processing} key={index} fullWidth margin="normal" label={`Relay ${index + 1}`} value={name} onChange={ev => {
                                        let names = [...relayNames];
                                        names[index] = ev.target.value;

                                        setRelayNames(names);
                                    }} />
                                })}

                                <Typography align="right">
                                    <Button disabled={processing} type="submit" variant="outlined" color="primary">Hinzufügen</Button>
                                </Typography>

                                {error && <Alert severity="warning">{error}</Alert>}
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
    )
}