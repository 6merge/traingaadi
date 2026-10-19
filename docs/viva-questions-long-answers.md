# Viva Questions with Long Answers

This document contains practical viva-style questions and model answers based on the existing project structure and code.

---

## 1. What is the overall architecture of this project?

This project follows a layered, microservice-inspired architecture. The frontend is an Angular application, while the backend is split into several ASP.NET Core services connected through an API Gateway.

The frontend communicates with the API Gateway instead of directly hitting each service. The gateway is responsible for routing requests, JWT validation, CORS policy, and authorization checks. The primary backend services include User Service, Train Service, Reservation Service, Payment Service, Mail Service, and a Dummy Razorpay Gateway used for testing payment simulation.

This design is useful because it separates responsibilities. Authentication is handled in the User Service, train-related data in the Train Service, reservation logic in the Reservation Service, payment logic in Payment Service, and notifications in Mail Service. The frontend remains focused on user interaction and rendering the data it receives.

This architecture is also realistic for interview discussion because it shows modularity, domain separation, and service-based design without becoming a full production-scale distributed system. The API Gateway acts as a single public entry point, which simplifies the frontend and centralizes security and routing.

---

## 2. Why is there an API Gateway in the design?

The API Gateway exists to centralize public access to backend services. Instead of the Angular app calling multiple service URLs directly, it calls one gateway, and the gateway decides which backend service should handle the request.

This design gives multiple advantages. It hides service internal layout from the frontend. It keeps security rules centralized. It helps with routing, authentication, and rate limiting if needed in future. It also makes the system scalable because new services can be added without forcing the client to know their URLs.

In this codebase, the gateway configures JWT validation, CORS, and routes like /api/auth, /api/trains, /api/reservations, and admin routes. This is a clear sign that the gateway is a protected public interface for the application.

---

## 3. Explain the frontend route structure and what each route is doing.

The route configuration in the frontend shows the user journey of the application. The home page is the landing page. Login and registration pages are for authentication. The train search route allows the user to find trains between stations. Booking and profile pages are protected routes, meaning the user must be authenticated before access. The reservation lookup route allows users to check booking status with a PNR number. The admin route is protected by both auth and admin guards.

This clearly demonstrates layered route security. Public pages are accessible without login, while private operations require the user to be authenticated. The admin route further restricts access based on role. This is a strong design pattern because it prevents users from reaching sensitive pages by accident or through URL manipulation.

---

## 4. How does authentication work in the Angular frontend?

Authentication is handled by the AuthService. It stores the JWT in sessionStorage and maintains a signal called currentUser, which is the app’s current logged-in state. When the user logs in successfully, the service stores the token and updates the user data. The app uses computed values like isLoggedIn and isAdmin to decide what to show in the UI.

The auth guard checks if a token exists before allowing access to protected pages. The interceptor automatically attaches the Authorization header to every backend request if a token is available. This means the frontend takes care of the user session locally while the backend does actual validation using JWT data.

The app stores session data rather than permanent local storage for this session, which is good for security because the token disappears when the browser session ends. This is a practical and responsive design for a training project.

---

## 5. Why did the login page need a refresh before the sidebar updated?

This bug happened because the frontend was storing the token correctly, but the auth-dependent UI sometimes depended on stale computed values or state that Angular had not re-evaluated. In the earlier implementation, the app used token checks that were not always tied to the reactive state that the UI expected. Angular only re-rendered on recognized change triggers, and the login flow did not always produce one.

This is why the page only reflected the new login state after a full reload. A page refresh causes Angular to reconstruct component state from sessionStorage and thus the UI looks correct. The fix is to make the auth signal reactive and to trigger change detection explicitly when login or logout changes the state.

This is a valuable debugging lesson because it teaches you that data may exist in storage but the UI still must be informed through Angular’s reactive system to update the DOM.

---

## 6. Explain the role of Angular signals in this project.

Signals are used to store and react to state changes in a more modern, lightweight way than older component property watchers. In this project, the AuthService exposes currentUser as a signal, and the root component reads it to determine whether the user is logged in or is an admin.

Signals are especially useful when state is tied to user authentication, because they allow components to react when the token or user details change. The advantage is fewer manual subscriptions and a simpler reactive model for UI state.

However, signals are not magic: if a state update happens outside Angular’s normal change detection cycle, the component might still not re-render until an explicit markForCheck or a browser event triggers it. This is why some async operations in this app required manual change detection calls.

---

## 7. Describe how the train search works from frontend to backend.

The search flow begins in the TrainSearchComponent. The component reads query parameters such as fromStationId, toStationId, and journeyDate. It validates that the two stations are different, then calls trainService.searchTrains().

The TrainService in the frontend calls the backend API:

- GET /api/trains/search?fromStationId=...&toStationId=...

The API Gateway forwards the request to the Train Service. The Train Service validates the station pair and checks the route ordering. It then returns all trains that pass through both stations in the correct order.

This is a good example of a layered approach: the frontend is responsible for the UI and form handling, the Angular service is responsible for API communication, the gateway routes the request, and the backend service performs the actual domain logic.

---

## 8. How does the backend decide which trains are valid for a route?

In the TrainService implementation, the logic is simple but important. It loads all trains, then for each train it loads the route stops. It finds whether the origin station and the destination station appear on that route, and only keeps the train if the origin stop order is less than the destination stop order. This ensures that a train only appears when it passes through the requested route in the correct direction.

This is a good example of business validation in the service layer. The controller just delegates to the service, and the service checks domain correctness before returning the result.

---

## 9. Explain the difference between controllers, services, and repositories in this project.

Controllers are responsible for HTTP concerns: receiving requests, validating basic input, and returning API responses. They are thin and should not contain complex business logic.

Services handle business logic. For example, BookingService performs the reservation workflow, checks availability, calculates total fare, interacts with Payment Service, and persists booking records. This is where the real domain rules live.

Repositories are responsible for database access. They wrap Entity Framework Core operations such as GetByIdAsync, AddAsync, UpdateAsync, and removal logic. The repository layer hides the database details from the service layer.

This is a strong application of a standard enterprise pattern and is one of the most important concepts to understand in a backend viva.

---

## 10. Why does the Reservation Service check availability before creating a booking?

Availability is the business gate before booking. The service wants to know whether the requested seats are still free when the booking is attempted. If the seat count is insufficient, it may trigger a waitlist or reject the booking depending on business rules.

The AvailabilityService class fetches the route and seat inventory, then compares seat allocations against the requested journey segment. It looks for overlapping bookings for the same seat across a route segment. This ensures that the same seat is not assigned to two bookings on the same journey in conflicting station ranges.

This is a real domain concern and not just a UI form check. It is a core part of railway reservation logic.

---

## 11. How are waitlists handled in the system?

The project includes waitlist repositories and the booking logic can decide between confirmed and waitlisted status depending on seat availability. When there are not enough seats, the booking may be placed on a waitlist rather than outright rejected. The system keeps track of waitlist order and renumbering when cancellations happen.

This is important because railway reservations are not simple first-come-first-served seat assignments—they must handle real-world constraints such as sold-out coaches and cancellations. The code shows a practical attempt to enforce seat assignment and waitlist sequencing.

---

## 12. Explain the booking creation process in detail.

Booking creation is one of the most complex flows in the project. It begins with request validation and user authentication. The system retrieves the authenticated user ID from the JWT claim and confirms the user exists. It then loads the train, route, and fare information from the Train Service.

Next, it calculates the total fare based on the route and number of passengers. It checks availability for the requested journey date and coach type. It may require OTP verification before payment if the flow is configured. Once everything is valid, it sends the payment request to Payment Service, and if the payment succeeds, it persists the booking and passenger records in the Reservation database.

At the end, the system sends a mail notification to the user. If the reservation persistence fails after a payment was processed, the service attempts a compensating refund. This is a very good example of defensive design in distributed systems.

---

## 13. Why is JWT used instead of storing session state on the server?

JWT is chosen because it allows the client to carry authentication information to the server in a compact token form. The server can validate the token without a shared session store. It also makes stateless API calls easier and is a common approach for microservice-style apps.

In this project, the JWT includes claims such as the user ID and user role. The gateway and protected endpoints read these claims to enforce authorization. This makes request handling easy because the server can know who the user is from the token itself.

The key architectural benefit is simplicity across service boundaries. Each service can authenticate requests using the same signing key and trust model.

---

## 14. How is authorization enforced for admin routes?

Admin routes are protected in the API Gateway with authorization metadata, and the frontend also uses an admin guard. This is defense in depth.

On the backend, the gateway marks admin routes with Roles = "Administrator". When a request arrives, the framework checks the JWT role claim and authorizes or denies access. The frontend similarly reads the current user role and hides or shows admin links based on it.

This is an important concept in secure application design: UI guard + backend guard. The UI prevents normal users from seeing admin functionality, while the backend prevents bypassing via direct HTTP requests.

---

## 15. Explain the role of DTOs in this project.

DTOs define the payloads sent across service boundaries and HTTP endpoints. Instead of exposing raw domain entities directly, the project uses specialized response and request objects. This prevents accidental leaking of internal database fields and keeps API contracts consistent.

Examples include TrainDto, RouteStopDto, FareDto, BookingRequest, BookingResponse, and ReservationDetailsResponse. These objects transform domain entities into shapes that are easy to use from the Angular frontend.

This is especially important in a distributed architecture because different services may have different internal entity structures. DTOs create stable interfaces between services and the client.

---

## 16. Why is the project structured as multiple ASP.NET services instead of one big app?

The project uses multiple services to mimic a realistic layered enterprise system. It makes responsibilities clear: one service owns users, another owns trains, another owns bookings, etc. This division lowers coupling and makes different modules easier to maintain.

It also allows future individual scaling and independent deployment. For example, reservation logic may become a bottleneck and could be scaled independently from train data. In a single monolithic app, those concerns would be tightly coupled and harder to manage.

This project is therefore a good educational example: it is not huge, but it demonstrates the principles behind domain-based service separation.

---

## 17. What is the significance of the Payment Service and Dummy Razorpay Gateway?

The payment flow in a railway system is external and risky. The project models this by calling a Payment Service and using a Dummy Razorpay Gateway to simulate payment approval and refund operations. This isolates the reservation logic from the real payment provider while still showing how production systems often integrate with third-party gateways.

It demonstrates the relationship between internal service logic and an external dependency. Payment completion is treated as a critical step; if it fails, the reservation is not considered valid. If the booking fails after payment, the system attempts to compensate with a refund.

---

## 18. How does the frontend handle API responses with different shapes?

The domain data returned from the backend may not always be in one consistent shape. Some endpoints return arrays directly, while others return wrapped objects like { data: [...] }. The frontend includes utility functions to normalize the data before using it.

This is extremely valuable in real applications because APIs can evolve or different service groups may have slightly different response styles. The normalizer layer makes the UI code cleaner and more robust.

---

## 19. Why is change detection important in Angular here?

Angular re-renders the DOM when it detects a state change from known events. But asynchronous HTTP callbacks or external service updates may not trigger an automatic render in the way you expect. That is why some async operations in this project need explicit change detection using ChangeDetectorRef.

Without this, the UI may keep showing stale values, such as “Checking...” even though the request successfully returned. The fact that a user click elsewhere triggers the update is a classic symptom that change detection was not being forced at the correct time.

This matters not only for UI behavior but also for understanding Angular lifecycle and validity checks.

---

## 20. What would you say are the biggest learning points from this project?

The biggest learning points are the full stack flow, the role separation between frontend and backend, and how modern web systems handle security and business logic. You learn how Angular, HTTP interceptors, guards, and signals work together. You also learn how ASP.NET Core controllers, services, and repositories split responsibilities. Finally, you see how a multi-service reservation system handles authentication, routing, availability, payment, waitlist, and cancellation.

The most valuable takeaway is that the project teaches real application thinking: not just code, but the flow of data, permission boundaries, resilience, and the way business domain logic is mapped to actual implementation.

---

## 21. If you had to explain this project in one paragraph, what would you say?

This project is a railway reservation system built with an Angular frontend and several ASP.NET Core backend services connected through a gateway. Users can sign up, sign in, search trains, check availability, reserve tickets, look up their PNR status, and manage bookings. The backend validates user identity with JWT, enforces role-based authorization, and handles booking rules, route checks, fare calculations, payment processing, and notifications. The project demonstrates practical software architecture patterns including service separation, repository logic, DTO communication, JWT security, and real-world distributed system concerns like compensation and error handling.

---

## 22. Short viva answer: why is the project considered a realistic full-stack application?

Because it combines a real frontend, API gateway, multiple backend services, authentication, database access, protected routes, role-based authorization, asynchronous HTTP calls, and external service simulation. It is not just a static CRUD project; it includes business rules, security, distributed logic, and a realistic user flow.
