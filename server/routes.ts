import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertLoanSchema } from "@shared/schema";
import { z } from "zod";


export async function registerRoutes(app: Express) {
  // Books
  app.get("/api/books", async (req, res) => {
    const { q } = req.query;
    if (typeof q === "string" && q.length > 0) {
      const books = await storage.searchBooks(q);
      return res.json(books);
    }
    
    const books = await storage.getBooks();
    res.json(books);
  });

  app.get("/api/books/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const book = await storage.getBook(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  });

  app.post("/api/books", async (req, res) => {
    const result = insertBookSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }
    const book = await storage.createBook(result.data);
    res.status(201).json(book);
  });

  app.delete("/api/books/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteBook(id);
    if (!success) return res.status(404).json({ message: "Book not found" });
    res.status(204).send();
  });

  // Loans
  app.get("/api/loans", async (req, res) => {
    const { bookId, borrower } = req.query;
    
    if (typeof borrower === "string") {
      const loans = await storage.getLoansByBorrower(borrower);
      return res.json(loans);
    }
    
    if (typeof bookId === "string") {
      const loans = await storage.getLoans(parseInt(bookId));
      return res.json(loans);
    }
    
    const loans = await storage.getLoans();
    res.json(loans);
  });

  app.post("/api/loans", async (req, res) => {
    const result = insertLoanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }
    
    const book = await storage.getBook(result.data.bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.status === "borrowed") {
      return res.status(400).json({ message: "Book is already borrowed" });
    }
    
    const loan = await storage.createLoan(result.data);
    res.status(201).json(loan);
  });

  app.post("/api/loans/:bookId/return", async (req, res) => {
    const bookId = parseInt(req.params.bookId);
    const loan = await storage.returnBook(bookId);
    if (!loan) {
      return res.status(404).json({ message: "No active loan found for this book" });
    }
    res.json(loan);
  });

  return createServer(app);
}
