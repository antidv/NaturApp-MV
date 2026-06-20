import { useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useOrders } from '../../src/viewmodels/useOrders';

export default function OrdersScreen() {
  const { orders, loading, error, refresh } = useOrders();

  // As `useOrders` subscribes to order creation events, no navigation focus hook is required here.
  useEffect(() => {
    // ensure a fresh load when the component mounts
    refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Pedidos</Text>
      {loading && orders.length === 0 ? (
        <ActivityIndicator size='large' color='#148F77' />
      ) : error && orders.length === 0 ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderId}>Pedido #{item.id}</Text>
              <Text style={styles.orderDate}>{item.createdAt}</Text>
              <Text style={styles.orderTotal}>Total: S/ {item.total?.toFixed(2) ?? '0.00'}</Text>
              <Text style={styles.orderStatus}>Estado: {item.status}</Text>
              <Text style={styles.orderItems}>{item.items?.length ?? 0} artículos</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.message}>
              {error ? error : 'No tienes pedidos aún.'}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F8F8' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  message: { textAlign: 'center', marginTop: 20, color: '#555' },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  orderDate: { color: '#777', marginBottom: 10 },
  orderTotal: { fontSize: 15, marginBottom: 2 },
  orderStatus: { color: '#148F77', marginBottom: 2 },
  orderItems: { color: '#777' },
});