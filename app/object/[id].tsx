import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getObject, deleteObject } from '@/lib/api';
import type { ObjectItem } from '@/types/object';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
export default function ObjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [object, setObject] = useState<ObjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getObject(id)
      .then((data) => {
        if (!cancelled) setObject(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load object');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete object',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError(null);
            try {
              await deleteObject(id);
              router.back();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed to delete');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (error || !object) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error ?? 'Object not found'}</ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText type="link">Back to list</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: object.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.content}>
          <ThemedText type="title">{object.title}</ThemedText>
          <ThemedText style={styles.description}>{object.description}</ThemedText>
          <ThemedText style={styles.meta}>
            Created: {new Date(object.createdAt).toLocaleString()}
          </ThemedText>
          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}
          <Pressable
            style={[styles.deleteButton, { borderColor: '#c00' }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#c00" />
            ) : (
              <ThemedText style={styles.deleteText}>Delete object</ThemedText>
            )}
          </Pressable>
        </View>
      </ScrollView>
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
  backButton: {
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#ddd',
  },
  content: {
    padding: 16,
  },
  description: {
    marginTop: 12,
  },
  meta: {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.7,
  },
  deleteButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  deleteText: {
    color: '#c00',
    fontWeight: '600',
  },
});
