import CharGrid from './components/CharGrid';
import ImageList from './components/ImageList';
import CharGridProvider from './contexts/charGridContext';
import TokensProvider from './contexts/tokenContext';
import IsPredictingProvider from './contexts/isPredictingContext';
import {Helmet} from 'react-helmet'

import './App.css'

function App() {
  return (
    <div id='main'>
      <Helmet>
          <style>{'body { background-color: rgb(50, 50, 50); }'}</style>
      </Helmet>
      <h1>Jianpu Scanner</h1>
      <div>
        <TokensProvider>
        <CharGridProvider>
        <IsPredictingProvider>
          <ImageList/>
          <CharGrid/>
        </IsPredictingProvider>
        </CharGridProvider>
        </TokensProvider>
      </div>
    </div>
  );
}

export default App;