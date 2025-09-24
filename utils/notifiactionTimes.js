export default function notificationTimes(prayerTimes, nextDayFajrTime = null) {
  const addMinutes = (timeStr, minutes) => {
    const [hours, mins] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  const notifications = [
    {
      name: "fajr",
      time: prayerTimes.Fajr,
      content: {
        title: "ফজরের নামাজের সময়",
        body: "ফজরের নামাজ পড়ুন",
      },
      route: "/pages/prayer",
    },
    {
      name: "sayyidul_istighfar",
      time: addMinutes(prayerTimes.Sunrise, 5),
      content: {
        title: "সাইয়িদুল ইস্তিগফার",
        body: "দিনের শুরুতে সাইয়িদুল ইস্তিগফার পড়ুন",
      },
      route: "/pages/istighfer",
    },
    {
      name: "dhuhr",
      time: prayerTimes.Dhuhr,
      content: {
        title: "জোহরের নামাজের সময়",
        body: "জোহরের নামাজ পড়ুন",
      },
      route: "/pages/prayer",
    },
    {
      name: "asr",
      time: prayerTimes.Asr,
      content: {
        title: "আসরের নামাজের সময়",
        body: "আসরের নামাজ পড়ুন",
      },
      route: "/pages/prayer",
    },
    {
      name: "maghrib",
      time: prayerTimes.Maghrib,
      content: {
        title: "মাগরিবের নামাজের সময়",
        body: "মাগরিবের নামাজ পড়ুন",
      },
      route: "/pages/prayer",
    },
    {
      name: "sayyidul_istighfar",
      time: addMinutes(prayerTimes.Maghrib, 20),
      content: {
        title: "সাইয়িদুল ইস্তিগফার",
        body: "দিনের শেষে সাইয়িদুল ইস্তিগফার পড়ুন",
      },
      route: "/pages/istighfer",
    },
    {
      name: "isha",
      time: prayerTimes.Isha,
      content: {
        title: "ইশার নামাজের সময়",
        body: "ইশার নামাজ পড়ুন",
      },
      route: "/pages/prayer",
    },
    {
      name: "forgiveness",
      time: prayerTimes.Isha,
      content: {
        title: "সবাইকে ক্ষমা করুন",
        body: "যে ব্যক্তি রাতে ঘুমানোর আগে সবাইকে ক্ষমা করে দেয়, আল্লাহ তাকে ক্ষমা করে দেন।",
      },
      route: "/pages/education/dua",
    },
  ];

  // আগামীকের জন্য ফজরের নোটিফিকেশন যুক্ত করুন যদি পাওয়া যায়
  if (nextDayFajrTime) {
    notifications.push({
      name: "fajr_next_day",
      time: nextDayFajrTime,
      content: {
        title: "আগামীকাল ফজরের নামাজের সময়",
        body: "আগামীকাল ফজরের নামাজ পড়তে প্রস্তুত থাকুন",
      },
      route: "/pages/prayer",
    });
  }

  return notifications;
}