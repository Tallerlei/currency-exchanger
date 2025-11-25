# Currency Exchanger - Angular SPA

This is an Angular Single Page Application (SPA) version of the currency converter app.

## Features

- Convert between EUR, GBP, and USD
- Real-time currency conversion using the Fixer.io API
- Swap currencies with one click
- Responsive Bootstrap UI

## Project Structure

- `src/app/app.ts` - Main component with conversion logic
- `src/app/app.html` - Component template
- `src/app/currency.service.ts` - Service for API calls and utility functions
- `src/styles.css` - Global styles with Bootstrap

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Migration from Vanilla JS

This app has been rebuilt from vanilla JavaScript to Angular with the following improvements:

- TypeScript for type safety
- Component-based architecture
- Reactive data binding with Angular forms
- HttpClient for API calls instead of raw XMLHttpRequest
- Service layer for business logic separation
- Modern Angular standalone components
