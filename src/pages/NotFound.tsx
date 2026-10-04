import { Link } from 'react-router';
import Icon from '../components/Icon';

export default function NotFound() {
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
