import { useRouter, useSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import convertToBanglaNumbers from '../../utils/convertToBanglaNumber';


const HadithList = ({ books, loading }) => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredBooks, setFilteredBooks] = useState(books);
  const searchQuery = searchParams.get('q') || '';

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
        file_size: item.file_size
      },
    });
  };

  return (
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
              <HexagonAvatar text={item.abvr_code} color={item.color_code} />
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
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: 'white',
  },
  bookItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
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
    fontSize: 16,
  },
  bookArabicTitle: {
    fontFamily: 'arabic_regular',
    fontSize: 14,
    color: '#555',
  },
  hadithCount: {
    marginLeft: 8,
    alignItems: 'center',
  },
  countText: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
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
    fontFamily: 'bangla_medium',
    fontSize: 16,
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

export default HadithList;