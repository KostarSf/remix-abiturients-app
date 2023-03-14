import type { Direction, Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export function getFavDirections(id: User["id"]) {
  return prisma.direction.findMany({
    where: {
      inFavs: {
        some: {
          id,
        },
      },
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  name: User["name"],
  email: User["email"],
  password: string,
  staff?: User["staff"]
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      staff,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function toggleDirectionFav({
  id,
  dirId,
}: {
  dirId: Direction["id"];
  id: User["id"];
}) {
  const hasDirection = await prisma.user.findFirst({
    where: {
      id,
      favDirections: {
        some: {
          id: dirId,
        },
      },
    },
  });
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      favDirections: {
        ...(hasDirection
          ? {
              disconnect: {
                id: dirId,
              },
            }
          : {
              connect: {
                id: dirId,
              },
            }),
      },
    },
  });
}

export function getUserFavDirections(userId: User["id"]) {
  return prisma.direction.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    where: {
      inFavs: {
        some: {
          id: userId,
        },
      },
    },
  });
}
