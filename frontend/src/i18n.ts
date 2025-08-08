import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources for English and German. You can extend this object
// with additional keys as you internationalize more parts of the app.
const resources = {
  en: {
    translation: {
      'Band Booking System': 'Band Booking System',
      'Sign in to your account': 'Sign in to your account',
      'Email address': 'Email address',
      'Password': 'Password',
      'Sign in': 'Sign in',
      'Room': 'Room',
      'Select a room': 'Select a room',
      'Band': 'Band',
      'Select a band': 'Select a band',
      'Start Time': 'Start Time',
      'Select start time': 'Select start time',
      'End Time': 'End Time',
      'Select end time': 'Select end time',
      'Cancel': 'Cancel',
      'Create Booking': 'Create Booking',
      'Update Booking': 'Update Booking',
      'Saving...': 'Saving...',
      'Calendar': 'Calendar',
      'Dashboard': 'Dashboard',
      'Bands': 'Bands',
      'Rooms': 'Rooms',
      'Modern Calendar': 'Modern Calendar',
      'Create New Booking': 'Create New Booking'
      ,
      // Calendar control and navigation translations for react-big-calendar
      'Next': 'Next',
      'Previous': 'Previous',
      'Today': 'Today',
      'Month': 'Month',
      'Week': 'Week',
      'Day': 'Day',
      'Agenda': 'Agenda',
      'Date': 'Date',
      'Time': 'Time',
      'No events in range': 'No events in range'
      ,
      // Label for the list view in FullCalendar
      'List': 'List'
    },
  },
  de: {
    translation: {
      'Band Booking System': 'Band‑Buchungssystem',
      'Sign in to your account': 'Melden Sie sich bei Ihrem Konto an',
      'Email address': 'E‑Mail‑Adresse',
      'Password': 'Passwort',
      'Sign in': 'Anmelden',
      'Room': 'Raum',
      'Select a room': 'Wählen Sie einen Raum',
      'Band': 'Band',
      'Select a band': 'Wählen Sie eine Band',
      'Start Time': 'Startzeit',
      'Select start time': 'Startzeit auswählen',
      'End Time': 'Endzeit',
      'Select end time': 'Endzeit auswählen',
      'Cancel': 'Abbrechen',
      'Create Booking': 'Buchung erstellen',
      'Update Booking': 'Buchung aktualisieren',
      'Saving...': 'Speichern...',
      'Calendar': 'Kalender',
      'Dashboard': 'Dashboard',
      'Bands': 'Bands',
      'Rooms': 'Räume',
      'Modern Calendar': 'Moderner Kalender',
      'Create New Booking': 'Neue Buchung'
      ,
      // Calendar control and navigation translations for react-big-calendar
      'Next': 'Nächste',
      'Previous': 'Vorherige',
      'Today': 'Heute',
      'Month': 'Monat',
      'Week': 'Woche',
      'Day': 'Tag',
      'Agenda': 'Agenda',
      'Date': 'Datum',
      'Time': 'Zeit',
      'No events in range': 'Keine Termine im ausgewählten Bereich'
      ,
      // Label for the list view in FullCalendar
      'List': 'Liste'
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
  });

export default i18n;