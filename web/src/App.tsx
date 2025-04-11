import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './services/api';
// import Login from './pages/Login';
import Chat from './pages/Chat';
// import NotFound from './pages/NotFound';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={<Chat />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
