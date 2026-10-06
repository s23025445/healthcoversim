export type Quote = {
  id: number
  customerName: string
  coverType: 'Single' | 'Couple' | 'Family'
  applicant1Age: number
  applicant1CoverHistory: string
  applicant2Age: number | null
  applicant2CoverHistory: string | null
  hospitalCover: string
  extrasCover: string
  paymentFrequency: string
  annualDiscount: number
  notes: string | null
  createdAt: string
}

export type Calculation = {
  monthlyPremium: number
  yearlyPremiumBeforeDiscount: number
  hospitalPremiumTotal: number
  extrasPremiumTotal: number
  familyFee?: number
  applicants: Array<{ applicant: string; age: number; coverHistory: string; lhcLoadingPercentage: number; hospitalPremium: number }>
  yearlyDiscountPercentage?: number
  yearlyDiscountAmount?: number
  yearlyPremiumAfterDiscount?: number
  warnings: string[]
  lhcStatement: string
  explanation: string
}
