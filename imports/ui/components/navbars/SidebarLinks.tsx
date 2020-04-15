import React from 'react';
import { Divider, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import HelpIcon from '@material-ui/icons/Help';
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import AreaLinkList from "./AreaLinkList";

export default function SidebarLinks() {
    const match = useRouteMatch();

    return (
        <div>
            <List>
                <ListItem button component={RouterLink} to={`${match.path}/area`}>
                    <ListItemIcon>
                        <GroupWorkIcon />
                    </ListItemIcon>
                    <ListItemText primary="Areas" />
                </ListItem>

                <AreaLinkList />
            </List>

            <Divider />
            <List>
                <ListItem button component={RouterLink} to={`${match.path}/about`}>
                    <ListItemIcon>
                        <HelpIcon />
                    </ListItemIcon>
                    <ListItemText primary="Hilfe" />
                </ListItem>
            </List>
        </div>
    )
}