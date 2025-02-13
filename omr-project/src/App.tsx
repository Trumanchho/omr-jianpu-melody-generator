import CharGrid from './components/CharGrid';
import ImageList from './components/ImageList';
import CharGridProvider from './contexts/charGridContext';
import TokensProvider from './contexts/tokenContext';
import IsPredictingProvider from './contexts/isPredictingContext';

function App() {
  return (
    <div>
      <h1>Jianpu Scanner</h1>
      <TokensProvider>
      <CharGridProvider>
      <IsPredictingProvider>
        <ImageList/>
        <CharGrid/>
      </IsPredictingProvider>
      </CharGridProvider>
      </TokensProvider>
    </div>
  );
}

export default App;