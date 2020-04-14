import { Button, Paper, TextField, Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { Redirect } from 'react-router-dom';

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

export default function NewArea() {
    const classes = useStyles({});

    const [processing, setProcessing] = useState(false);
    const [newId, setNewId] = useState('');
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [latitude, setLatitude] = useState(47.674635091761616);
    const [longitude, setLongitude] = useState(9.50868574758178);

    function onSubmit(ev: Event) {
        ev.preventDefault();

        setProcessing(true);

        const document = { name, latitude, longitude };

        Meteor.call('areas.insert', document, (err, _id) => {
            if (err) {
                setError(err.toString());
                console.warn('Error while creating area', err);
            }

            console.log('new id 2', _id)

            setNewId(_id);
        });
    }

    return (
        newId ? <Redirect to={`/panel/area/${newId}`} /> :
            <Container maxWidth="md" className={classes.container}>
                <Grid container spacing={3}>
                    <Grid item md={8} xs={12}>
                        <Paper className={classes.paper}>
                            <form onSubmit={onSubmit}>
                                <TextField disabled={processing} fullWidth margin="normal" label="Area name" value={name} onChange={ev => setName(ev.target.value)} required />

                                <Map
                                    center={[latitude, longitude]}
                                    onclick={ev => { setLatitude(ev.latlng.lat); setLongitude(ev.latlng.lng) }}
                                    zoom={13}
                                    style={{ width: '100%', height: 400, marginTop: 8, marginBottom: 16 }}>
                                    <TileLayer size=""
                                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                        <Marker position={[latitude, longitude]} />
                                </Map>

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