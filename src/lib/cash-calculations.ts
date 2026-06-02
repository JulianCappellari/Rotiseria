type CashSessionLike = {
  openingAmountInCents?: number | null
  expectedClosingAmountInCents?: number | null
  expectedAmountInCents?: number | null
  closingAmountInCents?: number | null
  actualClosingAmountInCents?: number | null
  differenceInCents?: number | null
  totalCashPaymentsInCents?: number | null
  cashSalesInCents?: number | null
  totalCashSalesInCents?: number | null
  totalCashExpensesInCents?: number | null
  cashExpensesInCents?: number | null
}

export function getCashPaymentsInCents(session: CashSessionLike) {
  return (
    session.totalCashPaymentsInCents ??
    session.cashSalesInCents ??
    session.totalCashSalesInCents ??
    0
  )
}

export function getCashExpensesInCents(session: CashSessionLike) {
  return session.totalCashExpensesInCents ?? session.cashExpensesInCents ?? 0
}

export function getExpectedCashClosingInCents(session: CashSessionLike) {
  return (
    session.expectedClosingAmountInCents ??
    session.expectedAmountInCents ??
    (session.openingAmountInCents ?? 0) +
      getCashPaymentsInCents(session) -
      getCashExpensesInCents(session)
  )
}

export function getActualCashClosingInCents(session: CashSessionLike) {
  return (
    session.actualClosingAmountInCents ??
    session.closingAmountInCents ??
    getExpectedCashClosingInCents(session)
  )
}

export function getCashDifferenceInCents(session: CashSessionLike) {
  return (
    getActualCashClosingInCents(session) - (session.openingAmountInCents ?? 0)
  )
}

export function getCashControlDifferenceInCents(session: CashSessionLike) {
  const hasActualClosing =
    session.actualClosingAmountInCents !== null &&
    session.actualClosingAmountInCents !== undefined
      ? true
      : session.closingAmountInCents !== null &&
        session.closingAmountInCents !== undefined

  if (hasActualClosing) {
    return (
      getActualCashClosingInCents(session) -
      getExpectedCashClosingInCents(session)
    )
  }

  return session.differenceInCents ?? 0
}
