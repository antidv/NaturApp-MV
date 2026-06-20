import { View, Text, Switch, TextInput, Button } from 'react-native';
import { useProfile } from '../../src/viewmodels/useProfile';

export default function ProfileScreen() {
  const { name, setName, email, setEmail, darkTheme, toggleTheme, saveProfile } = useProfile();
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Nombre:</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <Text>Tema Oscuro:</Text>
      <Switch value={darkTheme} onValueChange={toggleTheme} />
      <Button title="Guardar Perfil" onPress={saveProfile} />
    </View>
  );
}