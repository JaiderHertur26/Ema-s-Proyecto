import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import {
  createTextMemory,
  type MemoryCategory,
} from '@/data/repositories/memory-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

const labels: Record<MemoryCategory, { title: string; prompt: string; placeholder: string }> = {
  story: {
    title: 'Su historia',
    prompt: 'Guarda una parte de su historia que no quieres que se pierda.',
    placeholder: 'Quiero recordar que…',
  },
  legacy: {
    title: 'Lo que me enseñó',
    prompt: 'Escribe algo que esa persona dejó sembrado en ti.',
    placeholder: 'Algo que aprendí de esta persona fue…',
  },
  special_moment: {
    title: 'Un momento que no quiero olvidar',
    prompt: 'Guarda una escena, una conversación o un instante especial.',
    placeholder: 'Recuerdo aquel día en que…',
  },
  gratitude: {
    title: 'Algo que agradezco',
    prompt: 'Pon en palabras algo por lo que hoy puedes dar gracias.',
    placeholder: 'Gracias por…',
  },
  photo: {
    title: 'Fotografía',
    prompt: 'Las fotografías se gestionan desde la galería de Recuerdos.',
    placeholder: 'Una fotografía especial…',
  },
  other: {
    title: 'Guardar un recuerdo',
    prompt: 'Escribe aquello que quieras conservar.',
    placeholder: 'Quiero guardar este recuerdo…',
  },
};

function normalizeCategory(value: string | string[] | undefined): MemoryCategory {
  const category = Array.isArray(value) ? value[0] : value;
  if (
    category === 'story' ||
    category === 'legacy' ||
    category === 'special_moment' ||
    category === 'gratitude'
  ) {
    return category;
  }
  return 'other';
}

export default function NewMemoryScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = normalizeCategory(params.category);
  const copy = labels[category];

  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  const canSave = useMemo(() => Boolean(journey && content.trim()), [content, journey]);

  async function handleSave() {
    if (!journey || !canSave || saving) return;

    setSaving(true);
    try {
      await createTextMemory(db, {
        lovedOneId: journey.lovedOneId,
        title: title.trim() || null,
        content: content.trim(),
        category,
      });
      router.replace({ pathname: '/memories/list', params: { category } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text style={styles.topTitle}>RECUERDOS</Text>
            <View style={styles.backPlaceholder} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.prompt}</Text>
          </View>

          <TextInput
            maxLength={100}
            onChangeText={setTitle}
            placeholder="Título opcional"
            placeholderTextColor={colors.inkSoft}
            style={styles.titleInput}
            value={title}
          />

          <TextInput
            multiline
            onChangeText={setContent}
            placeholder={copy.placeholder}
            placeholderTextColor={colors.inkSoft}
            style={styles.editor}
            textAlignVertical="top"
            value={content}
          />

          <Text style={styles.privacy}>
            Este recuerdo queda privado en tu dispositivo y podrá sincronizarse de forma segura cuando actives respaldo.
          </Text>

          <PrimaryButton disabled={!canSave || saving} label="Guardar recuerdo" onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backPlaceholder: { width: 40, height: 40 },
  backText: { color: colors.navy, fontSize: 38, lineHeight: 40 },
  topTitle: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  titleInput: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontSize: typeScale.body,
    paddingHorizontal: spacing.md,
  },
  editor: {
    minHeight: 320,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: typeScale.body,
    lineHeight: 28,
    padding: spacing.lg,
  },
  privacy: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
});
