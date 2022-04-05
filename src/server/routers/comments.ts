/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createRouter } from '~/server/createRouter';

const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  name: true,
  text: true,
  createdAt: true,
  updatedAt: true,
});

export const commentRouter = createRouter()
  .query('byPostId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const comments = await prisma.comment.findMany({
        where: { postId: id },
        select: defaultCommentSelect,
      });

      return comments;
    },
  })
  .mutation('add', {
    input: z.object({
      name: z.string().min(1),
      text: z.string().min(1),
      postId: z.string().uuid(),
    }),
    async resolve({ input }) {
      const comment = await prisma.comment.create({
        data: input,
        select: defaultCommentSelect,
      });

      return comment;
    },
  });
