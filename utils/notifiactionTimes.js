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
        title: "ফজরের ওয়াক্ত শুরু হয়েছে",
        body: "ফজরের নামাজ পড়ুন। ফজর নামাজ রক্ষা করলে আল্লাহ আপনাকে দিনের শুরুতেই রহমত দান করবেন।",
      },
      route: "/pages/prayer",
    },
    {
      name: "sayyidul_istighfar",
      time: addMinutes(prayerTimes.Sunrise, 5),
      content: {
        title: "সাইয়িদুল ইস্তিগফার",
        body: "দিনের শুরুতে সাইয়িদুল ইস্তিগফার পড়ুন। এটি আপনার গুনাহ মাফ করে এবং দিনটি বরকতপূর্ণ করে।",
      },
      route: "/pages/istighfer",
    },
    {
      name: "istigfar_mid_time",
      time: '10.00',
      content: {
        title: "ইস্তিগফার করার সময়",
        body: "কাজের ফাঁকে ফাঁকে ইস্তিগফার করুন। ইস্তিগফার আল্লাহর নিকট বিশেষ মর্যাদা বহন করে।",
      },
      route: "/pages/istighfer",
    },
    {
      name: "dhuhr",
      time: prayerTimes.Dhuhr,
      content: {
        title: "জোহরের নামাজের সময়",
        body: "জোহরের নামাজ পড়ুন। নিয়মিত যোহর নামাজ আল্লাহর বরকত ও শান্তি প্রদান করে।",
      },
      route: "/pages/prayer",
    },
    {
      name: "asr",
      time: prayerTimes.Asr,
      content: {
        title: "আসরের নামাজের সময়",
        body: "আসরের নামাজ পড়ুন। এটি দিনের ব্যস্ততায় আল্লাহর স্মরণ বজায় রাখে এবং ধৈর্য্য বৃদ্ধি করে।",
      },
      route: "/pages/prayer",
    },
    {
      name: "darood",
      time: addMinutes(prayerTimes.Asr, 50),
      content: {
        title: "দরুদের আমল",
        body: "দরুদ শরীফ পড়ুন। দরুদ পাঠের মাধ্যমে আল্লাহর নিকট মর্যাদা বৃদ্ধি পায়।",
      },
      route: "/pages/darood",
    },
    {
      name: "maghrib",
      time: prayerTimes.Maghrib,
      content: {
        title: "মাগরিবের নামাজের সময়",
        body: "মাগরিবের নামাজ পড়ুন। এটি দিনের শেষে আল্লাহর কাছে কৃতজ্ঞতা জ্ঞাপন করার সুযোগ দেয়।",
      },
      route: "/pages/prayer",
    },
    {
      name: "sayyidul_istighfar",
      time: addMinutes(prayerTimes.Maghrib, 20),
      content: {
        title: "সাইয়িদুল ইস্তিগফার",
        body: "দিনের শেষে সাইয়িদুল ইস্তিগফার পড়ুন। এটি আপনার দিনের গুনাহ মাফ করে এবং শান্তি প্রদান করে।",
      },
      route: "/pages/istighfer",
    },
    {
      name: "isha",
      time: prayerTimes.Isha,
      content: {
        title: "ইশার নামাজের সময়",
        body: "ইশার নামাজ পড়ুন। নিয়মিত ইশা নামাজ আল্লাহর সাহায্য ও নিরাপত্তা দেয়।",
      },
      route: "/pages/prayer",
    },
    {
      name: "forgiveness",
      time: addMinutes(prayerTimes.Isha, 90),
      content: {
        title: "সবাইকে ক্ষমা করুন",
        body: "যে ব্যক্তি রাতে ঘুমানোর আগে সবাইকে ক্ষমা করে দেয়, আল্লাহ তাকে ক্ষমা করে দেন এবং শান্তি দান করেন।",
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
        title: "ফজরের ওয়াক্ত শুরু হয়েছে",
        body: "ফজরের নামাজ পড়ুন। ফজর নামাজ রক্ষা করলে আল্লাহ আপনাকে দিনের শুরুতেই রহমত দান করবেন।",
      },
      route: "/pages/prayer",
    });
  }

  return notifications;
}
