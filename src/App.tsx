import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./helpers/provider/ThemeProvider";
import { AuthProvider } from "./helpers/provider/AuthProvider";


export function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme"> 
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
