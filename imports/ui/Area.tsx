import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Paper } from '@material-ui/core';
import { AreaCollection } from '../api/areas';
import { useParams, Link, useLocation } from 'react-router-dom';
import { DeviceCollection } from '../api/devices';
import DeviceList from './DeviceList';
import AreaConfiguration from './AreaConfiguration';

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

function Area(props) {
    const classes = useStyles({});
    const location = useLocation();

    return (
        !props.area ? <p>Loading...</p> :
        <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>
                <Grid item md={8} xs={12}>
                    <DeviceList devices={props.devices} />
                </Grid>
                <Grid item md={4} xs={12}>
                    <Paper className={classes.paper}>
                        <AreaConfiguration area={props.area} devices={props.devices} />
                    </Paper>

                    <Paper className={classes.paper}>
                        <Link to={`${location.pathname}/new`}>Gerät hinzufügen</Link>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

const AreaTracker = withTracker(({ _id }) => {
    return {
        area: AreaCollection.find({ _id }).fetch()[0],
        devices: DeviceCollection.find({ areaId: _id }).fetch(),
    }
})(Area);

export default function () {
    const { areaId } = useParams();

    return <AreaTracker _id={areaId} />;
}