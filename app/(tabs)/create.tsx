import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { createObject } from '@/lib/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Please fill in title and description.');
      return;
    }
    if (!imageUri) {
      setError('Please pick an image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fileName = imageUri.split('/').pop() ?? 'image.jpg';
      const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const created = await createObject(title.trim(), description.trim(), imageUri, fileName, mimeType);
      setTitle('');
      setDescription('');
      setImageUri(null);
      router.push(`/object/${created._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create object');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="subtitle" style={styles.label}>
          Title
        </ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor, color: textColor, borderColor: colors.icon }]}
          placeholder="Object title"
          placeholderTextColor={colors.icon}
          value={title}
          onChangeText={setTitle}
          editable={!loading}
        />
        <ThemedText type="subtitle" style={styles.label}>
          Description
        </ThemedText>
        <TextInput
          style={[styles.input, styles.inputMultiline, { backgroundColor, color: textColor, borderColor: colors.icon }]}
          placeholder="Short description"
          placeholderTextColor={colors.icon}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!loading}
        />
        <ThemedText type="subtitle" style={styles.label}>
          Image
        </ThemedText>
        <Pressable
          style={[styles.pickButton, { borderColor: tintColor }]}
          onPress={pickImage}
          disabled={loading}
        >
          <ThemedText style={{ color: tintColor }}>
            {imageUri ? 'Change image' : 'Pick image from device'}
          </ThemedText>
        </Pressable>
        {imageUri && (
          <View style={styles.preview}>
            <ThemedText type="defaultSemiBold">Image selected</ThemedText>
          </View>
        )}
        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}
        <Pressable
          style={[styles.submitButton, { backgroundColor: Colors.light.tint }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitText}>Create Object</ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  preview: {
    marginTop: 10,
  },
  errorText: {
    color: '#c00',
    marginTop: 12,
  },
  submitButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});
