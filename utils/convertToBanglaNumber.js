export default function convertToBanglaNumbers(number) {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  return number.toString().split('').map(char => {
    const index = englishNumbers.indexOf(char);
    return index !== -1 ? banglaNumbers[index] : char;
  }).join('');
}