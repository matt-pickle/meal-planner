import { useContext } from 'react';
import { Link } from 'react-router';
import Icon from '../components/Icon';
import { HttpStatusContext } from '../state/HttpStatusContext';

export default function NotFound() {
  // Tells the server render to answer with a 404, so a mistyped URL or a stale
  // bookmark isn't reported as a page that exists
  useContext(HttpStatusContext)?.(404);

  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        <Icon name="hamburger" size="30px" /> Page Not Found
      </h1>
      <div className="bg-dark rounded-md p-6 max-w-md">
        <p className="text-light mb-6">
          There&apos;s no page at this address. It may have moved, or the link may be mistyped.
        </p>
        <Link
          to="/schedule"
          className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to your schedule
        </Link>
      </div>
    </>
  );
}
