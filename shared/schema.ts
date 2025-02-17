import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn"),
  description: text("description"),
  status: text("status").notNull().default("available"),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  borrowerName: text("borrower_name").notNull(),
  borrowedAt: timestamp("borrowed_at").notNull().defaultNow(),
  returnedAt: timestamp("returned_at"),
});

export const insertBookSchema = createInsertSchema(books)
  .omit({ id: true, status: true })
  .extend({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    isbn: z.string().optional(),
    description: z.string().optional(),
  });

export const insertLoanSchema = createInsertSchema(loans)
  .omit({ id: true, borrowedAt: true, returnedAt: true })
  .extend({
    borrowerName: z.string().min(1, "Borrower name is required"),
  });


  export type Book = typeof books.$inferSelect;
  export type InsertBook = z.infer<typeof insertBookSchema>;
  export type Loan = typeof loans.$inferSelect;
  export type InsertLoan = z.infer<typeof insertLoanSchema>;
