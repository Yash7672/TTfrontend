/**
 * Cities offered by the location selector.
 *
 * Hyderabad is the seeded demo city; the others work as soon as providers are
 * registered in them (search is a real database query, not a filtered list).
 */
export const CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Pune',
  'Chennai',
  'Kolkata',
  'Visakhapatnam',
  'Vijayawada',
  'Warangal',
] as const

export type City = (typeof CITIES)[number]

export const DEFAULT_CITY: City = 'Hyderabad'

export const FAQS = [
  {
    question: 'How do I book a service on Fixora?',
    answer:
      'Choose a service, pick a package, select a saved address plus a date and start time, then confirm. The booking is created with status Pending and the provider accepts or rejects it. You can follow every change on the booking detail page.',
  },
  {
    question: 'How is the price decided?',
    answer:
      'Every service has one or more packages and each package has a fixed price in the Fixora catalogue. The price you see is the price the server records on the booking. An inspection fee only covers the visit — repair work after an inspection is quoted separately. Prices in this project are demo prices.',
  },
  {
    question: 'Can I cancel a booking?',
    answer:
      'A Pending or Accepted booking can be cancelled from My bookings. The option disappears once the service has started, is completed, or the booking was already cancelled or rejected. Every status change is recorded in the booking history.',
  },
  {
    question: 'How do providers get verified?',
    answer:
      'Providers register and their profile starts as Pending. An administrator reviews it in the admin panel; only Approved providers appear in search and can accept bookings. Fixora shows the real verification status rather than claiming a background check.',
  },
  {
    question: 'When can I leave a review?',
    answer:
      'Only after a booking is completed, one review per booking, with a rating between 1 and 5. Averages on Fixora are calculated from real reviews. A service with no reviews shows “No reviews yet” instead of an invented rating.',
  },
  {
    question: 'How do payments work?',
    answer:
      'This version of Fixora does not connect a payment gateway. Each booking records a payment status, but money is settled directly between you and the provider. No card details are collected.',
  },
  {
    question: 'What if something goes wrong?',
    answer:
      'Open Support from the menu, describe the problem and attach the booking reference. Your complaint is stored with the status Open and reviewed by an administrator, who can classify it, set a priority and record a resolution.',
  },
  {
    question: 'Is the Fixora AI assistant a real assistant?',
    answer:
      'It has two modes. With an Anthropic API key configured it uses that model from the backend only. Without a key it answers deterministically from the Fixora database — real services, real packages and documented policy. It never invents prices, providers or availability, and it never creates a booking for you.',
  },
]

export const WHY_FIXORA = [
  {
    title: 'Easy four-step booking',
    body: 'Service, package, address and time — then confirm. No phone calls needed.',
    icon: 'calendar-check',
  },
  {
    title: 'Clear package information',
    body: 'Each package lists what is included, what is not, and how long it takes.',
    icon: 'list-check',
  },
  {
    title: 'Verification status you can see',
    body: 'Only approved providers are listed, and their status is shown honestly.',
    icon: 'shield-check',
  },
  {
    title: 'Transparent pricing',
    body: 'The price comes from the package you pick. The server validates it, not the browser.',
    icon: 'indian-rupee',
  },
  {
    title: 'Status tracking',
    body: 'Every booking keeps a status history so you can see exactly where things stand.',
    icon: 'history',
  },
  {
    title: 'Real customer reviews',
    body: 'Reviews come only from completed bookings, and averages use real review data.',
    icon: 'star',
  },
]

export const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Choose a service',
    body: 'Search or browse categories to find the right Fixora service for the job.',
  },
  {
    step: '2',
    title: 'Select a package and time',
    body: 'Compare packages, then pick a date and start time that suits you.',
  },
  {
    step: '3',
    title: 'Book a provider',
    body: 'Choose an approved provider or let Fixora assign one, then confirm the booking.',
  },
  {
    step: '4',
    title: 'Track your service',
    body: 'Follow the status from Pending to Completed, and leave a review at the end.',
  },
]
