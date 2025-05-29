import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { AlertTriangle, X } from 'lucide-react-native';
import { useTextSize } from '@/contexts/TextSizeContext';

interface DeletePopupProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemName: string;
}

const DeletePopup: React.FC<DeletePopupProps> = ({ visible, onClose, onDelete, itemName }) => {
  const { colors } = useTheme();
  const { getFontSize } = useTextSize();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modalView, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
            {/* <Text style={[styles.closeText, { color: colors.textSecondary, fontSize: getFontSize(22) }]}>×</Text> */}
             <X size={22} color={colors.textSecondary} />
          </Pressable>
          <AlertTriangle size={48} color={colors.warning} style={styles.icon} />
          <ThemedText type="title" style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(20) }]}>Delete ingredient</ThemedText>
          <ThemedText style={[styles.message, { fontSize: getFontSize(16) }]}>
            Are you sure you want to delete {itemName ? itemName : 'this item'}?
          </ThemedText>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.warning }]}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Text style={[styles.deleteButtonText, { color: colors.textWhite, fontSize: getFontSize(16) }]}>Delete</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: 280,
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
    borderRadius: 16,
  },
  closeText: {
    fontWeight: '600',
  },
  icon: {
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 18,
  },
  deleteButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    fontWeight: '600',
  },
});

export default DeletePopup;
