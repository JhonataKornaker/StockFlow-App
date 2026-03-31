import { ChevronDown, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface SelectPickerProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SelectPicker({
  label,
  value,
  options,
  onChange,
}: SelectPickerProps) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>{value}</Text>
        <ChevronDown size={18} color="#19325E" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{label}</Text>
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                {options.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.option,
                      option === value && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        option === value && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
    color: '#666',
    fontSize: 14,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggerText: {
    fontSize: 16,
    color: '#1F2937',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#19325E',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionSelected: {
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 15,
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#19325E',
    fontWeight: '600',
  },
});
