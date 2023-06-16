import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material';
import Root from './Root';
import './index.css';
import './libraries/server/index.ts'; // This does the magic

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: '/graphql'
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ApolloProvider client={client}>
        <Root />
      </ApolloProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);
