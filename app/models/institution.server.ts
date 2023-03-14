import type { Direction, Institution } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Institution } from "@prisma/client";

export function getInstitution({ id }: Pick<Institution, "id">) {
  return prisma.institution.findFirst({
    select: {
      id: true,
      name: true,
      city: true,
      directions: { select: { id: true, name: true, description: true } },
      events: {
        select: { id: true, name: true, description: true, date: true },
      },
    },
    where: { id },
  });
}

export function getInstitutionsListItems(searchQuery: string | null) {
  const search = searchQuery
    ? searchQuery.trim() === ""
      ? null
      : searchQuery.trim()
    : null;
  return prisma.institution.findMany({
    select: {
      id: true,
      name: true,
      city: true,
    },
    orderBy: {
      name: "asc",
    },
    ...(search && {
      where: {
        OR: [
          {
            city: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
      },
    }),
  });
}

export function createInstitution({
  name,
  city,
}: Pick<Institution, "name" | "city">) {
  return prisma.institution.create({
    data: {
      name,
      city,
    },
  });
}

export function deleteInstitution({ id }: Pick<Institution, "id">) {
  return prisma.institution.deleteMany({
    where: { id },
  });
}

export function removeDirectionFromInstitution({
  id,
  directionId,
}: {
  id: Institution["id"];
  directionId: Direction["id"];
}) {
  return prisma.institution.update({
    where: {
      id,
    },
    data: {
      directions: {
        disconnect: {
          id: directionId,
        },
      },
    },
  });
}
