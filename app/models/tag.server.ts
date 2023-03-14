import type { Direction, Tag } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Tag } from "@prisma/client";

export function getTag({ id }: Pick<Tag, "id">) {
  return prisma.tag.findFirst({
    select: { id: true, name: true },
    where: { id },
  });
}

export function getTagsListItems() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export function createTag({ name }: Pick<Tag, "name">) {
  return prisma.tag.create({
    data: {
      name,
    },
  });
}

export function deleteTag({ id }: Pick<Tag, "id">) {
  return prisma.tag.deleteMany({
    where: { id },
  });
}

export function removeDirectionFromTag({
  id,
  directionId,
}: {
  id: Tag["id"];
  directionId: Direction["id"];
}) {
  return prisma.tag.update({
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
