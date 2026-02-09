import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { getObjects } from '@/lib/api';
import { useObjectsSocket } from '@/hooks/use-objects-socket';
import type { ObjectItem } from '@/types/object';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObjects = async () => {
    try {
      setError(null);
      const list = await getObjects();
      setObjects(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load objects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchObjects();
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  useObjectsSocket(
    (newObj) => {
      setObjects((prev) => [newObj, ...prev]);
    },
    (id) => {
      setObjects((prev) => prev.filter((o) => o._id !== id));
    }
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={objects}
        keyExtractor={(item) => item._id}
        contentContainerStyle={objects.length === 0 && styles.emptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            No objects yet. Create one in the Create tab.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.background === '#fff' ? '#f5f5f5' : '#252525' },
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(`/object/${item._id}`)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.cardImage}
              contentFit="cover"
            />
            <View style={styles.cardContent}>
              <ThemedText type="defaultSemiBold" numberOfLines={1} style={{ color: colors.text }}>
                {item.title}
              </ThemedText>
              <ThemedText numberOfLines={2} style={[styles.description, { color: colors.text, opacity: 0.85 }]}>
                {item.description}
              </ThemedText>
            </View>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    color: '#c00',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#ddd',
  },
  cardContent: {
    padding: 12,
  },
  description: {
    marginTop: 4,
    opacity: 0.8,
  },
});
