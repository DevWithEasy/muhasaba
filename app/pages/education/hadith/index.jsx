import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import hadithData from '../../../../assets/data/books.json';
import convertToBanglaNumbers from '../../../../utils/convertToBanglaNumber';

const HadithScreen = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setBooks(hadithData);
        setFilteredBooks(hadithData);
        setLoading(false);
      } catch (e) {
        console.error('Error loading data:', e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abvr_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const HexagonAvatar = ({ text, color }) => {
    return (
      <View style={[styles.hexagon, { backgroundColor: color }]}>
        <Text style={styles.hexagonText}>{text}</Text>
      </View>
    );
  };

  const handleBookPress = (item) => {
    router.push({
      pathname: '/pages/hadith/chapters',
      params: {
        id: item.id.toString(),
        name: item.title,
        hadithCount: item.number_of_hadis.toString(),
        code: item.abvr_code,
        colorCode: item.color_code,
        file_size : item.file_size
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'হাদিস',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#333',
          headerTitleStyle: { fontFamily: 'bangla_bold' },
          headerSearchBarOptions: {
            placeholder: 'অধ্যায় খুঁজুন',
            onChangeText: (event) => setSearchQuery(event.nativeEvent.text),
            hideWhenScrolling: false,
            barTintColor: '#f5f5f5',
            tintColor: '#037764',
            textColor: '#333',
            headerIconColor: '#037764',
          }
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#037764" />
        ) : filteredBooks.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>কোন ফলাফল পাওয়া যায়নি</Text>
          </View>
        ) : (
          filteredBooks.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleBookPress(item)}
              style={styles.bookItem}
            >
              <View style={styles.bookContent}>
                <HexagonAvatar text={convertToBanglaNumbers(item.id)} color='#037764' />
                <View style={styles.bookTextContainer}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.bookArabicTitle}>{item.title_ar}</Text>
                </View>
                <View style={styles.hadithCount}>
                  <Text style={styles.countText}>
                    {convertToBanglaNumbers(item.number_of_hadis.toString())}
                  </Text>
                  <Text style={styles.countLabel}>হাদিস</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 8,
  },
  bookItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor : '#ffffff'
  },
  bookContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontFamily: 'bangla_medium',
    color : '#037764'
  },
  bookArabicTitle: {
    fontFamily: 'arabic_regular',
    fontSize: 12,
    color: '#555',
  },
  hadithCount: {
    marginLeft: 8,
    alignItems: 'center',
  },
  countText: {
    fontFamily: 'bangla_bold',
    fontSize: 12,
    color: '#037764',
  },
  countLabel: {
    fontFamily: 'bangla_regular',
    fontSize: 12,
    color: '#666',
  },
  hexagon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  hexagonText: {
    color: 'white',
    fontFamily: 'bangla_bold',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
    color: '#666',
  },
});

export default HadithScreen;
