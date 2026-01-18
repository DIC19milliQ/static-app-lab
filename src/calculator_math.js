export const calculateSavingsGrowth = ({
  initial = 0,
  monthly = 0,
  annualRate = 0,
  years = 1,
}) => {
  const safeYears = Math.max(1, years);
  const monthlyRate = annualRate / 100 / 12;
  let balance = initial;
  let totalContrib = initial;
  let totalInterest = 0;

  const yearly = [];

  for (let year = 1; year <= safeYears; year += 1) {
    let yearContrib = 0;
    let yearInterest = 0;
    for (let month = 0; month < 12; month += 1) {
      const interest = balance * monthlyRate;
      balance += interest + monthly;
      totalInterest += interest;
      totalContrib += monthly;
      yearContrib += monthly;
      yearInterest += interest;
    }
    yearly.push({
      year,
      balance,
      contributions: yearContrib,
      interest: yearInterest,
    });
  }

  return {
    finalBalance: balance,
    totalContrib,
    totalInterest,
    yearly,
  };
};
