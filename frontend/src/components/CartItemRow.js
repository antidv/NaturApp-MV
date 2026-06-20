import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CartItemRow({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>S/ {item.price.toFixed(2)}</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={onDecrease}><Ionicons name="remove-circle-outline" size={24} color="#148F77" /></TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity onPress={onIncrease}><Ionicons name="add-circle-outline" size={24} color="#148F77" /></TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8 },
  details: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { color: '#148F77', fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  qty: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold' },
  removeBtn: { padding: 5 }
});