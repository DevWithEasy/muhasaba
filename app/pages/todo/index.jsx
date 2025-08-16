// app/(tabs)/index.js
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import CountdownTimer from "../../../components/todo/TodoCountdownTimer";
import TodoDeleteModal from "../../../components/todo/TodoDeleteModal";
import EditModal from "../../../components/todo/TodoEditModal";
import TodoModal from "../../../components/todo/TodoModal";

const TODO_FILE = `${FileSystem.documentDirectory}app_dir/todo_data.json`;

export default function TodoIndex() {
  const [todos, setTodos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const initializeTodoFile = async () => {
        const fileInfo = await FileSystem.getInfoAsync(TODO_FILE);
        if (!fileInfo.exists) {
          await FileSystem.writeAsStringAsync(TODO_FILE, JSON.stringify([]));
        }
        loadTodos();
      };
      initializeTodoFile();
    }, [])
  );

  const loadTodos = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(TODO_FILE);
      setTodos(JSON.parse(content));
    } catch (error) {
      console.error("Error loading todos:", error);
    }
  };

  const addTodo = async (newTodo) => {
    try {
      const now = new Date();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(newTodo.daysToComplete));

      const updatedTodos = [
        ...todos,
        {
          id: Date.now().toString(),
          ...newTodo,
          status: "pending",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          completedAt: null,
          deadline: deadline.toISOString(),
        },
      ];

      await FileSystem.writeAsStringAsync(
        TODO_FILE,
        JSON.stringify(updatedTodos)
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const updateTodo = async (updatedTodo) => {
    try {
      const now = new Date();
      const updatedTodos = todos.map((todo) =>
        todo.id === updatedTodo.id
          ? {
              ...updatedTodo,
              updatedAt: now.toISOString(),
              completedAt:
                updatedTodo.status === "complete"
                  ? now.toISOString()
                  : todo.completedAt,
            }
          : todo
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

  const deleteTodo = (id) => {
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

  const handleEdit = (todo) => {
    setSelectedTodo(todo);
    setShowEditModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#ff3b30";
      case "important":
        return "#ff9500";
      default:
        return "#34c759";
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={todos.filter((todo) => todo.status === "pending")}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <View style={styles.todoContent}>
              <Text style={styles.todoTitle}>{item.title}</Text>
              <Text style={styles.todoDesc}>{item.description}</Text>

              <View style={styles.metaContainer}>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(item.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {item.priority === "urgent"
                      ? "জরুরী"
                      : item.priority === "important"
                      ? "গুরুত্বপূর্ণ"
                      : "সাধারণ"}
                  </Text>
                </View>

                <CountdownTimer deadline={item.deadline} />
              </View>

              <Text style={styles.dateText}>
                তৈরি: {new Date(item.createdAt).toLocaleDateString("bn-BD")}
              </Text>
            </View>
            <View style={styles.todoActions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="create-outline" size={24} color="#037764" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTodo(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <TodoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addTodo}
      />

      <EditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={updateTodo}
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
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  todoItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  todoDesc: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    color: "white",
  },
  dateText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#888",
  },
  todoActions: {
    flexDirection: "row",
    gap: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#037764",
    width: 48,
    height: 48,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
