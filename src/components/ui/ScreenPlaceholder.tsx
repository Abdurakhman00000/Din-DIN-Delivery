// Временный экран-заглушка (до готового дизайна)
import { Text, View } from 'react-native';

type ScreenPlaceholderProps = {
  title: string;
};

export function ScreenPlaceholder({ title }: ScreenPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg">{title}</Text>
    </View>
  );
}
