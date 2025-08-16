class PrayerTimes {
  constructor({ timings, date, meta }) {
    this.timings = new Timings(timings);
    this.date = new Date(date);
    this.meta = new Meta(meta);
  }

  static fromJson(json) {
    return new PrayerTimes({
      timings: json.timings,
      date: json.date,
      meta: json.meta
    });
  }

  toJson() {
    return {
      timings: this.timings.toJson(),
      date: this.date.toJson(),
      meta: this.meta.toJson()
    };
  }

  sunrise() {
    return convertToBanglaNumbers(this.extractTime(this.timings.sunrise));
  }

  sunset() {
    return convertToBanglaNumbers(this.extractTime(this.timings.sunset));
  }

  sahri() {
    return this.calculateTime(this.extractTime(this.timings.fajr), -4);
  }

  ifter() {
    return this.extractTime(this.timings.maghrib);
  }

  fajr_start() {
    return this.extractTime(this.timings.fajr);
  }

  fajr_end() {
    return this.extractTime(this.timings.sunrise);
  }

  fajr() {
    return `${this.fajr_start()} - ${this.fajr_end()}`;
  }

  dhuhr_start() {
    return this.extractTime(this.timings.dhuhr);
  }

  dhuhr_end() {
    return this.calculateTime(this.extractTime(this.timings.asr), -1);
  }

  dhuhr() {
    return `${this.dhuhr_start()} - ${this.dhuhr_end()}`;
  }

  asr_start() {
    return this.extractTime(this.timings.asr);
  }

  asr_end() {
    return this.calculateTime(this.extractTime(this.timings.maghrib), -4);
  }

  asr() {
    return `${this.asr_start()} - ${this.asr_end()}`;
  }

  maghrib_start() {
    return this.extractTime(this.timings.maghrib);
  }

  maghrib_end() {
    return this.calculateTime(this.extractTime(this.timings.isha), -1);
  }

  maghrib() {
    return `${this.maghrib_start()} - ${this.maghrib_end()}`;
  }

  isha_start() {
    return this.extractTime(this.timings.isha);
  }

  isha_end() {
    return this.calculateTime(this.extractTime(this.timings.fajr), -5);
  }

  isha() {
    return `${this.isha_start()} - ${this.isha_end()}`;
  }

  waktTimes() {
    return [
      {name: 'ফজর', time: convertToBanglaNumbers(this.fajr())},
      {name: 'যোহর', time: convertToBanglaNumbers(this.dhuhr())},
      {name: 'আসর', time: convertToBanglaNumbers(this.asr())},
      {name: 'মাগরিব', time: convertToBanglaNumbers(this.maghrib())},
      {name: 'এশা', time: convertToBanglaNumbers(this.isha())}
    ];
  }

  calenderWaktTimes() {
    return [
      {name: 'ফজর', start: convertToBanglaNumbers(this.fajr_start()), end: convertToBanglaNumbers(this.fajr_end())},
      {name: 'যোহর', start: convertToBanglaNumbers(this.dhuhr_start()), end: convertToBanglaNumbers(this.dhuhr_end())},
      {name: 'আসর', start: convertToBanglaNumbers(this.asr_start()), end: convertToBanglaNumbers(this.asr_end())},
      {name: 'মাগরিব', start: convertToBanglaNumbers(this.maghrib_start()), end: convertToBanglaNumbers(this.maghrib_end())},
      {name: 'এশা', start: convertToBanglaNumbers(this.isha_start()), end: convertToBanglaNumbers(this.isha_end())}
    ];
  }

  morning() {
    const from = this.extractTime(this.timings.sunrise);
    const to = this.calculateTime(from, 15);
    return `${from} - ${to}`;
  }

  noon() {
    const dhuhr = this.extractTime(this.timings.dhuhr);
    const from = this.calculateTime(dhuhr, -9);
    const to = this.calculateTime(dhuhr, -1);
    return `${from} - ${to}`;
  }

  afternoon() {
    const maghrib = this.extractTime(this.timings.maghrib);
    const from = this.calculateTime(maghrib, -15);
    const to = this.calculateTime(maghrib, -4);
    return `${from} - ${to}`;
  }

  restrictedTimes() {
    return [
      {name: 'ভোরঃ', time: convertToBanglaNumbers(this.morning())},
      {name: 'দুপুরঃ', time: convertToBanglaNumbers(this.noon())},
      {name: 'সন্ধ্যাঃ', time: convertToBanglaNumbers(this.afternoon())}
    ];
  }

  dayName() {
    const bengaliDays = {
      "Sunday": "রবিবার",
      "Monday": "সোমবার",
      "Tuesday": "মঙ্গলবার",
      "Wednesday": "বুধবার",
      "Thursday": "বৃহস্পতিবার",
      "Friday": "শুক্রবার",
      "Saturday": "শনিবার"
    };
    return bengaliDays[this.date.gregorian.weekday.en] || "অজানা দিন";
  }

  dayNumber() {
    return convertToBanglaNumbers(this.date.gregorian.day);
  }

  engMonth() {
    const bengaliMonths = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", 
      "মে", "জুন", "জুলাই", "আগস্ট", 
      "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    return bengaliMonths[this.date.gregorian.month.number - 1];
  }

  engYear() {
    return convertToBanglaNumbers(this.date.gregorian.year);
  }

  hijriDayNumber() {
    return convertToBanglaNumbers(this.date.hijri.day);
  }

  hijriMonth() {
    const hijriMonths = [
      "মুহররম", "সফর", "রবিউল আওয়াল", "রবিউস সানি",
      "জমাদিউল আওয়াল", "জমাদিউল সানি", "রজব",
      "শাবান", "রমজান", "শাওয়াল",
      "জিলক্বদ", "জিলহজ্জ"
    ];
    return hijriMonths[this.date.hijri.month.number - 1];
  }

  hijriYear() {
    return convertToBanglaNumbers(this.date.hijri.year);
  }

  static extractTime(timeString) {
    return timeString.split(' ')[0];
  }

  calculateTime(time, minutesToAdd) {
    const parts = time.split(':');
    let hours = parseInt(parts[0]);
    let minutes = parseInt(parts[1]);

    let totalMinutes = hours * 60 + minutes;
    totalMinutes += minutesToAdd;
    totalMinutes = totalMinutes % (24 * 60);
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
}

class Timings {
  constructor({
    Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha, 
    Imsak, Midnight, Firstthird, Lastthird
  }) {
    this.fajr = Fajr;
    this.sunrise = Sunrise;
    this.dhuhr = Dhuhr;
    this.asr = Asr;
    this.sunset = Sunset;
    this.maghrib = Maghrib;
    this.isha = Isha;
    this.imsak = Imsak;
    this.midnight = Midnight;
    this.firstthird = Firstthird;
    this.lastthird = Lastthird;
  }

  static fromJson(json) {
    return new Timings(json);
  }

  toJson() {
    return {
      Fajr: this.fajr,
      Sunrise: this.sunrise,
      Dhuhr: this.dhuhr,
      Asr: this.asr,
      Sunset: this.sunset,
      Maghrib: this.maghrib,
      Isha: this.isha,
      Imsak: this.imsak,
      Midnight: this.midnight,
      Firstthird: this.firstthird,
      Lastthird: this.lastthird
    };
  }
}

class Date {
  constructor({ readable, timestamp, hijri, gregorian }) {
    this.readable = readable;
    this.timestamp = timestamp;
    this.hijri = new Hijri(hijri);
    this.gregorian = new Gregorian(gregorian);
  }

  static fromJson(json) {
    return new Date(json);
  }

  toJson() {
    return {
      readable: this.readable,
      timestamp: this.timestamp,
      hijri: this.hijri.toJson(),
      gregorian: this.gregorian.toJson()
    };
  }
}

class Hijri {
  constructor({
    date, format, day, weekday, month, year, 
    designation, holidays, adjustedHolidays, method
  }) {
    this.date = date;
    this.format = format;
    this.day = day;
    this.weekday = new Weekday(weekday);
    this.month = new Month(month);
    this.year = year;
    this.designation = new Designation(designation);
    this.holidays = holidays;
    this.adjustedHolidays = adjustedHolidays;
    this.method = method;
  }

  static fromJson(json) {
    return new Hijri(json);
  }

  toJson() {
    return {
      date: this.date,
      format: this.format,
      day: this.day,
      weekday: this.weekday.toJson(),
      month: this.month.toJson(),
      year: this.year,
      designation: this.designation.toJson(),
      holidays: this.holidays,
      adjustedHolidays: this.adjustedHolidays,
      method: this.method
    };
  }
}

class Gregorian {
  constructor({
    date, format, day, weekday, month, year, 
    designation, lunarSighting
  }) {
    this.date = date;
    this.format = format;
    this.day = day;
    this.weekday = new Weekday(weekday);
    this.month = new Month(month);
    this.year = year;
    this.designation = new Designation(designation);
    this.lunarSighting = lunarSighting;
  }

  static fromJson(json) {
    return new Gregorian(json);
  }

  toJson() {
    return {
      date: this.date,
      format: this.format,
      day: this.day,
      weekday: this.weekday.toJson(),
      month: this.month.toJson(),
      year: this.year,
      designation: this.designation.toJson(),
      lunarSighting: this.lunarSighting
    };
  }
}

class Weekday {
  constructor({ en, ar }) {
    this.en = en;
    this.ar = ar;
  }

  static fromJson(json) {
    return new Weekday(json);
  }

  toJson() {
    return {
      en: this.en,
      ar: this.ar
    };
  }
}

class Month {
  constructor({ number, en, ar, days }) {
    this.number = number;
    this.en = en;
    this.ar = ar;
    this.days = days;
  }

  static fromJson(json) {
    return new Month(json);
  }

  toJson() {
    return {
      number: this.number,
      en: this.en,
      ar: this.ar,
      days: this.days
    };
  }
}

class Designation {
  constructor({ abbreviated, expanded }) {
    this.abbreviated = abbreviated;
    this.expanded = expanded;
  }

  static fromJson(json) {
    return new Designation(json);
  }

  toJson() {
    return {
      abbreviated: this.abbreviated,
      expanded: this.expanded
    };
  }
}

class Meta {
  constructor({
    latitude, longitude, timezone, method, 
    latitudeAdjustmentMethod, midnightMode, school, offset
  }) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.timezone = timezone;
    this.method = new Method(method);
    this.latitudeAdjustmentMethod = latitudeAdjustmentMethod;
    this.midnightMode = midnightMode;
    this.school = school;
    this.offset = new Offset(offset);
  }

  static fromJson(json) {
    return new Meta(json);
  }

  toJson() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      timezone: this.timezone,
      method: this.method.toJson(),
      latitudeAdjustmentMethod: this.latitudeAdjustmentMethod,
      midnightMode: this.midnightMode,
      school: this.school,
      offset: this.offset.toJson()
    };
  }
}

class Method {
  constructor({ id, name, params, location }) {
    this.id = id;
    this.name = name;
    this.params = new Params(params);
    this.location = new Location(location);
  }

  static fromJson(json) {
    return new Method(json);
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      params: this.params.toJson(),
      location: this.location.toJson()
    };
  }
}

class Params {
  constructor({ Fajr, Isha }) {
    this.fajr = Fajr;
    this.isha = Isha;
  }

  static fromJson(json) {
    return new Params(json);
  }

  toJson() {
    return {
      Fajr: this.fajr,
      Isha: this.isha
    };
  }
}

class Location {
  constructor({ latitude, longitude }) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static fromJson(json) {
    return new Location(json);
  }

  toJson() {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    };
  }
}

class Offset {
  constructor({ Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha }) {
    this.fajr = Fajr;
    this.sunrise = Sunrise;
    this.dhuhr = Dhuhr;
    this.asr = Asr;
    this.maghrib = Maghrib;
    this.isha = Isha;
  }

  static fromJson(json) {
    return new Offset(json);
  }

  toJson() {
    return {
      Fajr: this.fajr,
      Sunrise: this.sunrise,
      Dhuhr: this.dhuhr,
      Asr: this.asr,
      Maghrib: this.maghrib,
      Isha: this.isha
    };
  }
}

// Helper function to convert numbers to Bangla
function convertToBanglaNumbers(number) {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  return number.toString().split('').map(char => {
    const index = englishNumbers.indexOf(char);
    return index !== -1 ? banglaNumbers[index] : char;
  }).join('');
}

export default PrayerTimes