import { createContext } from 'react';

// Lets a page set the HTTP status of the response it is rendered into. The
// server render provides it and reads the status once the shell is ready; in
// the browser there is no response, so it is absent and pages skip it.
export const HttpStatusContext = createContext<((code: number) => void) | null>(null);
