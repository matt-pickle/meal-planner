import Button from '../components/Button';
import { logIn } from '../../firebase/firebase';
import { icon } from '../utils/utils';
import { notifyError } from '../utils/errors';

export default function Login() {
  async function handleLogin() {
    try {
      await logIn();
    } catch (error) {
      const code = (error as { code?: string }).code;
      // Closing the popup is a deliberate cancel, not a failure to report
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      notifyError(
        code === 'auth/popup-blocked'
          ? 'Your browser blocked the sign-in window. Allow popups for this site and try again.'
          : "Sign-in didn't work. Please try again."
      );
    }
  }

  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        {icon('hamburger', undefined, '30px')} Meal Planner
      </h1>
      <div className="bg-dark rounded-md p-6 max-w-md">
        <h2 className="text-subtitle text-xl font-semibold mb-4">Log In</h2>
        <p className="text-light mb-6">
          Sign in to plan your meals for the week and build your grocery list.
        </p>
        <Button
          // White disc keeps the multicolor G legible against the blue button
          icon={
            <span className="flex items-center justify-center bg-white rounded-full p-1">
              {icon('google', undefined, '16px')}
            </span>
          }
          text="Log In with Google"
          onClick={handleLogin}
          ariaLabel="log in with google"
        />
      </div>
    </>
  );
}
