
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { fade, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import clsx from 'clsx';
import React from 'react';
import { Route, Switch, useRouteMatch } from "react-router-dom";
import AppBar from '../components/appbar/AppBar';
import Area from '../Area';
import AreaList from '../AreaList';
import SidebarLinks from '../components/navbars/SidebarLinks';
import EditArea from '../EditArea';
import EditDevice from '../EditDevice';
import NewArea from '../NewArea';
import NewDevice from '../NewDevice';

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    toolbar: {
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        paddingBottom: theme.spacing(4),
    },
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
    fixedHeight: {
        height: 240,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: 0,
    },
    grow: {
        flexGrow: 1,
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing(7),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 200,
        },
    },
}));

export default function Panel() {
    const classes = useStyles({});
    const match = useRouteMatch();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <div className={classes.root}>
            <CssBaseline />

            <AppBar handleDrawerOpen={handleDrawerOpen} open={open} />

            <Drawer
                variant="permanent"
                classes={{
                    paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                }}
                open={open}
            >
                <div className={classes.toolbarIcon}>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </div>
                <Divider />

                <SidebarLinks />
            </Drawer>

            <main className={classes.content}>
                <div className={classes.appBarSpacer} />

                <Switch>
                    <Route path={`${match.path}/device/:deviceId/edit`}>
                        <EditDevice />
                    </Route>
                    <Route path={`${match.path}/area/:areaId/new`}>
                        <NewDevice />
                    </Route>
                    <Route path={`${match.path}/area/new`}>
                        <NewArea />
                    </Route>
                    <Route path={`${match.path}/area/:areaId/edit`}>
                        <EditArea />
                    </Route>
                    <Route path={`${match.path}/area/:areaId`}>
                        <Area />
                    </Route>
                    <Route path={`${match.path}/about`}>
                        <h1>About</h1>
                    </Route>
                    <Route path={match.path}>
                        <AreaList />
                    </Route>
                </Switch>

                <Typography variant="body2" color="textSecondary" align="center">
                    {'Ein Service von '}
                    <Link color="inherit" href="https://elektro-scheibitz.de/">
                        elektro-scheibitz.de
                    </Link>
                    {' - ' + (process.env.REACT_APP_GIT_SHA || 'development')}
                </Typography>
            </main>
        </div>
    );
}