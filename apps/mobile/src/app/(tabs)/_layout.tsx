import { Tabs } from 'expo-router';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { colors, typeScale } from '@/design/tokens';

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }) {
  return <Text style={[styles.icon, { color }]}>{symbol}</Text>;
}

export default function MainTabsLayout() {
  return (
    <Tabs
      initialRouteName="today"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="⌂" />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Mi Camino',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="⌁" />,
        }}
      />
      <Tabs.Screen
        name="pray"
        options={{
          title: 'Orar',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="✝" />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Recuerdos',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="▣" />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Para mí',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="○" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    minHeight: 64,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: colors.creamElevated,
    borderTopColor: colors.line,
  },
  label: {
    fontSize: typeScale.caption - 1,
    fontWeight: '600',
  },
  icon: {
    fontSize: 22,
    lineHeight: 24,
  },
});
