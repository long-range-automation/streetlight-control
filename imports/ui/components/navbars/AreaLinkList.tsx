import { Avatar, List, ListItem, ListItemAvatar, ListItemText, makeStyles } from '@material-ui/core';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
import { Area, AreaCollection } from '../../../api/areas';

const useStyles = makeStyles(theme => ({
    listItem: {
        paddingLeft: theme.spacing(4),
    },
    avatar: {
        width: '24px',
        height: '24px',
        fontSize: '0.8rem',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
}));

function AreaList({ areas }: {areas: Area[]}) {
    const classes = useStyles({});
    const match = useRouteMatch();
    const location = useLocation();

    return (
        <List >
            {areas.map(area => {
                const target = `${match.path}/area/${area._id}`;

                return (
                    <ListItem key={area._id} className={classes.listItem} selected={location.pathname.indexOf(target) === 0} button component={RouterLink} to={target}>
                        <ListItemAvatar>
                            <Avatar className={classes.avatar}>{area.name.slice(0, 2).toUpperCase()}</Avatar>
                        </ListItemAvatar>
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