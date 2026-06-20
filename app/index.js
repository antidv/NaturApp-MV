// app/index.js
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirige automáticamente a la carpeta (tabs) y a la ruta home
  return <Redirect href="/tabs/home" />;
}