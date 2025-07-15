import { theme } from '@/styles/theme';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { RadioButton } from 'react-native-paper';

type RadioButtonProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function RadionComponent({
  value,
  onChange,
  disabled,
}: RadioButtonProps) {
  return (
    <View>
      <RadioButton.Group key={value} onValueChange={onChange} value={value}>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="nao" color="#162B4D" disabled={disabled} />
            <Text>Não</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="sim" color="#162B4D" disabled={disabled} />
            <Text>Sim</Text>
          </View>
        </View>
      </RadioButton.Group>
    </View>
  );
}
