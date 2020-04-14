import { Button, Paper, TextField, Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { Redirect, useParams } from 'react-router-dom';
import { AreaCollection } from '../api/areas';

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

function Form({area, error, processing, onSubmit}) {

    const [name, setName] = useState(area.name);
    const [latitude, setLatitude] = useState(area.latitude);
    const [longitude, setLongitude] = useState(area.longitude);

    return (
        <form onSubmit={(ev) => {
            ev.preventDefault();

            onSubmit({name, latitude, longitude});
        }}>
            <TextField disabled={processing} fullWidth margin="normal" label="Area name" value={name} onChange={ev => setName(ev.target.value)} required />

            <Map
                center={[latitude, longitude]}
                onclick={ev => { setLatitude(ev.latlng.lat); setLongitude(ev.latlng.lng) }}
                zoom={13}
                style={{ width: '100%', height: 400, marginTop: 8 }}>
                <TileLayer size=""
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[latitude, longitude]} />
            </Map>

            <Typography align="right">
                <Button disabled={processing} type="submit" variant="outlined" color="primary">Speichern</Button>
            </Typography>

            {error && <Alert severity="warning">{error}</Alert>}
        </form>
    );
}

function EditArea({ area }) {
    const classes = useStyles({});

    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    if (!area) {
        return <p>Waiting...</p>;
    }

    function onSubmit(document) {
        setProcessing(true);

        Meteor.call('areas.update', area._id, document, (err, _id) => {
            if (err) {
                setError(err.toString());
                setProcessing(false);

                console.warn('Error while updating area', err);
            }

            setDone(true);
        });
    }

    return (
        done ? <Redirect to={`/panel/area/${area._id}`} /> :
            <Container maxWidth="md" className={classes.container}>
                <Grid container spacing={3}>
                    <Grid item md={8} xs={12}>
                        <Paper className={classes.paper}>
                            <Form area={area} error={error} processing={processing} onSubmit={onSubmit} />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
    )
}

const EditAreaTracker = withTracker(({ _id }) => {
    return {
        area: AreaCollection.findOne({ _id }),
    }
})(EditArea);

export default function () {
    const { areaId } = useParams();

    return <EditAreaTracker _id={areaId} />;
}