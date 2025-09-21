import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import ChaptersList from '../../../../components/hadith/ChaptersList';
import DownloadModal from '../../../../components/hadith/DownloadModal';

export default function Chapters() {
  const params = useLocalSearchParams();
  const { id, name, file_size, hadithCount, colorCode } = params;
  
  const [showModal, setShowModal] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: name,
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

      <ChaptersList 
        bookId={id}
        bookName={name}
        colorCode={colorCode}
        setShowModal={setShowModal}
        chapters={chapters}
        setChapters={setChapters}
        searchQuery={searchQuery}
      />

      <DownloadModal 
        showModal={showModal}
        setShowModal={setShowModal}
        bookId={id}
        bookName={name}
        fileSize={file_size}
        hadithCount={hadithCount}
        colorCode={colorCode}
        setChapters={setChapters}
      />
    </View>
  );
}