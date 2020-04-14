import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { AreaCollection, Area } from '../api/areas';
import { Link as RouterLink, useRouteMatch, useLocation } from 'react-router-dom';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import { List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    current: {
        backgroundColor: '#efefef',
    },
}));

function AreaList({ areas }: {areas: Area[]}) {
    const classes = useStyles({});
    const match = useRouteMatch();
    const location = useLocation();

    return (
        <List>
            {areas.map(area => {
                const target = `${match.path}/area/${area._id}`;

                return (
                    <ListItem key={area._id} className={location.pathname.indexOf(target) === 0 ? classes.current : undefined} button component={RouterLink} to={target}>
                        <ListItemIcon>
                            <GroupWorkIcon />
                        </ListItemIcon>
                        <ListItemText primary={area.name} />
                    </ListItem>
                )
            })}
        </List>
    );
}

export default withTracker(() => {
    return {
        areas: AreaCollection.find().fetch(),
    }
})(AreaList);