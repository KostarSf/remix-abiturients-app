import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import React from "react";

import { createUserSession, getUserId } from "~/session.server";

import { createUser, getUserByEmail } from "~/models/user.server";
import { safeRedirect, validateEmail, validateName } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const staff = formData.get("staff");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateName(name)) {
    return json(
      {
        errors: {
          name: "Необходимо как минимум 3 символа",
          email: null,
          password: null,
        },
      },
      { status: 400 }
    );
  }

  if (!validateEmail(email)) {
    return json(
      { errors: { name: null, email: "Некорректный Email", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: "Необходимо ввести пароль",
        },
      },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: "Пароль слишком короткий",
        },
      },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          name: null,
          email: "Этот Email уже занят",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(name, email, password, Boolean(staff));

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Регистрация | ТвойКомпас",
  };
};

export default function Register() {
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();

  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.email) {
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
            Приветствуем!
          </h1>
          <p className='tracking-wide'>Присоединяйтесь к нашему сообществу!</p>
        </div>

        <div className='flex flex-col gap-2'>
          <div>
            <input
              ref={nameRef}
              autoFocus
              type='text'
              name='name'
              placeholder='Имя'
              className='w-full bg-gray-200 py-2 px-5'
              autoComplete='name'
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-describedby='name-error'
            />
            {actionData?.errors?.name && (
              <div className='pt-1 leading-none text-red-700' id='name-error'>
                {actionData.errors.name}
              </div>
            )}
          </div>

          <div>
            <input
              ref={emailRef}
              id='email'
              type='email'
              name='email'
              placeholder='Email'
              className='w-full bg-gray-200 py-2 px-5'
              autoComplete='email'
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby='email-error'
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
              placeholder='Пароль'
              className='w-full bg-gray-200 py-2 px-5'
              autoComplete='new-password'
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
            <input type='checkbox' name='staff' id='staff' />
            <label htmlFor='staff' className='ml-2 select-none'>
              Аккаунт сотрудника
            </label>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />
        </div>

        <div>
          <button
            type='submit'
            className='rounded-md bg-mygreen px-10 py-1 text-lg font-semibold transition-colors hover:bg-myorange'
          >
            Зарегистрироваться
          </button>
        </div>
      </Form>
    </div>
  );
}
