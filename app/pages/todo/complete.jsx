// app/(tabs)/complete.js
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import TodoItem from '../../../components/todo/TodoItem';
import TodoDeleteModal from '../../../components/todo/TodoDeleteModal';
import EditModal from '../../../components/todo/TodoEditModal';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../../../components/todo/EmptyState';

const TODO_FILE = `${FileSystem.documentDirectory}app_dir/todo_data.json`;

export default function Complete() {
  const [todos, setTodos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const swipeableRefs = useRef({});

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [])
  );

  const loadTodos = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(TODO_FILE);
      setTodos(JSON.parse(content));
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const handleUpdateTodo = async (updatedTodo) => {
    try {
      const now = new Date();
      const updatedTodos = todos.map(todo => 
        todo.id === updatedTodo.id ? {
          ...updatedTodo,
          updatedAt: now.toISOString(),
          completedAt: updatedTodo.status === 'complete' ? now.toISOString() : todo.completedAt
        } : todo
      );
      await FileSystem.writeAsStringAsync(TODO_FILE, JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    setTodoToDelete(todo);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== todoToDelete.id);
      await FileSystem.writeAsStringAsync(TODO_FILE, JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setShowDeleteModal(false);
      setTodoToDelete(null);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleEdit = (todo) => {
    setSelectedTodo(todo);
    setShowEditModal(true);
  };

  const closeSwipeable = (id) => {
    if (swipeableRefs.current[id]) {
      swipeableRefs.current[id].close();
    }
  };

  const renderRightActions = (item) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            closeSwipeable(item.id);
            handleEdit(item);
          }}
        >
          <Ionicons name="create" size={24} color="#037764" />
          <Text style={{fontFamily : 'bangla_bold',fontSize : 12 ,color : "#037764" }}>আপডেট</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            closeSwipeable(item.id);
            handleDeleteTodo(item.id);
          }}
        >
          <Ionicons name="trash" size={24} color="#ff3b30" />
          <Text style={{fontFamily : 'bangla_bold',fontSize : 12 ,color : "#ff3b30" }}>ডিলেট</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={todos.filter(todo => todo.status === 'complete')}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => (swipeableRefs.current[item.id] = ref)}
            renderRightActions={() => renderRightActions(item)}
            rightThreshold={40}
            overshootRight={false}
          >
            <TodoItem 
              item={item} 
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEdit}
            />
          </Swipeable>
        )}
        ListEmptyComponent={
          <EmptyState icon="checkmark-circle-outline" subTitle="কোন সম্পন্ন কাজ নেই"/>
        }
      />

      <EditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateTodo}
        todo={selectedTodo}
      />

      <TodoDeleteModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={todoToDelete?.title || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
    color: '#666',
  },
  rightActions: {
    flexDirection: 'row',
    width: 120,
    marginBottom: 12,
  },
  actionButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  deleteButton: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});