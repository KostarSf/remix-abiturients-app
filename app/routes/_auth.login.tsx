import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import React from "react";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Некорректный Email", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { password: "Необходимо ввести пароль", email: null } },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return json(
      { errors: { password: "Пароль слишком короткий", email: null } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Введен неверный email или пароль", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Вход | ТвойКомпас",
  };
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/cabinet";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className='flex h-full flex-col items-stretch justify-center'>
      <Form method='post' className='flex flex-col items-stretch gap-14'>
        <div>
          <h1 className='text-4xl font-semibold tracking-widest'>
            Мы скучали!
          </h1>
          <p className='tracking-wide'>Войдите, чтобы продолжить</p>
        </div>

        <div className='flex flex-col gap-2'>
          <p>
            Тестовый аккаунт сотрудника: <br />
            <span className='font-semibold'>staff@mail.ru 12345</span>
          </p>
          <div>
            <input
              ref={emailRef}
              id='email'
              type='email'
              name='email'
              className='w-full bg-gray-200 py-2 px-5'
              placeholder='Email'
              required
              defaultValue={`newbie@mail.ru`}
              autoComplete='email'
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby='email-error'
              autoFocus={true}
            />
            {actionData?.errors?.email && (
              <div className='pt-1 leading-none text-red-700' id='email-error'>
                {actionData.errors.email}
              </div>
            )}
          </div>

          <div>
            <input
              ref={passwordRef}
              id='password'
              type='password'
              name='password'
              className='w-full bg-gray-200 py-2 px-5'
              placeholder='Пароль'
              required
              defaultValue={`12345`}
              autoComplete='current-password'
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby='password-error'
            />
            {actionData?.errors?.password && (
              <div
                className='pt-1 leading-none text-red-700'
                id='password-error'
              >
                {actionData.errors.password}
              </div>
            )}
          </div>

          <div>
            <input type='checkbox' name='remember' id='remember' />
            <label htmlFor='remember' className='ml-2 select-none'>
              Запомнить меня
            </label>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />
        </div>

        <div>
          <button
            type='submit'
            className='rounded-md bg-mygreen px-10 py-1 text-lg font-semibold transition-colors hover:bg-myorange'
          >
            Войти
          </button>
        </div>
      </Form>
    </div>
  );
}
