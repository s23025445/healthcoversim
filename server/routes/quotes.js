import { Router } from "express";
import db from "../db.js";
import { calculatePremium } from "../premiumCalculation.js";
import { validateQuote } from "../quoteValidation.js";

const router = Router();

// These are the quote columns we want from the database.
const quoteColumns = `
  id, customer_name, cover_type, applicant1_age, applicant1_cover_history,
  applicant2_age, applicant2_cover_history, hospital_cover, extras_cover,
  payment_frequency, annual_discount, notes, created_at
`;

// SQL queries we can reuse whenever a request comes in.
const findQuote = db.prepare(`SELECT ${quoteColumns} FROM quotes WHERE id = ?`);
const listQuotes = db.prepare(`SELECT ${quoteColumns} FROM quotes ORDER BY id DESC`);
const insertQuote = db.prepare(`
  INSERT INTO quotes (
    customer_name, cover_type, applicant1_age, applicant1_cover_history,
    applicant2_age, applicant2_cover_history, hospital_cover, extras_cover,
    payment_frequency, annual_discount, notes
  ) VALUES (
    @customerName, @coverType, @applicant1Age, @applicant1CoverHistory,
    @applicant2Age, @applicant2CoverHistory, @hospitalCover, @extrasCover,
    @paymentFrequency, @annualDiscount, @notes
  )
`);
const updateQuote = db.prepare(`
  UPDATE quotes SET
    customer_name = @customerName, cover_type = @coverType,
    applicant1_age = @applicant1Age,
    applicant1_cover_history = @applicant1CoverHistory,
    applicant2_age = @applicant2Age,
    applicant2_cover_history = @applicant2CoverHistory,
    hospital_cover = @hospitalCover, extras_cover = @extrasCover,
    payment_frequency = @paymentFrequency,
    annual_discount = @annualDiscount, notes = @notes
  WHERE id = @id
`);
const deleteQuote = db.prepare("DELETE FROM quotes WHERE id = ?");

function formatQuote(row) {
  // Change database names like customer_name into customerName for the API.
  return {
    id: row.id,
    customerName: row.customer_name,
    coverType: row.cover_type,
    applicant1Age: row.applicant1_age,
    applicant1CoverHistory: row.applicant1_cover_history,
    applicant2Age: row.applicant2_age,
    applicant2CoverHistory: row.applicant2_cover_history,
    hospitalCover: row.hospital_cover,
    extrasCover: row.extras_cover,
    paymentFrequency: row.payment_frequency,
    annualDiscount: row.annual_discount,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function quoteId(value) {
  // Make sure the ID is a normal positive number.
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validateRequest(body, res) {
  // Check the data before we try to save it.
  const result = validateQuote(body);
  if (result.errors) {
    res.status(400).json({ error: "Validation failed.", details: result.errors });
    return null;
  }

  return result.values;
}

router.get("/", (req, res) => {
  // Get all saved quotes, newest ones first.
  res.json({ quotes: listQuotes.all().map(formatQuote) });
});

router.get("/:id", (req, res) => {
  // Get one quote using its ID.
  const id = quoteId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid quote ID." });

  const quote = findQuote.get(id);
  if (!quote) return res.status(404).json({ error: "Quote not found." });

  const formattedQuote = formatQuote(quote);

  try {
    return res.json({ quote: formattedQuote, calculation: calculatePremium(formattedQuote) });
  } catch (error) {
    return res.status(422).json({
      error: "Quote cannot be calculated.",
      details: error.message,
      quote: formattedQuote,
    });
  }
});

router.post("/", (req, res) => {
  // Check it first, then save the new quote.
  const values = validateRequest(req.body, res);
  if (!values) return;

  const result = insertQuote.run(values);
  return res.status(201).json({ quote: formatQuote(findQuote.get(result.lastInsertRowid)) });
});

router.put("/:id", (req, res) => {
  // Update a quote with the new details.
  const id = quoteId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid quote ID." });

  const values = validateRequest(req.body, res);
  if (!values) return;

  const result = updateQuote.run({ ...values, id });
  if (result.changes === 0) return res.status(404).json({ error: "Quote not found." });

  return res.json({ quote: formatQuote(findQuote.get(id)) });
});

router.delete("/:id", (req, res) => {
  // Delete the quote with this ID.
  const id = quoteId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid quote ID." });

  if (deleteQuote.run(id).changes === 0) {
    return res.status(404).json({ error: "Quote not found." });
  }

  return res.status(204).send();
});

export default router;
