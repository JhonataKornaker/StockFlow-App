import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export async function login(email: string, senha: string) {
    const response = await api.post('/login', {email, senha});
    const {token} = response.data;
    
    await AsyncStorage.setItem('token', token);
    return token;
}