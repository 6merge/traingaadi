# Railway Network Project Study Guide

This guide is written to be read alongside the code in the repository. It explains how the project is structured, how the frontend and backend interact, and why the important design choices are there.

## 1. High-level project architecture

The project is a railway reservation system built as a small distributed application:

- Frontend: Angular single-page app running on port 4200
- API Gateway: ASP.NET Core app that fronts all backend traffic
- User Service: handles registration, login, JWT issuance, and role lookup
- Train Service: handles trains, stations, routes, coaches, seats, and fares
- Reservation Service: handles availability checks, booking creation, payment OTP, PNR lookup, and cancellations
- Payment Service: handles payment processing and refunds
- Mail Service: handles email notifications
- Dummy Razorpay Gateway: mocked payment gateway used to simulate payment flow

The architecture is a microservice-inspired pattern with a central gateway. The frontend never talks directly to all services; instead, it calls the gateway, and the gateway forwards the request to the relevant service.

### Request flow example

A normal login request:

1. Angular sends POST to /api/auth/login through the gateway.
2. The gateway forwards the request to the User Service.
3. User Service validates the email and password.
4. User Service creates a JWT token containing user claims.
5. The gateway returns the token to Angular.
6. Angular stores the token in sessionStorage and sets the auth state.

A booking request:

1. Angular calls /api/reservations with the Authorization header.
2. API Gateway validates JWT and forwards to Reservation Service.
3. Reservation Service checks the user identity from the JWT.
4. It verifies the route and fare, talks to Train Service and Payment Service, and then persists booking data.
5. Angular receives the booking response and shows confirmation.

---

## 2. Frontend architecture

The frontend is under the folder:

- frontend/src/app

The Angular app uses standalone components, a route configuration, and service-based APIs.

### 2.1 Core entry points

Main app files:

- frontend/src/app/app.ts: root application component
- frontend/src/app/app.html: global navigation and outlet
- frontend/src/app/app.routes.ts: route table
- frontend/src/app/app.config.ts: app-level providers like HTTP client and route config

The route table is important because it shows the UX structure of the app:

- / => Home
- /login => Login page
- /register => Register page
- /trains/search => Train search page
- /trains/:trainId => Train details page
- /booking => Booking page, protected by auth guard
- /profile => User profile, protected by auth guard
- /reservation/lookup => PNR status lookup
- /admin => Admin dashboard, protected by auth and admin guard

### 2.2 Angular app shell behavior

The root component in app.ts uses signals to track auth state:

- authService.currentUser
- authService.isAuthenticated()
- isAdmin()

This means the navigation bar updates when the user logs in or out without reloading the page, provided the signals are set correctly.

The template in app.html renders either:

- logged-in navigation (Profile, Admin, Logout)
- or guest navigation (Login, Register)

This is the visual gatekeeper of the whole frontend.

### 2.3 Auth flow in the frontend

Key files:

- frontend/src/app/core/services/auth.service.ts
- frontend/src/app/core/guards/auth.guard.ts
- frontend/src/app/core/guards/admin.guard.ts
- frontend/src/app/core/interceptors/auth.interceptor.ts

The auth service stores:

- railway_token in sessionStorage
- railway_user in sessionStorage

When the user logs in, the service receives a login response, stores the token, rebuilds the user object, and updates currentUser signal.

The auth guard checks whether a token exists:

- if true => allow access to protected route
- if false => redirect to /login

The admin guard checks whether the current user role is Administrator.

The HTTP interceptor adds the Authorization header to outgoing requests when a token exists.

This is how the frontend authenticates to protected backend routes.

### 2.4 Train search flow

The main page for route selection and train listing is:

- frontend/src/app/features/trains/train-search.component.ts

This component:

- reads query parameters from the route
- validates origin and destination stops
- calls trainService.searchTrains()
- shows a loading spinner while results are being fetched
- renders a list of available trains

It also supports:

- availability checking for each train
- route checking for each train
- fare display
- booking navigation

Important pattern:

- There are separate loading states for each train, not one global full-page loading state.
- This avoids blocking other trains when one request is in progress.

The component uses change detection management with ChangeDetectorRef because some asynchronous updates happen outside the normal Angular event cycle. This is exactly why earlier the loading indicators could get stuck until the user clicked elsewhere.

### 2.5 Booking flow

Key files:

- frontend/src/app/features/booking/booking.component.ts
- frontend/src/app/core/services/reservation.service.ts

The frontend booking process is a multi-step flow:

1. User chooses train, route, coach, date, passengers.
2. Frontend requests availability and fare.
3. User verifies selected details.
4. Frontend creates reservation request.
5. Backend validates and creates booking.
6. Confirmation screen shows PNR and booking summary.

This is not a simple one-call operation. It combines UI state, route params, passenger form state, and multiple HTTP calls.

### 2.6 PNR status lookup

Key file:

- frontend/src/app/features/reservation/reservation-lookup.component.ts

This component:

- receives a user-entered PNR number
- validates it isn't empty
- calls reservationService.getReservationByPnr()
- displays booking details if found
- shows an error if not found

The common bug pattern here is that state values are updated but Angular needs a change detection trigger to re-render. This is why a click on the input triggered the redraw in the earlier bug.

### 2.7 Data model and normalization layer

Important utilities:

- frontend/src/app/core/models/railway.models.ts
- frontend/src/app/core/utils/api-normalizer.ts

The frontend receives data in different API shapes. Some APIs return:

- plain array
- wrapped object like { data: [...] }
- object with fields such as result or payload

The normalizer utilities help standardize these responses before using them in the UI.

This is a practical solution because backend microservices often return different object shapes depending on the service or response model.

---

## 3. Backend architecture

The backend is under:

- src/ApiGateway
- src/UserService
- src/TrainService
- src/ReservationService
- src/PaymentService
- src/MailService
- src/DummyRazorpayGateway

### 3.1 API Gateway

The gateway sits in:

- src/ApiGateway/Program.cs

Responsibilities:

- configure JWT authentication and authorization
- configure CORS for Angular
- route requests to proper backend service
- protect endpoints with roles like Passenger / Administrator
- expose OpenAPI/Swagger

This is the public API boundary for the frontend.

The gateway also uses a custom GatewayProxy service to forward calls and preserve request context.

### 3.2 User Service

Key files:

- src/UserService/Program.cs
- src/UserService/Controllers/AuthController.cs
- src/UserService/Services/Services.cs
- src/UserService/Data/UserDbContext.cs

This service owns user identity and authentication.

Responsibilities:

- register a user
- verify a password
- create a JWT token
- store user and role records
- assign RoleId based on role seed data

Important design choices:

- password hashing uses ASP.NET Core Identity PasswordHasher
- JWT claims include NameIdentifier and Role
- roles are seeded in the database (Passenger and Administrator)

The JWT is signed using a symmetric key and includes expiration information.

### 3.3 Train Service

Key files:

- src/TrainService/Program.cs
- src/TrainService/Controllers/TrainController.cs
- src/TrainService/Services/TrainService.cs
- src/TrainService/Repositories/*
- src/TrainService/Data/TrainDbContext.cs

This service is the source of truth for train and route information.

Responsibilities:

- manage trains
- manage stations
- manage route stops
- manage coaches and seat inventory
- return fares for a route and coach type

The repository pattern is used heavily:

- ITrainRepository
- IStationRepository
- IRouteStopRepository
- ICoachRepository
- ISeatRepository
- IFareRepository

The service ensures a valid route before returning matches. For example, SearchTrainsAsync checks that the origin and destination exist on the route and that the ordering is valid.

### 3.4 Reservation Service

Key files:

- src/ReservationService/Program.cs
- src/ReservationService/Controllers/ReservationController.cs
- src/ReservationService/Services/BookingService.cs
- src/ReservationService/Services/AvailabilityService.cs
- src/ReservationService/Repositories/*

This is the most important backend service for booking logic.

Responsibilities:

- check seat availability for a train + date + coach type
- create bookings
- create unique PNR numbers
- assign waitlists when seats are not available
- check reservation details by PNR
- cancel bookings
- coordinate with payment service and mail service

Key business flow in BookingService.CreateBookingAsync:

1. Validate booking request and user identity.
2. Fetch user, train, route, fare.
3. Calculate total fare.
4. Validate OTP if payment verification is configured.
5. Check current availability.
6. Call Payment Service to process payment.
7. Persist booking into ReservationDbContext.
8. Send email notification.
9. If persistence fails after payment, trigger refund compensation.

This is a classic distributed transaction-inspired pattern: payment can happen before persistence, so the service includes compensating logic to handle failure.

### 3.5 Payment and mail integration

The Reservation Service uses clients for:

- IUserClient
- ITrainClient
- IPaymentClient
- IMailClient

This follows a service-to-service client pattern and keeps reservation logic decoupled from the actual transport details.

The Dummy Razorpay Gateway is used to simulate payment approval and refund callbacks.

The Mail Service is used for sending confirmation or cancellation emails.

### 3.6 Security and JWT handling

JWT is used across the system and is central to access control.

Important observations from the code:

- User Service emits claims like NameIdentifier and Role.
- Gateway validates JWT with the configured issuer, audience, and key.
- Reservation endpoints use [Authorize] and then read the authenticated user ID from the JWT claim.
- Admin routes use role-based authorization like Roles = "Administrator".

This is a standard modern pattern for secure API access.

---

## 4. How the frontend and backend fit together

The frontend does not directly access the database or internal services. Instead, it communicates through the gateway layer. The gateway is the public API entry and enforces the same security model as the services behind it.

### Example request chain for PNR lookup

Frontend:

- ReservationLookupComponent submits pnrNumber
- ReservationService.getReservationByPnr()
- GET /api/reservations/{pnr}

Gateway:

- validates JWT
- forwards request to Reservation Service

Reservation Service:

- reads authenticated user claim
- fetches booking by PNR
- verifies the current user owns the booking
- returns details

Frontend:

- renders the returned result

This pattern keeps the business logic in the backend and keeps the UI thin and presentation-focused.

---

## 5. Important patterns used in the codebase

### Repository pattern

The backend uses repositories for database access. This isolates data access code from business logic.

Examples:

- TrainRepository
- BookingRepository
- SeatAllocationRepository
- WaitlistRepository

### Service layer pattern

The business logic lives in service classes. Controllers are thin and focused on HTTP tasks.

Examples:

- TrainService
- BookingService
- AvailabilityService
- AuthService

### DTO-driven communication

Instead of returning domain entities directly, the project uses DTOs for API responses. This separates database entities from API contracts and keeps responses stable.

### JWT-based authentication

User identity is carried in JWT, then read from claims. The gateway and service endpoints trust the token.

### Role-based authorization

Routes are defined with roles such as Passenger or Administrator.

### Eventual service coordination

Because of microservice-style boundaries, the reservation system has to coordinate with multiple services while keeping logic consistent. This is why payment, notification, and persistence are carefully sequenced.

---

## 6. Important files to read in order

If you want to understand the code deeply, follow this order:

### Frontend

1. frontend/src/app/app.routes.ts
2. frontend/src/app/app.ts
3. frontend/src/app/core/services/auth.service.ts
4. frontend/src/app/core/interceptors/auth.interceptor.ts
5. frontend/src/app/features/auth/login.component.ts
6. frontend/src/app/features/trains/train-search.component.ts
7. frontend/src/app/features/booking/booking.component.ts
8. frontend/src/app/features/reservation/reservation-lookup.component.ts

### Backend

1. src/ApiGateway/Program.cs
2. src/UserService/Controllers/AuthController.cs
3. src/UserService/Services/Services.cs
4. src/TrainService/Controllers/TrainController.cs
5. src/TrainService/Services/TrainService.cs
6. src/ReservationService/Controllers/ReservationController.cs
7. src/ReservationService/Services/AvailabilityService.cs
8. src/ReservationService/Services/BookingService.cs
9. src/ReservationService/Program.cs

---

## 7. Key questions to ask while reading the code

- Which service owns this responsibility?
- Is the route public or protected?
- Is the request forward via the API Gateway or direct service call?
- What is the role of the repository vs service vs controller?
- How is JWT used to authenticate the user?
- What data is stored in sessionStorage vs backend DB?
- Which values are user-supplied and which are server-controlled?
- Where is validation performed?
- What happens if a payment fails after a booking is created?
- How is the route/fare logic validated before booking?

These questions reveal the architecture quickly and help you read the project as a system, not just as isolated files.

---

## 8. Short project summary

This project is a realistic railway reservation application built as a microservice-style system with an Angular frontend and multiple ASP.NET Core backend services. Authentication is JWT-based, business logic is split across services, and the frontend consumes API endpoints through a central gateway.

The most important concepts to understand are:

- route protection and auth state in Angular
- JWT claims and authorization in ASP.NET Core
- service boundaries between user/train/reservation/payment domains
- repository + service layering on the backend
- the flow from UI request to business logic to database persistence

If you understand these concepts, you can explain the project clearly in an interview or viva.
