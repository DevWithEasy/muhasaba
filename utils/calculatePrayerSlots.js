export default function calculatePrayerSlots(prayerTimes) {
  const addMinutes = (timeStr, minutes) => {
    const [hours, mins] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  return [
    {
      name: "fajr",
      start: prayerTimes.Fajr,
      end: prayerTimes.Sunrise,
    },
    {
      name: "morning_restricted",
      start: prayerTimes.Sunrise,
      end: addMinutes(prayerTimes.Sunrise, 15),
    },
    {
      name: "israkh",
      start: addMinutes(prayerTimes.Sunrise, 25),
      end: addMinutes(prayerTimes.Dhuhr, -3),
    },
    {
      name: "dhuhr_restricted",
      start: addMinutes(prayerTimes.Dhuhr, -3),
      end: prayerTimes.Dhuhr,
    },
    {
      name: "dhuhr",
      start: prayerTimes.Dhuhr,
      end: addMinutes(prayerTimes.Asr, -1),
    },
    {
      name: "asr",
      start: prayerTimes.Asr,
      end: addMinutes(prayerTimes.Maghrib, -1),
    },
    {
      name: "maghrib",
      start: prayerTimes.Maghrib,
      end: addMinutes(prayerTimes.Isha, -1),
    },
    {
      name: "isha",
      start: prayerTimes.Isha,
      end: prayerTimes.Midnight,
    },
{
      name: "midnight",
      start: prayerTimes.Midnight,
      end: prayerTimes.Lastthird,
    },
    {
      name: "tahajjud",
      start: prayerTimes.Lastthird,
      end: addMinutes(prayerTimes.Fajr, -1),
    },
  ];
}
