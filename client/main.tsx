import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App'
import 'leaflet/dist/leaflet.css';
import Leaflet from 'leaflet';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

Leaflet.Icon.Default.imagePath = '/leaflet_images/';

i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {

      }
    }
  },
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  }
});

Meteor.startup(() => {
  render(<App />, document.getElementById('react-target'));
});
