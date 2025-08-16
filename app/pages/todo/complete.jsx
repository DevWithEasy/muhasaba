// app/(tabs)/complete.js
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react"; // Added useCallback
import { FlatList, StyleSheet, Text, View } from "react-native";
import TodoDeleteModal from "../../../components/todo/TodoDeleteModal";
import TodoItem from "../../../components/todo/TodoItem";

const TODO_FILE = `${FileSystem.documentDirectory}app_dir/todo_data.json`;

export default function Complete() {
  const [todos, setTodos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, []) // Empty dependency array
  );

  const loadTodos = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(TODO_FILE);
      setTodos(JSON.parse(content));
    } catch (error) {
      console.error("Error loading todos:", error);
    }
  };

  const handleUpdateTodo = async (updatedTodo) => {
    try {
      const updatedTodos = todos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      );
      await FileSystem.writeAsStringAsync(
        TODO_FILE,
        JSON.stringify(updatedTodos)
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = (id) => {
    const todo = todos.find((t) => t.id === id);
    setTodoToDelete(todo);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const updatedTodos = todos.filter((todo) => todo.id !== todoToDelete.id);
      await FileSystem.writeAsStringAsync(
        TODO_FILE,
        JSON.stringify(updatedTodos)
      );
      setTodos(updatedTodos);
      setShowDeleteModal(false);
      setTodoToDelete(null);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={todos.filter((todo) => todo.status === "complete")}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            item={item}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>কোন সম্পন্ন কাজ নেই</Text>
          </View>
        }
      />
      <TodoDeleteModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={todoToDelete?.title || ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#666",
  },
});
