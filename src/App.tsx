import './App.css';

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './comps/context/ThemeProvider';
import Pages from "./pages"

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Pages />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
