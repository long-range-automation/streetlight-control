import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Paper, Typography } from '@material-ui/core';
import { AreaCollection, AreaDocument } from '../api/areas';
import { Link } from 'react-router-dom';

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

interface AreaListProps {
    areas: AreaDocument[],
}

function AreaList({ areas }: AreaListProps) {
    const classes = useStyles({});

    return (
        <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography variant="h6">New Area</Typography>
                        <Link to="/panel/area/new">Add new area</Link>
                    </Paper>
                </Grid>
                {areas.map(area => {
                    return (<Grid key={area._id} item xs={12}>
                        <Paper className={classes.paper}>
                            <Typography variant="h6">{area.name}</Typography>
                            <Link to={`/panel/area/${area._id}`}>Select</Link>
                        </Paper>
                    </Grid>)
                })}
            </Grid>
        </Container>
    )
}

export default withTracker(() => {
    return {
        areas: AreaCollection.find().fetch(),
    }
})(AreaList);