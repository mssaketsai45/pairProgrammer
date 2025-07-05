const { pgTable, text, timestamp, uuid, integer, primaryKey, boolean } = require('drizzle-orm/pg-core');

// NextAuth Users table
const users = pgTable('user', { // Note: singular 'user' to match NextAuth
  id: text('id').primaryKey(), // Text ID to match NextAuth
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
});

// NextAuth Accounts table
const accounts = pgTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

// NextAuth Sessions table
const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// NextAuth Verification Tokens table
const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Rooms table - matches your frontend structure
const rooms = pgTable('room', { // Note: singular 'room' to match frontend
  id: uuid('id').defaultRandom().primaryKey(), // UUID to match frontend
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags'), // Stored as comma-separated string
  githubRepo: text('githubRepo'), // camelCase to match frontend
  userId: text('userId').references(() => users.id).notNull(), // Text reference
});

// Chat Messages table
const messages = pgTable('message', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  messageType: text('message_type').default('text'), // 'text', 'system', 'video_invite'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { users, accounts, sessions, verificationTokens, rooms, messages };
