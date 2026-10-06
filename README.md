# HealthCoverSim

HealthCoverSim is a small web app for creating, saving, updating, and viewing health cover quotes. It estimates premiums using a set of simplified cover prices and Lifetime Health Cover (LHC) rules.

## Technologies

- React, TypeScript, Vite, and React Router for the client
- Express for the API server
- SQLite with Node's built-in `node:sqlite` module for local storage
- Nodemon for server development

## Database setup

No separate database command is needed. When the server starts, `server/db.js`:

1. Creates `server/data/` if it does not exist.
2. Opens or creates `server/data/healthcoversim.db`.
3. Automatically adds the `quotes` table schema if it does not already exist.

The local `data/` folder is ignored by Git, so each new local setup starts with its own database file.

## Run locally

Use Node.js 22.13 or newer. The server uses Node's built-in `node:sqlite` module, so no C++ build tools are required.

Install the dependencies once for each app:

```powershell
cd server
npm install

cd ..\client
npm install
```

Start the server in one terminal:

```powershell
cd server
npm run dev
```

The API runs at `http://localhost:3001`.

Start the client in a second terminal:

```powershell
cd client
npm run dev
```

Vite prints the client URL in the terminal, normally `http://localhost:5173`. The Vite development proxy sends client requests starting with `/api` to `http://localhost:3001`.

Useful client checks:

```powershell
cd client
npm run build
npm run lint
```

## Main API endpoints

| Method   | Endpoint          | Purpose                                            |
| -------- | ----------------- | -------------------------------------------------- |
| `GET`    | `/api/health`     | Checks that the server and database are available. |
| `GET`    | `/api/quotes`     | Returns all saved quotes.                          |
| `GET`    | `/api/quotes/:id` | Returns one quote and its premium calculation.     |
| `POST`   | `/api/quotes`     | Validates and saves a new quote.                   |
| `PUT`    | `/api/quotes/:id` | Validates and updates an existing quote.           |
| `DELETE` | `/api/quotes/:id` | Deletes an existing quote.                         |

The API uses camelCase JSON fields, for example `customerName`, `hospitalCover`, `paymentFrequency`, and `annualDiscount`.

## Client pages

| Route              | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `/quotes`          | Lists saved quotes.                      |
| `/quotes/new`      | Creates a new quote.                     |
| `/quotes/:id`      | Shows a quote and its premium breakdown. |
| `/quotes/:id/edit` | Edits an existing quote.                 |

## Premium calculation

All premium calculations happen on the server in `server/premiumCalculation.js`. The React client only displays the breakdown returned by the API.

### Monthly cover prices per adult

| Hospital cover | Monthly price |
| -------------- | ------------: |
| None           |            $0 |
| Basic          |           $90 |
| Bronze         |          $120 |
| Silver         |          $160 |
| Gold           |          $220 |

| Extras cover | Monthly price |
| ------------ | ------------: |
| None         |            $0 |
| Basic        |           $25 |
| Standard     |           $45 |
| Premium      |           $70 |

### LHC loading

Hospital costs are calculated separately for every applicant.

- `Yes` hospital cover history: 0% loading.
- `No` history: if the applicant is over 30 and has hospital cover, loading is `(age - 30) × 2%`.
- `Not sure`: 0% loading and the quote shows a warning that it may be inaccurate.
- Hospital cover `None`: 0% loading.

LHC loading applies only to hospital cover. It does not apply to extras cover.

### Family cover and discount

- Single uses one adult.
- Couple and Family use two adults.
- Extras price is multiplied by the number of adults.
- Family adds one $30 monthly Family fee.
- Monthly premium is hospital total + extras total + any Family fee.
- Yearly premium before discount is monthly premium × 12.
- The annual discount is applied only when payment frequency is `Yearly`:

```text
yearly after discount = yearly before discount × (1 - annual discount / 100)
```

Monthly payments do not receive the yearly discount.

## Limitation

The prices and LHC rules are deliberately simplified for learning. The app does not account for real insurer policies, location, income, government rebates, waiting periods, or changes to health insurance regulations.

## AI-use statement

**AI tool used:** I used ChatGPT Web as a coding assistant during this project.

**What the AI helped with:** It provided code snippets, helped fix errors, explained the project, and suggested approaches for the functions used in the app.

**What I personally checked or implemented:**

> I reviewed the suggested code, used it in the project, and checked the application features while building the assignment.

**A decision I made myself:**

> I decided to keep the interface simple and use clear forms, pages, and validation messages for the user.
