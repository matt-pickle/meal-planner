# Meal Planner

A React single-page app for planning meals and shopping for them. You keep a library of meals with their ingredients, assign those meals to breakfast/lunch/dinner slots across a rolling two-week schedule, and then roll the ingredients of every upcoming meal into a grocery list in one click. Data is stored per user in Firebase Firestore behind Google sign-in.

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

The build also reads `VITE_AUTH_DOMAIN` to write the Content Security Policy (see [Deploying to Netlify](#deploying-to-netlify)). If it is unset, the policy allows only `*.firebaseapp.com` for sign-in and the build prints a warning.

## Usage

```bash
npm run dev     # start the Vite dev server with HMR at http://localhost:5173
npm run build   # build the static site into dist/
npm run preview # serve dist/ locally to try a production build
npm test        # run the Vitest suite in watch mode with a coverage report
npm run test:ci # run the suite once and exit (for CI)
npm run lint    # ESLint, including the react-hooks rules
npm run typecheck  # tsc --noEmit, for the app and tests, then the Vite config
npm run format  # Prettier
```

The dev server only answers this machine; `npm run dev -- --host` makes it reachable from a phone on the same network. `npm run build` writes a static site to `dist/`: `index.html`, the hashed bundles in `dist/assets`, and a `_headers` file of security headers. `npm run preview` serves that build but ignores `_headers` and `netlify.toml`; to try it with both, run `npx netlify-cli serve --offline`.

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
- **Unknown URLs return a 200.** Every path serves the app, which then shows its Not Found page, because only the browser knows which routes exist. A missing file under `/assets/` still gets a real 404.
- **The emoji picker needs the network.** It fetches its emoji images from `cdn.jsdelivr.net`, which the production CSP allows; offline, the picker opens but renders no emoji.

## Deploying to Netlify

The app is a static site, so Netlify only needs to build it and serve `dist/`. [netlify.toml](netlify.toml) sets the build command, the publish folder and the Node version, so there are no build settings to enter.

1. Push the repository to GitHub, GitLab or Bitbucket, and in Netlify choose **Add new site → Import an existing project**.
2. Under **Site configuration → Environment variables**, add the six `VITE_` values from your `.env`. `.env` is not committed, and Vite writes these values into the bundle at build time, so redeploy after changing any of them.
3. In the Firebase console, under **Authentication → Settings → Authorized domains**, add the site's Netlify domain (`your-site.netlify.app`) and any custom domain. Google sign-in is refused on domains not listed there.
4. Deploy.

Besides the build settings, `netlify.toml` has two routing rules, which apply only when no file matches the path. A missing file under `/assets/`, such as a hashed bundle from an older deploy, gets a 404. Every other path gets `index.html`, and React Router picks the page.

Netlify also applies `dist/_headers`, which the build writes through the plugin in [security-headers.ts](security-headers.ts). It holds the Content Security Policy and the other security headers. The policy allows Firebase's sign-in frame from `VITE_AUTH_DOMAIN`, so a custom auth domain is picked up on the next build.

## Architecture

The app is a React 19 single-page app that Vite builds into static files. There is no server of its own and no backend API: the client reads and writes Firestore directly, so any static host can serve it. `App.tsx` fetches the signed-in user's whole document once per session, and `UserDataContext` holds that single copy: pages read it and change it through typed mutators that update state and persist in the same step.

```
meal-planner/
├── index.html                 HTML shell the app mounts into
├── vite.config.ts             Vite plugins (React SWC, Tailwind, security headers) and
│                              Vitest config
├── security-headers.ts        Vite plugin that writes dist/_headers: the CSP and other
│                              security headers
├── netlify.toml               Netlify build settings and routing rules
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
│   ├── main.tsx               Mounts App inside BrowserRouter
│   ├── App.tsx                Auth listener, one-off user data fetch, and route table
│   ├── state/
│   │   └── UserDataContext.tsx  The single copy of the user's data, and the
│   │                            mutators that update state and persist it
│   ├── index.css              Tailwind import and the custom color theme
│   │
│   ├── pages/
│   │   ├── Login.tsx          Google sign-in button
│   │   ├── Schedule.tsx       Rolling 14-day grid; fills in missing future days
│   │   ├── Meals.tsx          Meal library with create/edit/delete modals
│   │   ├── GroceryList.tsx    Grocery list, "Add From Meals" totaling, debounced saves
│   │   ├── Settings.tsx       The signed-in account, and a log out button
│   │   └── NotFound.tsx       Any unknown URL
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
│       ├── types.ts           UserData, MealType, Ingredient, GroceryItemType, and the
│       │                      meal slots (MEAL_SLOTS, MealSlot)
│       ├── errors.ts          Channel the Firestore helpers report failures on
│       └── utils.ts           Helpers for meal names and sorting, dates, schedule
│                              pruning, and quantity parsing
│
├── public/                    Static files copied into dist/ as-is (the favicon, and the
│                              404 page for missing assets)
│
└── tests/
    ├── setup.ts               Testing Library cleanup, jest-dom matchers, and the
    │                          global Firebase mock
    ├── userDataHarness.tsx    Renders a page inside a real UserDataContext
    ├── *.test.tsx             One suite per component or page, plus standalone
    │                          regression suites (see Testing)
    └── *.test.ts              Suites for modules without JSX: utils, errors, the
                               Firebase helpers, and the security headers
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

Say why at the top of such a file, so nobody folds it back into the main suite. [GroceryListKeys.test.tsx](tests/GroceryListKeys.test.tsx) is also standalone, though nothing requires it to be.

**Firebase is mocked for every suite.** [tests/setup.ts](tests/setup.ts) mocks `firebase/firebase` globally, so no suite touches the real project and the tests need neither a populated `.env` nor a network connection. A suite that needs specific behaviour — a rejected write, say — overrides that with its own `vi.mock`, and [tests/firebase.test.ts](tests/firebase.test.ts) unmocks it to test the module itself against a stubbed Firestore SDK.

Pages read their data from `UserDataContext` rather than props, so a page under test is rendered through `renderWithUserData` in [tests/userDataHarness.tsx](tests/userDataHarness.tsx), which stands in for what `App` does.
