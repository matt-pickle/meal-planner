import { StrictMode } from 'react';
import { type RenderToPipeableStreamOptions, renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';

export function render(_url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <StaticRouter location={`/${_url}`}>
        <App />
      </StaticRouter>
    </StrictMode>,
    options
  );
}