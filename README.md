# Heyana Telephone (React Native + Expo)

Mobile app for the Heyana Objects system. It uses the same [NestJS API](../heyana-backend) as the [web app](../heyana-web): list objects, create (with image from device), view one object, delete. Changes appear in **real time** via Socket.IO (e.g. create on web and see it on the app without refreshing).

---

## Quick start

1. **Backend**

   The API (and Socket.IO) must be running. See [heyana-backend/README.md](../heyana-backend/README.md).

2. **Environment**

   Create `.env` in the project root (or set env vars) and set:

   - **`EXPO_PUBLIC_API_URL`** — e.g. `http://localhost:3000` for simulator/emulator. For a **physical device**, use your machine’s LAN IP (e.g. `http://192.168.1.10:3000`) so the phone can reach the API on the same Wi‑Fi.

3. **Run**

   ```bash
   npm install
   npx expo start
   ```

   Then open the app in the iOS simulator, Android emulator, Expo Go, or web (`w` in the terminal). For a physical device, ensure it’s on the same Wi‑Fi as your PC.

---

## Features

- **Home tab** — List of objects from `GET /objects`. Pull to refresh. Tap an item to open its detail. List updates in real time when objects are created or deleted (Socket.IO). Card title and description use theme colors so they’re readable in light and dark mode.
- **Create tab** — Form: title, description, and “Pick image from device” (expo-image-picker). Submits to `POST /objects` (multipart). On success, you’re taken to the **detail screen** of the object you just created.
- **Object detail** — Screen for one object (image, title, description, createdAt). Delete button calls `DELETE /objects/:id` then goes back to the list.

---

## Project structure

```
app/
├── _layout.tsx           # Root Stack: (tabs), object/[id], modal
├── (tabs)/
│   ├── _layout.tsx      # Tabs: Home, Create (Explore hidden via href: null)
│   ├── index.tsx        # Home: list of objects + Socket.IO, theme-aware cards
│   └── create.tsx       # Create form + image picker, then navigate to object detail
├── object/
│   └── [id].tsx         # Single object detail + delete
└── modal.tsx             # Starter modal (unchanged)

components/
└── ui/
    └── icon-symbol.tsx   # Tab icons (Home, Create); maps SF Symbol names to MaterialIcons

lib/
└── api.ts               # getObjects, getObject, createObject, deleteObject

hooks/
└── use-objects-socket.ts # Socket.IO: object:created, object:deleted

types/
└── object.ts            # ObjectItem type

constants/
└── theme.ts             # Colors (light/dark), Fonts
```

---

## API & real-time

- **REST:** Same as web — `GET /objects`, `GET /objects/:id`, `POST /objects` (multipart: title, description, image), `DELETE /objects/:id`.
- **Socket.IO:** Connects to `EXPO_PUBLIC_API_URL`. Listens for `object:created` and `object:deleted` so the list updates without refresh.

---

## Image picker & upload

- **expo-image-picker** is used to pick an image from the device. On first use, the app asks for photo library permission.
- **Native (iOS/Android):** The picker returns a local `file://` (or similar) URI. We send it to the API as `{ uri, type, name }` in `FormData`; React Native’s `fetch` handles that.
- **Web:** The picker returns a **blob URL** (`blob:http://...`). The browser doesn’t support the RN-style object in `FormData`. In `lib/api.ts`, when the URI starts with `blob:`, we `fetch(uri)`, get the blob, and append it to `FormData` as a real file so the backend receives a proper image file.

---

## Theming (light / dark)

- **Create screen:** Inputs use theme `text` and `icon` colors so typed text and placeholders are visible in both themes. The submit button uses a fixed primary blue (`Colors.light.tint`) with white text so it’s always readable.
- **List (Home):** Card background is theme-aware (light gray in light mode, dark gray in dark mode). Title and description use `colors.text` so they contrast with the card in both themes.

---

## Scripts

- `npm start` / `npx expo start` — Start Expo dev server
- `npx expo start --ios` — Open iOS simulator
- `npx expo start --android` — Open Android emulator
- `npx expo start --web` — Open in browser

---

## Tech stack

- **Expo** (SDK 54), **React Native**, **expo-router** (file-based routing)
- **expo-image** — Display images (including S3/Supabase URLs)
- **expo-image-picker** — Pick image from device for create
- **socket.io-client** — Real-time updates
- **TypeScript**

No deployment required; run and test on your machine/emulator/device.

---

## Interview-style notes

- **Why Expo?** Fast setup, one codebase for iOS, Android, and web. Expo Go for quick testing; EAS Build when you need production builds. File-based routing with expo-router keeps navigation simple.
- **Why `EXPO_PUBLIC_` for the API URL?** Expo exposes only env vars with this prefix to the client. The app needs the API base URL at runtime for fetch and Socket.IO.
- **Why different upload handling for blob vs file URI?** On native, `FormData` accepts the `{ uri, type, name }` shape. In the browser, `FormData` expects a `Blob` or `File`. So we detect `blob:` and convert the blob URL to a blob before appending.
- **How does real-time work?** Same as web: the app connects to the backend with Socket.IO and subscribes to `object:created` and `object:deleted`. The list state is updated in the hook callbacks so new items appear and deleted items disappear without a refresh.
- **Why navigate to the new object’s detail after create?** Better UX: the user immediately sees the object they created (and can delete or go back to the list) instead of staying on the form or only seeing an alert.
- **Why hide the Explore tab?** The starter template had Home and Explore; we replaced Explore with Create and hid the old Explore route with `href: null` so only Home and Create show in the tab bar.
