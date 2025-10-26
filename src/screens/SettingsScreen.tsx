import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { RootStackParamList } from '@app/navigation/types';
import Screen from '@ui/Screen';
import PrimaryButton from '@ui/PrimaryButton';
import { theme } from '@app/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <Screen scrollable testID="SettingsScreen">
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Dial in your cockpit preferences.</Text>

      <View style={styles.card}>
        <Row
          title="Engine audio"
          subtitle="Toggle race ambience and UI cues."
          value={soundEnabled}
          onChange={setSoundEnabled}
        />
        <Row
          title="Haptics"
          subtitle="Vibrate on collisions and boosters."
          value={hapticsEnabled}
          onChange={setHapticsEnabled}
        />
        <Row
          title="Auto-save runs"
          subtitle="Push each session to the cloud garage."
          value={autoSave}
          onChange={setAutoSave}
        />
      </View>

      <PrimaryButton
        label="Done"
        variant="secondary"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
};

type RowProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const Row = ({ title, subtitle, value, onChange }: RowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? theme.accent : '#1f2937'}
        trackColor={{ false: '#1f2937', true: theme.accentAlt }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: theme.textPrimary,
  },
  subtitle: {
    color: theme.textSecondary,
    marginBottom: 24,
  },
  card: {
    borderRadius: 18,
    backgroundColor: theme.surface,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    color: theme.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  rowSubtitle: {
    color: theme.textSecondary,
  },
});

export default SettingsScreen;
