/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { createGraphQLHandler } from '@miragejs/graphql';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { GraphQLError } from 'graphql';
import { createServer } from 'miragejs';
import { sign, verify } from './jwt';
import { schema } from './schema';

const getCurrentUser = async (context: any) => {
  const token = context.request.requestHeaders.authorization;
  if (!token) throw new GraphQLError('unauthorized');
  const payload = await verify(token.slice(7));
  const user = context.mirageSchema.users.findBy({ id: payload.id });
  if (!user) throw new GraphQLError('user does not exist');
  return user;
};

export const server = createServer({
  routes() {
    const graphQLHandler = createGraphQLHandler(schema, this.schema, {
      context: undefined,
      root: undefined,
      resolvers: {
        Query: {
          async userTodos(_obj: any, _args: any, context: any, _info: any) {
            const user = await getCurrentUser(context);
            return user.todos.models;
          }
        },
        Mutation: {
          createUser(_obj: any, args: any, context: any, _info: any) {
            const { email, password } = args;
            const oldUser = context.mirageSchema.users.findBy({ email });
            if (oldUser) {
              throw new GraphQLError('email exists');
            }
            const passwordHashed = bcrypt.hashSync(password, 8);
            const now = dayjs().valueOf();
            const user = context.mirageSchema.create('User', {
              email,
              passwordHashed,
              createdAt: now
            });
            return user;
          },

          async createTodo(_obj: any, args: any, context: any, _info: any) {
            const { content } = args;
            const user = await getCurrentUser(context);
            const now = dayjs().valueOf();
            const todo = context.mirageSchema.create('Todo', {
              content,
              user,
              status: 'TODO',
              createdAt: now,
              updatedAt: now
            });
            return todo;
          },

          async updateTodo(_obj: any, args: any, context: any, _info: any) {
            const {
              todo: { id, content, status }
            } = args;
            const user = await getCurrentUser(context);
            const todo = user.todos.models.find((t: any) => t.id === id);
            if (!todo) throw new GraphQLError('todo does not exist');
            const now = dayjs().valueOf();
            if (content) todo.update({ content, updatedAt: now });
            if (status) todo.update({ status, updatedAt: now });
            return todo;
          },

          async deleteTodo(_obj: any, args: any, context: any, _info: any) {
            const { id } = args;
            const user = await getCurrentUser(context);
            const todo = user.todos.models.find((t: any) => t.id === id);
            if (!todo) throw new GraphQLError('todo does not exist');
            todo.destroy();
            return true;
          },

          async token(_obj: any, args: any, context: any, _info: any) {
            const { email, password } = args;
            const user = context.mirageSchema.users.findBy({ email });
            if (!user) throw new GraphQLError('user does not exist or wrong password');
            const match = bcrypt.compareSync(password, user.passwordHashed);
            if (!match) throw new GraphQLError('user does not exist or wrong password');
            return sign({ id: user.id, email: user.email });
          }
        }
      }
    });

    this.post('/graphql', graphQLHandler);
  },

  seeds(server) {
    const now = dayjs().valueOf();
    server.create('User', {
      email: 'test@skand.io',
      passwordHashed: bcrypt.hashSync('testtest', 8),
      createdAt: now
    } as any);
  }
});
