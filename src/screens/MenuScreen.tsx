import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import Screen from '@ui/Screen';
import PrimaryButton from '@ui/PrimaryButton';
import { theme } from '@app/theme/colors';

const featureCards = [
  { title: 'Sprint Runs', subtitle: 'Beat your best time and earn coins.' },
  { title: 'Garage Lab', subtitle: 'Tune your micro racer for max boost.' },
  { title: 'Photo Mode', subtitle: 'Share cinematic captures with crew.' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

const MenuScreen = ({ navigation }: Props) => {
  return (
    <Screen testID="MenuScreen">
      <Text style={styles.kicker}>Arcade micro racer</Text>
      <Text style={styles.title}>MiniRacer</Text>
      <Text style={styles.subtitle}>
        Build momentum, chase neon trails, and climb the weekly podium.
      </Text>

      <View style={styles.buttonRow}>
        <PrimaryButton label="Start Run" onPress={() => navigation.navigate('Game')} />
        <PrimaryButton
          label="Settings"
          variant="secondary"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <View style={styles.cardGrid}>
        {featureCards.map((card) => (
          <View key={card.title} style={styles.card}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardCopy}>{card.subtitle}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  kicker: {
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 12,
    color: theme.textPrimary,
  },
  subtitle: {
    color: theme.textSecondary,
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  cardGrid: {
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: theme.textPrimary,
  },
  cardCopy: {
    color: theme.textSecondary,
    lineHeight: 20,
  },
});

export default MenuScreen;
