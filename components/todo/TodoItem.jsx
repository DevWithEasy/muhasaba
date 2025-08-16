// components/todo/TodoItem.js
import { StyleSheet, Text, View } from 'react-native';
import CountdownTimer from './TodoCountdownTimer';

export default function TodoItem({ item, onUpdate, onDelete, onEdit }) {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ff3b30';
      case 'important': return '#ff9500';
      default: return '#34c759';
    }
  };

  const handleStatusChange = () => {
    const newStatus = item.status === 'complete' ? 'ongoing' : 'complete';
    onUpdate({ ...item, status: newStatus });
  };

  return (
    <View style={styles.todoItem}>
      <View style={styles.todoContent}>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.todoDesc}>{item.description}</Text>
        
        <View style={styles.metaContainer}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>
              {item.priority === 'urgent' ? 'জরুরী' : 
               item.priority === 'important' ? 'গুরুত্বপূর্ণ' : 'সাধারণ'}
            </Text>
          </View>
          
          {item.status !== 'complete' && (
            <CountdownTimer deadline={item.deadline} />
          )}
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            তৈরি: {new Date(item.createdAt).toLocaleDateString('bn-BD')}
          </Text>
          {item.completedAt && (
            <Text style={styles.dateText}>
              সম্পন্ন: {new Date(item.completedAt).toLocaleDateString('bn-BD')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    borderWidth : 0.5,
    borderColor : '#ddddddff'
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: 'bangla_bold',
    color: '#333',
    marginBottom: 4,
  },
  todoDesc: {
    fontFamily: 'bangla_regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 12,
  },
  priorityText: {
    fontFamily: 'bangla_medium',
    fontSize: 12,
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontFamily: 'bangla_regular',
    fontSize: 12,
    color: '#888',
  },
});