import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App'
import 'leaflet/dist/leaflet.css';
import Leaflet from 'leaflet';

Leaflet.Icon.Default.imagePath = '/leaflet_images/';

Meteor.startup(() => {
  render(<App />, document.getElementById('react-target'));
});
