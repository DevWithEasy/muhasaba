// components/todo/TodoEditModal.js
import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditModal({ visible, onClose, onSave, todo }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [status, setStatus] = useState("pending");
  const [daysToComplete, setDaysToComplete] = useState("1");

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setPriority(todo.priority);
      setStatus(todo.status);

      // Calculate remaining days
      if (todo.deadline) {
        const now = new Date();
        const deadline = new Date(todo.deadline);
        const diffTime = deadline - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysToComplete(Math.max(1, diffDays).toString());
      }
    }
  }, [todo]);

  const handleSave = () => {
    if (!title.trim()) return;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + parseInt(daysToComplete));

    onSave({
      ...todo,
      title,
      description,
      priority,
      status,
      deadline: deadline.toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt:
        status === "complete" ? new Date().toISOString() : todo.completedAt,
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>টাস্ক সম্পাদনা করুন</Text>

          <TextInput
            style={styles.input}
            placeholder="টাস্কের শিরোনাম"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="বিস্তারিত বর্ণনা"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <View>
            <Text style={styles.label}>কত দিনে শেষ করবেন?</Text>
            <TextInput
              style={styles.input}
              placeholder="দিন"
              keyboardType="numeric"
              value={daysToComplete}
              onChangeText={setDaysToComplete}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>প্রাধান্য:</Text>
            <View style={styles.priorityOptions}>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === "urgent" && styles.urgentButton,
                ]}
                onPress={() => setPriority("urgent")}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === "urgent" && styles.priorityButtonTextSelect,
                  ]}
                >
                  জরুরী
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === "important" && styles.importantButton,
                ]}
                onPress={() => setPriority("important")}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === "important" && styles.priorityButtonTextSelect,
                  ]}
                >
                  গুরুত্বপূর্ণ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === "normal" && styles.normalButton,
                ]}
                onPress={() => setPriority("normal")}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === "normal" && styles.priorityButtonTextSelect,
                  ]}
                >
                  সাধারণ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>অবস্থা:</Text>
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === "pending" && styles.pendingButton,
                ]}
                onPress={() => setStatus("pending")}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === "pending" && styles.statusButtonTextSelect,
                  ]}
                >
                  অপেক্ষমান
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === "ongoing" && styles.ongoingButton,
                ]}
                onPress={() => setStatus("ongoing")}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === "ongoing" && styles.statusButtonTextSelect,
                  ]}
                >
                  চলমান
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === "complete" && styles.completeButton,
                ]}
                onPress={() => setStatus("complete")}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === "complete" && styles.statusButtonTextSelect,
                  ]}
                >
                  সম্পন্ন
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>বাতিল</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>সংরক্ষণ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontFamily: "bangla_bold",
    fontSize: 18,
    color: "#037764",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: "bangla_regular",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  halfWidth: {
    width: "48%",
  },
  label: {
    fontFamily: "bangla_medium",
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: "row",
    gap: 4,
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  urgentButton: {
    backgroundColor: "#ff3b30",
    borderColor: "#ff3b30",
  },
  importantButton: {
    backgroundColor: "#ff9500",
    borderColor: "#ff9500",
  },
  normalButton: {
    backgroundColor: "#34c759",
    borderColor: "#34c759",
  },
  priorityButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#037764",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "bangla_bold",
    color: "white",
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusOptions: {
    flexDirection: "row",
    gap: 4,
  },
  statusButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  pendingButton: {
    backgroundColor: "#ff9500",
    borderColor: "#ff9500",
  },
  ongoingButton: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  completeButton: {
    backgroundColor: "#34c759",
    borderColor: "#34c759",
  },
  statusButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
  },
  statusButtonTextSelect: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    color: "#ffffff",
  },
  priorityButtonTextSelect: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    color: "#ffffff",
  },
});
