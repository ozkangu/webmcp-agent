import type { Airport, CabinClass, Flight } from '../types';

export const AIRPORTS: Airport[] = [
  { code: 'IST', name: 'İstanbul Havalimanı' },
  { code: 'SAW', name: 'Sabiha Gökçen' },
  { code: 'ESB', name: 'Esenboğa (Ankara)' },
  { code: 'AYT', name: 'Antalya' },
  { code: 'ADB', name: 'İzmir Adnan Menderes' },
  { code: 'ADA', name: 'Adana Şakirpaşa' },
  { code: 'TZX', name: 'Trabzon' },
  { code: 'GZT', name: 'Gaziantep' },
  { code: 'DIY', name: 'Diyarbakır' },
  { code: 'VAN', name: 'Van Ferit Melen' },
];

export const CABIN_CLASSES: CabinClass[] = [
  { value: 'economy', label: 'Ekonomi' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' },
];

export const MOCK_FLIGHTS: Flight[] = [
  { offerId: 'OF-001', airline: 'Turkish Airlines', flightNo: 'TK2124', origin: 'ESB', destination: 'IST', departureTime: '08:30', arrivalTime: '09:45', duration: '1s 15dk', price: 1850, currency: 'TRY', cabinClass: 'economy', aircraft: 'A321neo', seatsAvailable: 23 },
  { offerId: 'OF-002', airline: 'Turkish Airlines', flightNo: 'TK2126', origin: 'ESB', destination: 'IST', departureTime: '12:00', arrivalTime: '13:20', duration: '1s 20dk', price: 2100, currency: 'TRY', cabinClass: 'economy', aircraft: 'B737-800', seatsAvailable: 8 },
  { offerId: 'OF-003', airline: 'Turkish Airlines', flightNo: 'TK2130', origin: 'ESB', destination: 'IST', departureTime: '18:45', arrivalTime: '20:00', duration: '1s 15dk', price: 3450, currency: 'TRY', cabinClass: 'business', aircraft: 'A321neo', seatsAvailable: 4 },
  { offerId: 'OF-004', airline: 'AnadoluJet', flightNo: 'AJ904', origin: 'ESB', destination: 'IST', departureTime: '06:15', arrivalTime: '07:30', duration: '1s 15dk', price: 1290, currency: 'TRY', cabinClass: 'economy', aircraft: 'B737-800', seatsAvailable: 42 },
  { offerId: 'OF-005', airline: 'Pegasus', flightNo: 'PC2345', origin: 'ESB', destination: 'SAW', departureTime: '14:30', arrivalTime: '15:50', duration: '1s 20dk', price: 980, currency: 'TRY', cabinClass: 'economy', aircraft: 'A320neo', seatsAvailable: 55 },
  { offerId: 'OF-006', airline: 'Turkish Airlines', flightNo: 'TK2454', origin: 'AYT', destination: 'IST', departureTime: '09:00', arrivalTime: '10:30', duration: '1s 30dk', price: 1650, currency: 'TRY', cabinClass: 'economy', aircraft: 'A330', seatsAvailable: 34 },
  { offerId: 'OF-007', airline: 'SunExpress', flightNo: 'XQ501', origin: 'ADB', destination: 'IST', departureTime: '07:45', arrivalTime: '09:10', duration: '1s 25dk', price: 1120, currency: 'TRY', cabinClass: 'economy', aircraft: 'B737-800', seatsAvailable: 19 },
  { offerId: 'OF-008', airline: 'Turkish Airlines', flightNo: 'TK7700', origin: 'IST', destination: 'AYT', departureTime: '11:00', arrivalTime: '12:30', duration: '1s 30dk', price: 2200, currency: 'TRY', cabinClass: 'business', aircraft: 'A321neo', seatsAvailable: 6 },
];
