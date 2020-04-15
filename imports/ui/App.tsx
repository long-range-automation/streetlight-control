import React from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import ProtectedRoute from '../router/ProtectedRoute';
import SignIn from './SignIn';
import Panel from './layouts/Panel';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#222222',
    },
    secondary: {
      main: '#545454'
    },
  }
});

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/signin">
            <SignIn />
          </Route>
          <ProtectedRoute path="/panel">
            <Panel />
          </ProtectedRoute>
          <Route path="/" exact={true}>
            <Redirect to="/signin" />
          </Route>
          <Route>
            <h1>404 Not found</h1>
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}