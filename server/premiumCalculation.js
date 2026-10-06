const hospitalPrices = {
  None: 0,
  Basic: 90,
  Bronze: 120,
  Silver: 160,
  Gold: 220,
};

const extrasPrices = {
  None: 0,
  Basic: 25,
  Standard: 45,
  Premium: 70,
};

const lhcStatement =
  "Lifetime Health Cover loading applies only to hospital cover. It does not apply to extras cover.";

// Works out all prices for one saved quote.
export function calculatePremium(quote) {
  const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;
  const hospitalPrice = hospitalPrices[quote.hospitalCover];
  const extrasPrice = extrasPrices[quote.extrasCover];

  // Stop if an old saved quote has a cover level we do not know.
  if (hospitalPrice === undefined || extrasPrice === undefined) {
    throw new Error("The saved hospital or extras cover level is not supported.");
  }

  const applicants = [
    {
      name: "Applicant 1",
      age: quote.applicant1Age,
      coverHistory: quote.applicant1CoverHistory,
    },
  ];

  // Couple and Family cover have a second adult.
  if (quote.coverType === "Couple" || quote.coverType === "Family") {
    applicants.push({
      name: "Applicant 2",
      age: quote.applicant2Age,
      coverHistory: quote.applicant2CoverHistory,
    });
  }

  // Stop if the saved cover type is not valid.
  if (!["Single", "Couple", "Family"].includes(quote.coverType)) {
    throw new Error("The saved cover type is not supported.");
  }

  const warnings = [];
  let hospitalPremiumTotal = 0;
  const applicantBreakdown = applicants.map((applicant) => {
    // Each adult needs a valid age before we can work out LHC.
    if (!Number.isInteger(applicant.age) || applicant.age < 18 || applicant.age > 100) {
      throw new Error(`${applicant.name} has an invalid age.`);
    }

    // We only calculate using the three allowed history choices.
    if (!["Yes", "No", "Not sure"].includes(applicant.coverHistory)) {
      throw new Error(`${applicant.name} has an invalid hospital cover history.`);
    }

    let lhcLoadingPercentage = 0;
    // LHC only applies when the person has no history, is over 30, and has hospital cover.
    if (applicant.coverHistory === "No" && applicant.age > 30 && hospitalPrice > 0) {
      lhcLoadingPercentage = (applicant.age - 30) * 2;
    }

    // Let the user know this part of the quote might not be exact.
    if (applicant.coverHistory === "Not sure") {
      warnings.push(`${applicant.name}'s cover history is Not sure, so this quote may be inaccurate.`);
    }

    const hospitalPremium = roundMoney(hospitalPrice * (1 + lhcLoadingPercentage / 100));
    hospitalPremiumTotal += hospitalPremium;

    return {
      applicant: applicant.name,
      age: applicant.age,
      coverHistory: applicant.coverHistory,
      lhcLoadingPercentage,
      hospitalPremium,
    };
  });

  hospitalPremiumTotal = roundMoney(hospitalPremiumTotal);
  const extrasPremiumTotal = roundMoney(extrasPrice * applicants.length);
  const familyFee = quote.coverType === "Family" ? 30 : 0;
  const monthlyPremium = roundMoney(hospitalPremiumTotal + extrasPremiumTotal + familyFee);
  const yearlyPremiumBeforeDiscount = roundMoney(monthlyPremium * 12);

  const breakdown = {
    monthlyPremium,
    yearlyPremiumBeforeDiscount,
    hospitalPremiumTotal,
    extrasPremiumTotal,
    applicants: applicantBreakdown,
    warnings,
    lhcStatement,
    explanation: `The monthly premium is hospital ($${hospitalPremiumTotal}) plus extras ($${extrasPremiumTotal})${familyFee ? ` plus the $${familyFee} Family fee` : ""}.`,
  };

  // Only show the Family fee when there is one.
  if (familyFee) breakdown.familyFee = familyFee;

  // The annual discount only works for Yearly payments.
  if (quote.paymentFrequency === "Yearly") {
    const yearlyDiscountPercentage = quote.annualDiscount;
    const yearlyPremiumAfterDiscount = roundMoney(
      yearlyPremiumBeforeDiscount * (1 - yearlyDiscountPercentage / 100),
    );

    breakdown.yearlyDiscountPercentage = yearlyDiscountPercentage;
    breakdown.yearlyDiscountAmount = roundMoney(yearlyPremiumBeforeDiscount - yearlyPremiumAfterDiscount);
    breakdown.yearlyPremiumAfterDiscount = yearlyPremiumAfterDiscount;
  }

  return breakdown;
}
