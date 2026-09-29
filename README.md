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

The server also reads two optional environment variables: `PORT` (default `5173`) and `HOST`. In development `HOST` defaults to `localhost`, so the dev server can't be reached from other machines; set `HOST=0.0.0.0` to test from a phone on the same network. In production it defaults to every interface. In production the server also reads `VITE_AUTH_DOMAIN`, from `.env` or the environment, to allow the sign-in frame in its Content Security Policy. If it is unset, only `*.firebaseapp.com` is allowed and a warning is logged at startup.

## Usage

```bash
npm run dev     # start the Express + Vite dev server with HMR at http://localhost:5173
npm run build   # build the client bundle and the SSR bundle into dist/
npm run start   # serve the production build (NODE_ENV=production)
npm test        # run the Vitest suite in watch mode with a coverage report
npm run test:ci # run the suite once and exit (for CI)
npm run lint    # ESLint, including the react-hooks rules
npm run typecheck  # tsc --noEmit, for the app and tests, then vite.config.ts
npm run format  # Prettier
```

`npm run build` runs two Vite builds: the client bundle into `dist/client` and the SSR entry into `dist/server`. `npm run start` requires that build to exist.

Once running, sign in with Google. A first-time user automatically gets a starter document containing one sample meal. From there:

- **Schedule** shows the next 14 days; pick a meal for each breakfast, lunch, and dinner slot.
- **Meals** is your meal library — create, edit, and delete meals with an emoji and a list of ingredients (name, quantity, units).
- **Grocery List** holds check-off items you add by hand, plus **Add From Meals**, which totals up the ingredients of every meal scheduled from today onward and merges them into the list (items with the same name and units, ignoring capitalisation and surrounding spaces, have their quantities combined). Changes are saved to Firestore five seconds after you stop editing, and straight away if you leave the page or hide the tab. Signing out in another tab signs this one out too, and an edit here that hasn't been saved yet is discarded.

## Known limitations

These are understood trade-offs rather than oversights:

- **No conflict handling between tabs or devices.** Each change writes only the field it touched, so editing meals in one tab and the grocery list in another is safe. Two tabs editing the _same_ field is last-write-wins, and the loser is never told.
- **Offline writes are not durable.** Firestore's offline persistence is not enabled, so a change made while offline is retried in memory for the rest of the session but lost if the tab closes before it reconnects. Failures that do surface are shown in a banner.
- **Deleting a meal leaves its schedule slots empty.** The days that referenced it keep the deleted id until something else is assigned, and render as unfilled.
- **The schedule is exactly the next 14 days.** There is no way to look further ahead, or back: days before today are dropped from the document whenever the schedule is written, so no history is kept.
- **The whole document loads at sign-in, and each write sends a whole field.** One read per session is cheap, but the meals, schedule and grocery arrays all share one document's 1 MiB limit, and a large grocery list is re-sent in full on each save.
- **Server rendering is a proof of concept.** It is kept on purpose, to show streaming SSR with React 19 and Vite, but the server never knows who is signed in. Sign-in lives in the browser, so every private page is rendered on the server as the loading state, and only the Login and Not Found pages render in full. The cost is a second build, a Node server to run instead of static hosting, and the Firebase SDK starting up in Node as well as the browser. Rendering signed-in pages on the server would need it to recognize the user, for example through a Firebase session cookie checked with the Admin SDK.
- **The emoji picker needs the network.** It fetches its emoji images from `cdn.jsdelivr.net`, which the production CSP allows; offline, the picker opens but renders no emoji.

## Architecture

The app is a React 19 SPA rendered on the server by a small Express server. `server.js` starts it, and the request pipeline in `server-app.js` streams the app through `renderToPipeableStream` and injects the HTML into `index.html`; in development it does this through Vite's middleware, and in production it serves the prebuilt bundles from `dist/`. There is no backend API — the client reads and writes Firestore directly. `App.tsx` fetches the signed-in user's whole document once per session, and `UserDataContext` holds that single copy: pages read it and change it through typed mutators that update state and persist in the same step.

```
meal-planner/
├── server.js                  Starts the server: loads .env, sets up Vite in dev or the
│                              built bundle in prod, and listens
├── server-app.js              The request pipeline: Helmet security headers, static files,
│                              the missing-file 404, SSR, and an error handler
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
│   ├── entry-server.tsx       Exports render() used by server.js, wraps App in StaticRouter,
│   │                          and reports a page's HTTP status (404 for Not Found)
│   ├── App.tsx                Auth listener, one-off user data fetch, and route table
│   ├── state/
│   │   ├── UserDataContext.tsx  The single copy of the user's data, and the
│   │   │                        mutators that update state and persist it
│   │   └── HttpStatusContext.tsx  Lets a page set the response status during SSR
│   ├── index.css              Tailwind import and the custom color theme
│   │
│   ├── pages/
│   │   ├── Login.tsx          Google sign-in button
│   │   ├── Schedule.tsx       Rolling 14-day grid; fills in missing future days
│   │   ├── Meals.tsx          Meal library with create/edit/delete modals
│   │   ├── GroceryList.tsx    Grocery list, "Add From Meals" totaling, debounced saves
│   │   ├── Settings.tsx       The signed-in account, and a log out button
│   │   └── NotFound.tsx       Any unknown URL; the server answers it with a 404
│   │
│   ├── components/
│   │   ├── Navigation.tsx     Sidebar on desktop, bottom bar on mobile
│   │   ├── PrivateRoutes.tsx  Waits for auth to resolve, sends signed-out users to
│   │   │                      /login, and provides the user data store
│   │   ├── ScheduleDay.tsx    One day: three meal dropdowns
│   │   ├── Meal.tsx           Meal card with its edit/delete menu
│   │   ├── Modal.tsx            Dialog shell: focus trap, Escape, backdrop click, scroll lock
│   │   ├── MealFormModal.tsx    Meal form (name, emoji picker, ingredients) for create and edit
│   │   ├── Icon.tsx             Named icons, typed by IconName
│   │   ├── ErrorBanner.tsx      Dismissible banner for failed reads and writes
│   │   ├── Loading.tsx          Shown until auth and the user document have loaded
│   │   ├── emojiPicker.ts       Lazy import of emoji-picker-react, its own bundle chunk
│   │   ├── DeleteMealModal.tsx  Delete confirmation
│   │   ├── AddFromMealsModal.tsx  Preview and confirm ingredients pulled from the schedule
│   │   ├── IngredientsInput.tsx   Repeating name/quantity/units row editor
│   │   ├── GroceryItem.tsx    One grocery row: checkbox, name, quantity, units
│   │   ├── Accordion.tsx      Collapsible section (used for bought items)
│   │   ├── Button.tsx         Shared button
│   │   ├── Checkbox.tsx       Checkbox; the parent owns its checked state
│   │   └── Dropdown.tsx       Combobox/listbox with keyboard support and an
│   │                          optional entry that clears the selection
│   │
│   └── utils/
│       ├── types.ts           UserData, MealType, Ingredient, GroceryItemType, MealSlot
│       ├── errors.ts          Channel the Firestore helpers report failures on
│       └── utils.ts           meal-name and schedule-pruning helpers
│
├── public/                    Static files served as-is (the favicon)
│
└── tests/
    ├── setup.ts               Testing Library cleanup, jest-dom matchers, and the
    │                          global Firebase mock
    ├── userDataHarness.tsx    Renders a page inside a real UserDataContext
    ├── *.test.tsx             One suite per component or page, plus standalone
    │                          regression suites (see Testing)
    └── *.test.ts              Suites for modules without JSX: utils, errors, the
                               Firebase helpers, and the server's request pipeline
```

### Data model

Each user has a single Firestore document at `users/{uid}`:

```ts
{
  meals: [{ id, name, emoji, ingredients: [{ name, quantity, units }] }],
  schedule: [{ date /* ms timestamp, midnight */, breakfast, lunch, dinner /* meal ids */ }],
  groceryList: [{ id, name, quantity, units, status: 'to buy' | 'bought' }]
}
```

Schedule slots reference meals by `id`, so renaming a meal keeps every day it is assigned to. Meal names must be unique — the create and edit forms reject a name another meal already uses. Documents written before meals and grocery items had ids are migrated on load: each one gets an id, and name-based schedule slots are rewritten to the id of the meal they named.

## Testing

```bash
npm test        # watch mode — stays running until you stop it
npm run test:ci # runs once and exits, for CI
```

Vitest runs in a jsdom environment with globals enabled and prints a text coverage report. Tests live in [tests/](tests/) and use Testing Library with `@testing-library/user-event`. A module's suite is named after it: `.test.tsx` for components and pages, `.test.ts` for modules without JSX. The timezone is pinned to `America/New_York` in [vite.config.ts](vite.config.ts) so date-boundary tests are deterministic and actually cross a daylight-saving change.

**Some regression tests get a file of their own.** Vitest gives each test file its own copy of every module, so a test goes in a separate file when it needs modules set up differently from the rest of its suite:

- `vi.mock` replaces a module for a whole file. [GroceryListRenders.test.tsx](tests/GroceryListRenders.test.tsx) swaps in a `Checkbox` that counts renders, and [AppNavigation.test.tsx](tests/AppNavigation.test.tsx) uses the shared Firebase mock, where nobody is signed in, while `App.test.tsx` replaces it with one where a user already is.
- React logs some warnings once per module instance. [GroceryItemControlled.test.tsx](tests/GroceryItemControlled.test.tsx) checks for one, so it can't share a file with anything that might have triggered the warning first.
- [server-app.test.ts](tests/server-app.test.ts) runs in Node rather than jsdom, set by the `// @vitest-environment node` comment at its top, because it starts a real HTTP server.

Say why at the top of such a file, so nobody folds it back into the main suite. [GroceryListKeys.test.tsx](tests/GroceryListKeys.test.tsx) is also standalone, though nothing requires it to be.

**Firebase is mocked for every suite.** [tests/setup.ts](tests/setup.ts) mocks `firebase/firebase` globally, so no suite touches the real project and the tests need neither a populated `.env` nor a network connection. A suite that needs specific behaviour — a rejected write, say — overrides that with its own `vi.mock`, and [tests/firebase.test.ts](tests/firebase.test.ts) unmocks it to test the module itself against a stubbed Firestore SDK.

Pages read their data from `UserDataContext` rather than props, so a page under test is rendered through `renderWithUserData` in [tests/userDataHarness.tsx](tests/userDataHarness.tsx), which stands in for what `App` does.
