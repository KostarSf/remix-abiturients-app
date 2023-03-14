import { Form, Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <div className='mt-24 text-center'>
      <p className='text-xl font-semibold'>Here we go again</p>
      {user ? (
        <div>
          <Link to={`/cabinet`} className='text-blue-600 underline'>
            Перейти в личный кабинет
          </Link>
        </div>
      ) : (
        <div className='space-x-4'>
          <Link to={`/login`} className='text-blue-600 underline'>
            Вход
          </Link>
          <Link to={`/join`} className='text-blue-600 underline'>
            Регистрация
          </Link>
        </div>
      )}
    </div>
  );
}
