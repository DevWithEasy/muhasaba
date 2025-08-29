export default function daysUntilBirthday(birthdayIso) {
  const today = new Date();
  const birthDate = new Date(birthdayIso);

  // মিলিসেকেন্ড ডিফারেন্স
  const diffTime = today - birthDate;

  // দিনের হিসাব
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

