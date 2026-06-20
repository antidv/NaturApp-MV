import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.chip, active && styles.activeChip]} 
      onPress={onPress}
    >
      <Text style={[styles.text, active && styles.activeText]}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 8, height: 40 },
  activeChip: { backgroundColor: '#148F77' },
  text: { color: '#666', fontWeight: '600' },
  activeText: { color: '#FFF' }
});