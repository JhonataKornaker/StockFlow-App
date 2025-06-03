import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, Text } from 'react-native';

export default function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: '#162B4D', flex: 1 }}
    >
      <View className="p-5 rounded-lg w-screen bg-[#C5D4EB] flex flex-row items-center gap-4">
        <View
          className=" border-primary justify-center items-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 48 / 2,
          }}
        >
          <Text className="text-white font-bold text-lg">JK</Text>
        </View>
        <Text className="text-primary text-sm font-bold">
          Jhonata Kornaker!
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
