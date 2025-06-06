import Button from '../components/Button';
import { logIn } from '../../firebase/firebase.ts';

export default function Login() {
  async function handleLogin() {
    try {
      await logIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <>
      <h1 className="text-blue-600">Login</h1>
      <Button text="Log In with Google" onClick={handleLogin} />
    </>
  );
}
