import './App.css';

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './comps/context/ThemeProvider';
import UserProvider from './comps/context/UserProvider';
import Pages from "./pages"

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <UserProvider>
          <Pages />
        </UserProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
