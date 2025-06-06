import { UserData } from '../../firebase/firebase';

type Props = {
  userData: UserData | undefined;
};

export default function Meals({ userData }: Props) {
  return (
    <>
      <h1 className="text-blue-200">Meals</h1>
      <div>{JSON.stringify(userData)}</div>
    </>
  );
}
