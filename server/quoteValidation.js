// The options the client is allowed to send.
export const supportedOptions = {
  coverTypes: ["Single", "Couple", "Family"],
  hospitalCoverLevels: ["None", "Basic", "Bronze", "Silver", "Gold"],
  extrasCoverLevels: ["None", "Basic", "Standard", "Premium"],
  paymentFrequencies: ["Weekly", "Fortnightly", "Monthly", "Quarterly", "Yearly"],
  coverHistories: ["Yes", "No", "Not sure"],
};

// Checks the quote before we save or update it.
export function validateQuote(body) {
  const errors = [];

  // Make sure the request sent us a JSON object.
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: [{ field: "body", message: "A JSON object is required." }] };
  }

  // Clean up text fields before saving them.
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const applicant1CoverHistory =
    typeof body.applicant1CoverHistory === "string" ? body.applicant1CoverHistory.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

  // Customer name cannot be empty.
  if (!customerName) {
    errors.push({ field: "customerName", message: "customerName is required." });
  }

  // Check the chosen cover type is one we support.
  if (!supportedOptions.coverTypes.includes(body.coverType)) {
    errors.push({
      field: "coverType",
      message: "coverType must be Single, Couple, or Family.",
    });
  }

  // Applicant 1 must be between 18 and 100.
  if (!Number.isInteger(body.applicant1Age) || body.applicant1Age < 18 || body.applicant1Age > 100) {
    errors.push({ field: "applicant1Age", message: "applicant1Age must be from 18 to 100." });
  }

  // Applicant 1 needs to choose their cover history.
  if (!applicant1CoverHistory) {
    errors.push({
      field: "applicant1CoverHistory",
      message: "applicant1CoverHistory is required.",
    });
  // If they typed something, make sure it is an allowed option.
  } else if (!supportedOptions.coverHistories.includes(applicant1CoverHistory)) {
    errors.push({
      field: "applicant1CoverHistory",
      message: "applicant1CoverHistory must be Yes, No, or Not sure.",
    });
  }

  // Check the hospital cover level.
  if (!supportedOptions.hospitalCoverLevels.includes(body.hospitalCover)) {
    errors.push({
      field: "hospitalCover",
      message: `hospitalCover must be one of: ${supportedOptions.hospitalCoverLevels.join(", ")}.`,
    });
  }

  // Check the extras cover level.
  if (!supportedOptions.extrasCoverLevels.includes(body.extrasCover)) {
    errors.push({
      field: "extrasCover",
      message: `extrasCover must be one of: ${supportedOptions.extrasCoverLevels.join(", ")}.`,
    });
  }

  // Check the payment frequency.
  if (!supportedOptions.paymentFrequencies.includes(body.paymentFrequency)) {
    errors.push({
      field: "paymentFrequency",
      message: `paymentFrequency must be one of: ${supportedOptions.paymentFrequencies.join(", ")}.`,
    });
  }

  const annualDiscount = body.annualDiscount ?? 0;
  // Discount can only be from 0% to 10%.
  if (
    typeof annualDiscount !== "number" ||
    !Number.isFinite(annualDiscount) ||
    annualDiscount < 0 ||
    annualDiscount > 10
  ) {
    errors.push({
      field: "annualDiscount",
      message: "annualDiscount must be a number from 0 to 10.",
    });
  }

  // Notes are optional, but need to be text if they are included.
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    errors.push({ field: "notes", message: "notes must be a string when provided." });
  }

  let applicant2Age = null;
  let applicant2CoverHistory = null;

  // Only Couple and Family need a second applicant.
  // Couple and Family need details for Applicant 2.
  if (body.coverType === "Couple" || body.coverType === "Family") {
    applicant2CoverHistory =
      typeof body.applicant2CoverHistory === "string" ? body.applicant2CoverHistory.trim() : "";

    // Applicant 2 also needs to be between 18 and 100.
    if (!Number.isInteger(body.applicant2Age) || body.applicant2Age < 18 || body.applicant2Age > 100) {
      errors.push({ field: "applicant2Age", message: "applicant2Age must be from 18 to 100." });
    } else {
      applicant2Age = body.applicant2Age;
    }

    // Applicant 2 needs a cover history too.
    if (!applicant2CoverHistory) {
      errors.push({
        field: "applicant2CoverHistory",
        message: "applicant2CoverHistory is required for Couple and Family cover.",
      });
    // Their history must also be one of the allowed options.
    } else if (!supportedOptions.coverHistories.includes(applicant2CoverHistory)) {
      errors.push({
        field: "applicant2CoverHistory",
        message: "applicant2CoverHistory must be Yes, No, or Not sure.",
      });
    }
  }

  // Send the errors back instead of saving bad data.
  if (errors.length > 0) return { errors };

  return {
    values: {
      customerName,
      coverType: body.coverType,
      applicant1Age: body.applicant1Age,
      applicant1CoverHistory,
      applicant2Age,
      applicant2CoverHistory,
      hospitalCover: body.hospitalCover,
      extrasCover: body.extrasCover,
      paymentFrequency: body.paymentFrequency,
      annualDiscount,
      notes,
    },
  };
}
