import { Image, Text, TextInput, View } from "react-native";
import { Screen } from "../components/ScreenProps";
import { Input } from "../components/Input";
import { Lock, Mail } from "lucide-react-native";
import { Button } from "../components/Button";

export default function LoginScreen() {
    return(
        <Screen className="items-center">
            <Image 
                source={require('../../assets/img_login.png')}
                style={{ width: '100%', height: 390}}
            />
            <View className="flex-row items-center w-[293px] h-[35px] rounded-[30px] bg-[#DCDCDC]">
                <Mail size={20} style={{ marginLeft: 15 }} color="#080873" />
                <TextInput 
                className="flex-1 ml-1 mr-4"
                placeholder="E-mail"
                placeholderTextColor="rgba(0, 0, 0, 0.25)" />
            </View>
            <View className="flex-row items-center w-[293px] h-[35px] rounded-[30px] bg-[#DCDCDC] mt-[60px]">
                <Lock size={20} style={{ marginLeft: 15 }} color="#080873" />
                <TextInput 
                className="flex-1 ml-1 mr-4"
                placeholder="Senha"
                placeholderTextColor="rgba(0, 0, 0, 0.25)"
                secureTextEntry={true} />
            </View>
            <Button
            className="mt-[60px] bg-[#DCDCDC] w-[170px] h-[30px] rounded-[30px]"
            title="Entrar"/>
            <View className="mt-[60px] items-center">
                <Text className="text-black/25">
                    Esqueceu sua senha?
                </Text>
                <Text className="text-black/25">
                    Solicite ao administrador para altera-lá
                </Text>
            </View>
        </Screen>
    )
}