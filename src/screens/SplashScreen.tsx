import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import Screen from '@ui/Screen';
import { RootStackParamList } from '@app/navigation/types';
import { theme } from '@app/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Menu');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen style={styles.root} testID="SplashScreen">
      <Animated.View
        entering={FadeInUp.duration(600)}
        exiting={FadeOut}
        style={styles.logoBlock}
      >
        <Text style={styles.tagline}>Booting Garage Systems...</Text>
        <Text style={styles.logo}>MiniRacer</Text>
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  logoBlock: {
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    color: theme.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: theme.accent,
    letterSpacing: 2,
  },
});

export default SplashScreen;
