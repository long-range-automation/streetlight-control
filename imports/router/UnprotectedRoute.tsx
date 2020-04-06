import React from 'react';
import {
    Redirect,
    Route
  } from "react-router-dom";
import { Meteor } from 'meteor/meteor';

export default function UnprotectedRoute({children, ...rest}) {
    return (
      <Route
        {...rest}
        render={props =>
          !Meteor.userId()
            ? children
            : <Redirect
                to={`/dashboard`}
              />}
      />
    );
  }