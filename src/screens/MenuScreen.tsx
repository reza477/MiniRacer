import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import Screen from '@ui/Screen';
import PrimaryButton from '@ui/PrimaryButton';
import { theme } from '@app/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

const MenuScreen = ({ navigation }: Props) => {
  const handleQuit = () => {
    console.log('[MiniRacer] Quit tapped');
  };

  return (
    <Screen style={styles.container} testID="MenuScreen">
      <View style={styles.content}>
        <Text style={styles.title}>MiniRacer</Text>
        <Text style={styles.subtitle}>Pick an option to get started.</Text>

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Play" onPress={() => navigation.navigate('Game')} />
          <PrimaryButton
            label="Settings"
            variant="secondary"
            onPress={() => navigation.navigate('Settings')}
          />
          <PrimaryButton label="Quit" variant="ghost" onPress={handleQuit} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  subtitle: {
    color: theme.textSecondary,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
});

export default MenuScreen;
