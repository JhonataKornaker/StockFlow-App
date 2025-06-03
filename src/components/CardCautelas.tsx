import { Cautela } from '@/types/Cautelas';
import { CheckCircle } from 'lucide-react-native';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  cautelas: Cautela;
}

export default function CardCautelas({ cautelas }: Props) {
  return (
    <SafeAreaView className="p-4 rounded-[10px] bg-white">
      <View className="flex flex-row justify-between mb-3">
        <Text className="text-[10px] text-primary font-bold">
          {cautelas.funcaoColaborador}
        </Text>
        <Text className="text-[14px] text-primary font-bold">
          {cautelas.nomeColaborador}
        </Text>
        <Text className="text-[10px] text-primary font-bold">
          {cautelas.empresaColaborador}
        </Text>
      </View>

      {/* Ferramentas */}
      {cautelas.ferramentas.map((item, index) => (
        <View key={item.id}>
          <View className="flex flex-row justify-between py-[5px] gap-2 items-center">
            <Text>{item.quantidade} UND</Text>
            <Text className="flex-1 text-center">{item.descricao}</Text>
            <Text>{cautelas.dataCautela}</Text>
            <TouchableOpacity>
              <CheckCircle size={24} />
            </TouchableOpacity>
          </View>
          {index < cautelas.ferramentas.length - 1 && (
            <View className="border-b border-gray-300 my-1" />
          )}
        </View>
      ))}

      <View className="border-b border-gray-300 my-2" />

      {/* Patrimônios */}
      {cautelas.patrimonios.map((item, index) => (
        <View key={item.id}>
          <View className="flex flex-row justify-between py-[5px] gap-2 items-center">
            <Text>{item.numeroSerie}</Text>
            <Text className="flex-1 text-center">{item.descricao}</Text>
            <Text>{cautelas.dataCautela}</Text>
            <TouchableOpacity>
              <CheckCircle size={24} />
            </TouchableOpacity>
          </View>
          {index < cautelas.patrimonios.length - 1 && (
            <View className="border-b border-gray-300 my-1" />
          )}
        </View>
      ))}
    </SafeAreaView>
  );
}
