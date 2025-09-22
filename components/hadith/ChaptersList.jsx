import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import convertToBanglaNumbers from '../../utils/convertToBanglaNumber';

export default function ChaptersList({ 
  bookId, 
  bookName, 
  colorCode, 
  setShowModal, 
  chapters,
  setChapters, 
  searchQuery 
}) {
  const router = useRouter();
  const [filteredChapters, setFilteredChapters] = useState([]);
  const BOOK_DIR = FileSystem.documentDirectory + `app_dir/hadith/book_${bookId}`;
  const CHAPTERS_FILE = `${BOOK_DIR}/book_${bookId}_chapters.json`;

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const folderInfo = await FileSystem.getInfoAsync(BOOK_DIR);
        if (!folderInfo.exists) {
          setShowModal(true);
          return;
        }

        const data = await FileSystem.readAsStringAsync(CHAPTERS_FILE);
        const json = JSON.parse(data);
        setChapters(json);
      } catch (err) {
        console.log('Load chapters error:', err);
      }
    };

    loadChapters();
  }, []);

  useEffect(() => {
    if (chapters.length > 0 && searchQuery) {
      const filtered = chapters.filter(chapter => 
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.hadis_range.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChapters(filtered);
    } else {
      setFilteredChapters(chapters);
    }
  }, [searchQuery, chapters]);

  const renderChapter = ({ item, index }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() =>
        router.push({
          pathname: 'pages/education/hadith/hadiths',
          params: { 
            book_id: item.book_id, 
            chapter_id: item.chapter_id,
            chapter_name: item.title,
            book_name: bookName
          },
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.chapterNumber}>
        <Text style={styles.chapterNumberText}>{convertToBanglaNumbers(item.chapter_id)}</Text>
      </View>
      <View style={styles.chapterContent}>
        <Text numberOfLines={1} style={styles.chapterTitle}>{item.title}</Text>
        <Text style={styles.chapterSubtitle}>হাদিসের সীমা: {item.hadis_range}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={filteredChapters}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderChapter}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <TouchableOpacity onPress={()=>setShowModal(true)} style={styles.emptyContainer}>
          <MaterialIcons name="menu-book" size={48} color="#ddd" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'কোন ফলাফল পাওয়া যায়নি' : 'হাদিসের বইটি ডাউনলোড করুন'}
          </Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  chapterItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0.5,
  },
  chapterNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor : '#037764'
  },
  chapterNumberText: {
    color: 'white',
    fontFamily: 'bangla_bold',
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    color: '#333',
    marginBottom: 4,
    fontFamily: 'bangla_medium',
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'bangla_regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    fontFamily: 'bangla_regular',
  },
});