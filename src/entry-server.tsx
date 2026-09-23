import { StrictMode } from 'react';
import { type RenderToPipeableStreamOptions, renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { HttpStatusContext } from './state/HttpStatusContext';

// `setStatus` is called by a page that needs a status other than 200 (the
// Not Found page); it happens during the shell render, before onShellReady.
export function render(
  _url: string,
  options?: RenderToPipeableStreamOptions,
  setStatus?: (code: number) => void,
) {
  return renderToPipeableStream(
    <StrictMode>
      <HttpStatusContext.Provider value={setStatus ?? null}>
        <StaticRouter location={`/${_url}`}>
          <App />
        </StaticRouter>
      </HttpStatusContext.Provider>
    </StrictMode>,
    options,
  );
}
