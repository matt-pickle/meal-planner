# Meal Planner

Plan two weeks of meals, then turn them into a grocery list in one click.

**[Try it live at mealplanner.mattpickle.net](https://mealplanner.mattpickle.net)**

Meal Planner keeps a library of the meals you cook and lets you assign them to breakfast, lunch, and dinner across the next 14 days. When it's time to shop, it adds up the ingredients for everything you've scheduled, so you know exactly what to buy. It works on desktop and on your phone, and you sign in with your Google account.

New accounts start with a few sample meals (Hamburgers, Spaghetti, Turkey Sandwich, and Cereal), so you can start filling in the schedule straight away.

## Features

### Meal library

- Create, edit, and delete meals. Each meal has a name, an emoji, and a list of ingredients with quantities and units.
- Every meal needs its own name, so the schedule and grocery list are never ambiguous.

### Two-week schedule

- See the next 14 days at a glance, each with a breakfast, lunch, and dinner slot.
- Pick a meal for any slot from a dropdown, or clear it.
- Rename a meal and every day it's scheduled for updates with it.
- Past days drop off automatically, so the schedule always starts today.

### Grocery list

- Add items by hand with a quantity and units, and check them off as you shop. Bought items move to a collapsible section out of the way.
- **Add From Meals** totals the ingredients of every meal scheduled from today onward, shows you the list to confirm, and merges it into your grocery list. Items with the same name and units are combined, so two recipes that each need a pound of ground beef become one line for two pounds. Capitalisation and stray spaces don't matter.

### Saving

- There's no save button. Your changes are saved automatically. Grocery list edits are saved a few seconds after you stop typing, and straight away if you leave the page or switch tabs.
- If a change can't be saved, a banner tells you so.
- Signing out in one tab signs you out everywhere you have the app open.

## Privacy and accessibility

- **Your data is yours.** You sign in with Google, so the app never sees or stores a password. Each account's meals, schedule, and grocery list can be read and changed only by that account.
- **Works with a keyboard.** Dropdowns, dialogs, and forms can all be used without a mouse, and dialogs close with Escape.
- **Fits your screen.** The navigation is a sidebar on desktop and a bottom bar on your phone.

## Built with

- [React 19](https://react.dev) and TypeScript, built with [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [React Router](https://reactrouter.com) for navigation
- [Firebase](https://firebase.google.com): Google sign-in through Firebase Authentication, and data storage in Cloud Firestore
- [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) for tests
- Hosted on [Netlify](https://www.netlify.com)

## Architecture

The app is a React 19 single-page app that Vite builds into static files. There is no server of its own and no backend API: the client reads and writes Firestore directly, so any static host can serve it. `App.tsx` fetches the signed-in user's whole document once per session, and `UserDataContext` holds that single copy: pages read it and change it through typed mutators that update state and persist in the same step.

```
meal-planner/
├── index.html                 HTML shell the app mounts into
├── vite.config.ts             Vite plugins (React SWC, Tailwind, security headers) and
│                              Vitest config
├── security-headers.ts        Vite plugin that writes dist/_headers: the CSP, the other
│                              security headers, and caching for the bundles
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
├── public/                    Static files copied into dist/ as-is (the icons, robots.txt,
│                              and the 404 page for missing assets)
│
└── tests/
    ├── setup.ts               Testing Library cleanup, jest-dom matchers, and the
    │                          global Firebase mock
    ├── userDataHarness.tsx    Renders a page inside a real UserDataContext
    ├── *.test.tsx             One suite per component or page, plus standalone
    │                          regression suites
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

Schedule slots reference meals by `id`, so renaming a meal keeps every day it is assigned to. Meal names must be unique — the create and edit forms reject a name another meal already uses. Documents written before meals and grocery items had ids are migrated on load: each one gets an id, and name-based schedule slots are rewritten to the id of the meal they named. The result is saved straight away. A legacy meal's id comes from its position in the list (`legacy-meal-0`, …), so every load and every open tab makes the same one, even if a save fails.
