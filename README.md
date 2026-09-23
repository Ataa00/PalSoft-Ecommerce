# PalSoft E-Commerce API

A RESTful e-commerce backend built in **C# with ASP.NET Core (.NET 9)**, **Entity Framework Core** and **SQL Server**, developed as the capstone project of the **Full Stack (.NET Core + MVC)** training program at PalSoft for AI & Technology Solutions.

The API manages users, products and orders, secured with JWT authentication and role-based authorization.

**Tech stack:** C#, ASP.NET Core Web API, Entity Framework Core (code-first migrations), SQL Server, JWT Bearer authentication, BCrypt, Swagger / OpenAPI

<!-- Add Swagger screenshots here, e.g.:
![Swagger endpoints](docs/swagger-endpoints.png)
![Login returning a JWT](docs/login-response.png)
-->

---

### Architecture

```
Controllers   → HTTP endpoints, request validation, authorization rules
DTOs          → request/response contracts (entities are not exposed directly)
Repositories  → data access behind interfaces (IUserRepository, IProductRepository, IOrderRepository)
Models        → EF Core entities + ApplicationDbContext
Migrations    → code-first database schema history
```

Repositories are registered with ASP.NET Core dependency injection, keeping controllers independent of the data-access implementation.

### Data Model

```
User ──< Order ──< OrderItem >── Product ──< ProductSize
```

- **User**: name, email, BCrypt password hash, role (`User` / `Admin`)
- **Product**: title, description, category, price, image, rating, stock count; has many **ProductSizes** (size + quantity)
- **Order**: belongs to a user, total price, creation timestamp; has many **OrderItems**
- **OrderItem**: product, quantity, and `PriceAtPurchase` (keeps historical prices when product prices change)

Schema rules configured in `ApplicationDbContext`:
- Deleting a product cascades to its sizes; deleting an order cascades to its items
- A product referenced by an order item cannot be deleted (`Restrict`), protecting order history
- All monetary columns use `decimal(18,2)`

### Security

- JWT bearer tokens (8-hour lifetime) validating issuer, audience, lifetime and signing key
- Role-based authorization with `[Authorize(Roles = "...")]`
- Ownership checks: a regular user can only read their own orders and profile
- Passwords hashed with BCrypt
- CORS restricted to a configured client origin

### API Endpoints

Interactive documentation is available through Swagger at `/swagger` when the API is running.

**Users** (`/api/Users`)

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new account |
| POST | `/login` | Public | Authenticate and receive a JWT |
| GET | `/` | Admin | List all users |
| GET | `/{id}` | Admin, or the user themselves | Get a user |
| PUT | `/{id}` | Authenticated | Update a user |
| DELETE | `/{id}` | Admin | Delete a user |

**Products** (`/api/Product`)

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List products with sizes |
| GET | `/{id}` | Public | Get a product |
| POST | `/` | Admin | Create a product (multipart form, supports image upload) |
| PUT | `/{id}` | Admin | Update a product |
| DELETE | `/{id}` | Admin | Delete a product |

**Orders** (`/api/Orders`)

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | List all orders with items |
| GET | `/myorders` | Authenticated | List the current user's orders |
| GET | `/{id}` | Admin, or the order owner | Get an order |
| POST | `/` | Authenticated | Place an order |
| DELETE | `/{id}` | Admin | Delete an order |

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- SQL Server (LocalDB, Express, or Docker)

### Run the API

```bash
cd Ecommerce_System/Ecommerce_System

# 1. Configure secrets (keep them out of source control)
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=Ecommerce;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet user-secrets set "Jwt:Key" "<a long random secret, at least 32 characters>"
dotnet user-secrets set "Jwt:Issuer" "EcommerceApp"

# 2. Create the database
dotnet tool install --global dotnet-ef   # if not installed
dotnet ef database update

# 3. Run
dotnet run
```

The API listens on `http://localhost:5056` and `https://localhost:7298`. An admin account is seeded on first run.

---

## Roadmap

- Calculate order totals from database prices and validate stock server-side
- Wrap order creation and stock updates in a single database transaction
- Global exception-handling middleware and structured logging
- Unit and integration tests for repositories and controllers
- PostgreSQL support via the Npgsql EF Core provider
- Docker Compose setup for API + database
