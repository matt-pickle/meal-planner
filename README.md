# Meal Planner

A server-side-rendered React app for planning meals and shopping for them. You keep a library of meals with their ingredients, assign those meals to breakfast/lunch/dinner slots across a rolling two-week schedule, and then roll the ingredients of every upcoming meal into a grocery list in one click. Data is stored per user in Firebase Firestore behind Google sign-in.

## Installation

Requires Node.js 20.19+ (developed on v22).

```bash
git clone <repository-url>
cd meal-planner
npm install
```

## Configuration

The app talks to Firebase, so you need a Firebase project before it will run:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Under **Authentication → Sign-in method**, enable the **Google** provider.
3. Under **Firestore Database**, create a database. The app writes one document per user at `users/{uid}`. The security rules live in [`firebase/firestore.rules`](firebase/firestore.rules) — they let a signed-in user read and write only their own document, and validate its shape and array sizes. They are the only authorization layer, since the client talks to Firestore directly. Deploy them with the [Firebase CLI](https://firebase.google.com/docs/cli):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # select your project
   firebase deploy --only firestore:rules
   ```
4. Register a **Web app** in project settings, copy `.env.example` to `.env` in the project root (`cp .env.example .env`), and fill in its config values:

   ```bash
   VITE_API_KEY=your-api-key
   VITE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_PROJECT_ID=your-project-id
   VITE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_MESSAGING_SENDER_ID=000000000000
   VITE_APP_ID=1:000000000000:web:abcdef
   ```

   Only `VITE_`-prefixed variables are exposed to the client by Vite. These values ship in the browser bundle — that is expected for Firebase web apps, which rely on auth and Firestore rules rather than config secrecy.

The server also reads two optional environment variables: `PORT` (default `5173`) and `BASE` (default `/`).

## Usage

```bash
npm run dev     # start the Express + Vite dev server with HMR at http://localhost:5173
npm run build   # build the client bundle and the SSR bundle into dist/
npm run start   # serve the production build (NODE_ENV=production)
npm test        # run the Vitest suite in watch mode with a coverage report
```

`npm run build` runs two Vite builds: the client bundle into `dist/client` and the SSR entry into `dist/server`. `npm run start` requires that build to exist.

Once running, sign in with Google. A first-time user automatically gets a starter document containing one sample meal. From there:

- **Schedule** shows the next 14 days; pick a meal for each breakfast, lunch, and dinner slot.
- **Meals** is your meal library — create, edit, and delete meals with an emoji and a list of ingredients (name, quantity, units).
- **Grocery List** holds check-off items you add by hand, plus **Add From Meals**, which totals up the ingredients of every meal scheduled from today onward and merges them into the list (matching name + units have their quantities combined). Changes are saved to Firestore on a 500 ms debounce.

## Architecture

The app is a React 19 SPA rendered on the server by a small Express server. `server.js` streams the app through `renderToPipeableStream` and injects the HTML into `index.html`; in development it does this through Vite's middleware, and in production it serves the prebuilt bundles from `dist/`. There is no backend API — the client reads and writes Firestore directly, and `App.tsx` loads the signed-in user's whole document once on auth and passes it down as props.

```
meal-planner/
├── server.js                  Express server: Helmet security headers, Vite middleware in
│                              dev, static + SSR in prod, and an error handler
├── index.html                 HTML shell with <!--app-html--> placeholder for SSR output
├── vite.config.ts             Vite plugins (React SWC, Tailwind) and Vitest config
├── firebase.json              Firebase CLI config (points into firebase/)
├── .firebaserc                Project alias used by the CLI
├── .env.example               Template for the Firebase config keys (committed)
├── .env                       Firebase credentials (git-ignored)
│
├── firebase/
│   ├── firebase.ts            Firebase init plus every data call: logIn, logOut,
│   │                          getUserData, createDocument, updateUserData
│   ├── firestore.rules        Firestore security rules — the only authorization layer
│   └── firestore.indexes.json Firestore composite indexes (none needed so far)
│
├── src/
│   ├── entry-client.tsx       Hydrates the SSR markup inside BrowserRouter
│   ├── entry-server.tsx       Exports render() used by server.js, wraps App in StaticRouter
│   ├── App.tsx                Auth listener, user data fetch, and route table
│   ├── index.css              Tailwind import and the custom color theme
│   │
│   ├── pages/
│   │   ├── Home.tsx           Placeholder landing page at /
│   │   ├── Login.tsx          Google sign-in button
│   │   ├── Schedule.tsx       Rolling 14-day grid; fills in missing future days
│   │   ├── Meals.tsx          Meal library with create/edit/delete modals
│   │   ├── GroceryList.tsx    Grocery list, "Add From Meals" totaling, debounced saves
│   │   └── Settings.tsx       Log out
│   │
│   ├── components/
│   │   ├── Navigation.tsx     Sidebar on desktop, bottom bar on mobile
│   │   ├── PrivateRoutes.tsx  Route guard that redirects signed-out users to /login
│   │   ├── ScheduleDay.tsx    One day: three meal dropdowns
│   │   ├── Meal.tsx           Meal card with its edit/delete menu
│   │   ├── CreateMealModal.tsx  New meal form (name, emoji picker, ingredients)
│   │   ├── EditMealModal.tsx    Same form, prefilled from an existing meal
│   │   ├── DeleteMealModal.tsx  Delete confirmation
│   │   ├── AddFromMealsModal.tsx  Preview and confirm ingredients pulled from the schedule
│   │   ├── IngredientsInput.tsx   Repeating name/quantity/units row editor
│   │   ├── GroceryItem.tsx    One grocery row: checkbox, name, quantity, units
│   │   ├── Accordion.tsx      Collapsible section (used for bought items)
│   │   ├── Button.tsx         Shared button
│   │   ├── Checkbox.tsx       Checkbox, controlled or uncontrolled
│   │   └── Dropdown.tsx       Custom select with click-outside handling
│   │
│   └── utils/
│       ├── types.ts           UserData, MealType, Ingredient, GroceryItemType, MealSlot
│       └── utils.tsx          icon() helper, meal-name and schedule-pruning helpers
│
└── tests/
    ├── setup.ts               Testing Library cleanup and jest-dom matchers
    └── *.test.tsx             One suite per page and component
```

### Data model

Each user has a single Firestore document at `users/{uid}`:

```ts
{
  meals: [{ id, name, emoji, ingredients: [{ name, quantity, units }] }],
  schedule: [{ date /* ms timestamp, midnight */, breakfast, lunch, dinner /* meal ids */ }],
  groceryList: [{ name, quantity, units, status: 'to buy' | 'bought' }]
}
```

Schedule slots reference meals by `id`, so renaming a meal keeps every day it is assigned to. Meal names must be unique — the create and edit forms reject a name another meal already uses. Documents written before meals had ids are migrated on load: each meal gets an id, and name-based slots are rewritten to it.

## Testing

```bash
npm test
```

Vitest runs in a jsdom environment with globals enabled and prints a text coverage report. Tests live in [tests/](tests/), one file per page or component, and use Testing Library with `@testing-library/user-event`.
