// components/Calculation.js
import { View, StyleSheet } from "react-native";
import DaroodCalculation from ".//DaroodCalculation";
import DonationCalculation from ".//DonationCalculation";
import FridayAmolCalculation from ".//FridayAmolCalculation";
import HadithCalculation from ".//HadithCalculation";
import IstighfarCalculation from ".//IstighfarCalculation";
import JobCalculation from ".//JobCalculation";
import QuranCalculation from ".//QuranCalculation";
import SalahCalculation from ".//SalahCalculation";
import TasbihCalculation from ".//TasbihCalculation";
import SwipeableCalculation from "./SwipeableCalculation";

const Calculation = ({ data, onSwipeLeft, onSwipeRight }) => {
  return (
    <View style={styles.container}>
      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('prayer')}
        onSwipeRight={() => onSwipeRight('prayer')}
      >
        <SalahCalculation salah={data.salah} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('quran-read')}
        onSwipeRight={() => onSwipeRight('quran-read')}
      >
        <QuranCalculation quran={data.quran} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('hadith-read')}
        onSwipeRight={() => onSwipeRight('hadith-read')}
      >
        <HadithCalculation hadith={data.hadith} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('istighfar')}
        onSwipeRight={() => onSwipeRight('istighfar')}
      >
        <IstighfarCalculation istighfar={data.istighfar} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('donation')}
        onSwipeRight={() => onSwipeRight('donation')}
      >
        <DonationCalculation donation={data.donation} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('darood')}
        onSwipeRight={() => onSwipeRight('darood')}
      >
        <DaroodCalculation darood={data.darood} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('good-bad-job')}
        onSwipeRight={() => onSwipeRight('good-bad-job')}
      >
        <JobCalculation goodBadJob={data.goodBadJob} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('tasbih')}
        onSwipeRight={() => onSwipeRight('tasbih')}
      >
        <TasbihCalculation tasbih={data.tasbih} />
      </SwipeableCalculation>

      <SwipeableCalculation 
        onSwipeLeft={() => onSwipeLeft('friday-amol')}
        onSwipeRight={() => onSwipeRight('friday-amol')}
      >
        <FridayAmolCalculation friday={data.friday} />
      </SwipeableCalculation>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
});

export default Calculation;