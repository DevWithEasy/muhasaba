// components/todo/TodoItem.js
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountdownTimer from './TodoCountdownTimer';

export default function TodoItem({ item, onUpdate, onDelete }) {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ff3b30';
      case 'important': return '#ff9500';
      default: return '#34c759';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return '#007aff';
      case 'complete': return '#34c759';
      default: return '#ff9500';
    }
  };

  const getStatusText = () => {
    switch(item.status) {
      case 'pending': return 'অপেক্ষমান';
      case 'ongoing': return 'চলমান';
      case 'complete': return 'সম্পন্ন';
      default: return item.status;
    }
  };

  const getDateText = () => {
    if (item.status === 'complete' && item.completedAt) {
      return `সম্পন্ন: ${new Date(item.completedAt).toLocaleDateString('bn-BD')}`;
    }
    return `আপডেট: ${new Date(item.updatedAt).toLocaleDateString('bn-BD')}`;
  };

  const handleStatusChange = () => {
    const newStatus = item.status === 'complete' ? 'ongoing' : 'complete';
    const updatedTodo = {
      ...item,
      status: newStatus,
      completedAt: newStatus === 'complete' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedTodo);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleStatusChange}>
              <Ionicons 
                name={item.status === 'complete' ? 'refresh' : 'checkmark-done'} 
                size={24} 
                color={item.status === 'complete' ? '#007aff' : '#34c759'} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.metaContainer}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.badgeText}>
              {item.priority === 'urgent' ? 'জরুরী' : 
               item.priority === 'important' ? 'গুরুত্বপূর্ণ' : 'সাধারণ'}
            </Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{getStatusText()}</Text>
          </View>
        </View>
        
        {item.status === 'pending' && item.deadline && (
          <CountdownTimer deadline={item.deadline} />
        )}
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            তৈরি: {new Date(item.createdAt).toLocaleDateString('bn-BD')}
          </Text>
          <Text style={styles.dateText}>{getDateText()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'bangla_bold',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  description: {
    fontFamily: 'bangla_regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});