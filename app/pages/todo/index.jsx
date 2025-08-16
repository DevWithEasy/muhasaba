// app/(tabs)/index.js
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import CountdownTimer from "../../../components/todo/TodoCountdownTimer";
import TodoDeleteModal from "../../../components/todo/TodoDeleteModal";
import EditModal from "../../../components/todo/TodoEditModal";
import TodoModal from "../../../components/todo/TodoModal";
import EmptyState from "../../../components/todo/EmptyState";

const TODO_FILE = `${FileSystem.documentDirectory}app_dir/todo_data.json`;

export default function TodoIndex() {
  const [todos, setTodos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const swipeableRefs = useRef({});

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
          <Text
            style={{
              fontFamily: "bangla_bold",
              fontSize: 12,
              color: "#037764",
            }}
          >
            আপডেট
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            closeSwipeable(item.id);
            deleteTodo(item.id);
          }}
        >
          <Ionicons name="trash" size={24} color="#ff3b30" />
          <Text
            style={{
              fontFamily: "bangla_bold",
              fontSize: 12,
              color: "#ff3b30",
            }}
          >
            ডিলেট
          </Text>
        </TouchableOpacity>
      </View>
    );
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
          <Swipeable
            ref={(ref) => (swipeableRefs.current[item.id] = ref)}
            renderRightActions={() => renderRightActions(item)}
            rightThreshold={40}
            overshootRight={false}
          >
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
            </View>
          </Swipeable>
        )}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title="কোন কাজ যুক্ত করা হয়নি" subTitle='নতুন কাজ যোগ করতে &apos;+&apos; বাটনে ক্লিক করুন'/>
        }
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
        itemName={todoToDelete?.title || ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    elevation: 1,
    borderWidth: 0.5,
    borderColor: "#ddddddff",
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: "bangla_bold",
    color: "#333",
    marginBottom: 4,
  },
  todoDesc: {
    fontFamily: "bangla_regular",
    fontSize: 12,
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
    paddingVertical: 1,
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
  rightActions: {
    flexDirection: "row",
    width: 120,
    marginBottom: 12,
  },
  actionButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  deleteButton: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#037764",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
