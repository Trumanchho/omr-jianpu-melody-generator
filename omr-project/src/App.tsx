import FileInput from './components/FileInput';
import ImageList from './components/ImageList';
import CharGridProvider from './contexts/charGridContext';
import { TokensProvider } from './contexts/tokenContext';

function App() {
  return (
    <div>
      <h1>Jianpu Scanner</h1>
      <TokensProvider>
      <CharGridProvider>
        <ImageList></ImageList>
        <FileInput/>
      </CharGridProvider>
      </TokensProvider>
    </div>
  );
}

export default App;