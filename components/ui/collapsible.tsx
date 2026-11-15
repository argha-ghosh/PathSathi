// components/ui/collapsible.tsx — stub (not used by PathSathi student module)
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity onPress={() => setIsOpen((v) => !v)} style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '600' },
  content: { marginTop: 6, marginLeft: 24 },
});
