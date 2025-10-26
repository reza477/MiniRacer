import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@app/theme/colors';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  testID?: string;
};

const Screen = ({ children, style, scrollable = false, testID }: ScreenProps) => {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, style]} testID={testID}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]} testID={testID}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default Screen;
